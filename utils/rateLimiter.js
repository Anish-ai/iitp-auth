/**
 * Rate Limiting Utility
 * Implements in-memory rate limiting without database
 * NOTE: In serverless environment, this resets on each cold start
 * For production, consider using Vercel Edge Config or external rate limiting service
 */

// In-memory store for rate limiting
const rateLimitStore = new Map();

// Configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const MAX_REQUESTS_PER_WINDOW = 1; // Max 1 OTP request per email per minute

/**
 * Clean up expired entries from rate limit store
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.expiresAt) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Check if a request should be rate limited
 * @param {string} identifier - Unique identifier (e.g., email address)
 * @returns {Object} Rate limit result
 */
function checkRateLimit(identifier) {
  // Clean up old entries periodically
  if (Math.random() < 0.1) { // 10% chance to cleanup on each call
    cleanupExpiredEntries();
  }

  const now = Date.now();
  const key = identifier.toLowerCase();

  if (rateLimitStore.has(key)) {
    const data = rateLimitStore.get(key);

    // Check if rate limit window has expired
    if (now > data.expiresAt) {
      // Window expired, allow request and reset
      rateLimitStore.set(key, {
        count: 1,
        expiresAt: now + RATE_LIMIT_WINDOW,
        firstRequestAt: now,
      });

      return {
        allowed: true,
        remaining: MAX_REQUESTS_PER_WINDOW - 1,
        resetAt: now + RATE_LIMIT_WINDOW,
      };
    }

    // Within window, check count
    if (data.count >= MAX_REQUESTS_PER_WINDOW) {
      const timeRemaining = Math.ceil((data.expiresAt - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetAt: data.expiresAt,
        retryAfter: timeRemaining,
        message: `Too many requests. Please try again in ${timeRemaining} seconds.`,
      };
    }

    // Increment count
    data.count += 1;
    rateLimitStore.set(key, data);

    return {
      allowed: true,
      remaining: MAX_REQUESTS_PER_WINDOW - data.count,
      resetAt: data.expiresAt,
    };
  }

  // First request
  rateLimitStore.set(key, {
    count: 1,
    expiresAt: now + RATE_LIMIT_WINDOW,
    firstRequestAt: now,
  });

  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - 1,
    resetAt: now + RATE_LIMIT_WINDOW,
  };
}

/**
 * Reset rate limit for a specific identifier (for testing or admin purposes)
 * @param {string} identifier - Unique identifier to reset
 */
function resetRateLimit(identifier) {
  const key = identifier.toLowerCase();
  rateLimitStore.delete(key);
}

/**
 * Get current rate limit status
 * @param {string} identifier - Unique identifier
 * @returns {Object} Current status
 */
function getRateLimitStatus(identifier) {
  const key = identifier.toLowerCase();
  const now = Date.now();

  if (rateLimitStore.has(key)) {
    const data = rateLimitStore.get(key);
    
    if (now > data.expiresAt) {
      return {
        exists: false,
        message: 'No active rate limit',
      };
    }

    return {
      exists: true,
      count: data.count,
      maxRequests: MAX_REQUESTS_PER_WINDOW,
      expiresAt: data.expiresAt,
      timeRemaining: Math.ceil((data.expiresAt - now) / 1000),
    };
  }

  return {
    exists: false,
    message: 'No active rate limit',
  };
}

module.exports = {
  checkRateLimit,
  resetRateLimit,
  getRateLimitStatus,
  RATE_LIMIT_WINDOW,
  MAX_REQUESTS_PER_WINDOW,
};
