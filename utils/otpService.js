/**
 * OTP Generation and Verification Utilities
 * Handles OTP generation and encoding/decoding with JWT
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET;
const OTP_EXPIRY_MINUTES = 5;

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP
 */
function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
}

/**
 * Create a JWT token containing hashed OTP and metadata
 * @param {string} email - User's email address
 * @param {string} otp - Plain text OTP
 * @returns {Promise<string>} JWT token containing hashed OTP
 */
async function createOTPToken(email, otp) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  // Hash the OTP before storing in JWT
  const hashedOTP = await bcrypt.hash(otp, 10);
  
  const payload = {
    email: email.toLowerCase(),
    hashedOTP,
    createdAt: Date.now(),
    expiresAt: Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000),
  };

  // Sign the JWT with expiry
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: `${OTP_EXPIRY_MINUTES}m`,
  });

  return token;
}

/**
 * Verify OTP against the JWT token
 * @param {string} token - JWT token containing hashed OTP
 * @param {string} otp - Plain text OTP provided by user
 * @param {string} email - Email address to verify
 * @returns {Promise<Object>} Verification result
 */
async function verifyOTPToken(token, otp, email) {
  if (!JWT_SECRET) {
    return {
      valid: false,
      error: 'JWT_SECRET is not configured',
    };
  }

  try {
    // Verify and decode the JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if email matches
    if (decoded.email.toLowerCase() !== email.toLowerCase()) {
      return {
        valid: false,
        error: 'Email does not match',
      };
    }

    // Check if token has expired (additional check)
    if (Date.now() > decoded.expiresAt) {
      return {
        valid: false,
        error: 'OTP has expired',
      };
    }

    // Verify the OTP using bcrypt
    const isMatch = await bcrypt.compare(otp, decoded.hashedOTP);

    if (!isMatch) {
      return {
        valid: false,
        error: 'Invalid OTP',
      };
    }

    return {
      valid: true,
      email: decoded.email,
      message: 'OTP verified successfully',
    };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return {
        valid: false,
        error: 'OTP has expired',
      };
    } else if (error.name === 'JsonWebTokenError') {
      return {
        valid: false,
        error: 'Invalid token',
      };
    } else {
      return {
        valid: false,
        error: 'Verification failed: ' + error.message,
      };
    }
  }
}

/**
 * Create a signed verification JWT for client apps
 * @param {Object} userData - User data to include in the token
 * @returns {string} Signed JWT token
 */
function createVerificationToken(userData) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  const payload = {
    ...userData,
    verifiedAt: Date.now(),
    iss: 'iitp-auth-gateway',
  };

  // Sign with 1 hour expiry
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1h',
  });

  return token;
}

/**
 * Verify a verification token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token or error
 */
function verifyVerificationToken(token) {
  if (!JWT_SECRET) {
    return {
      valid: false,
      error: 'JWT_SECRET is not configured',
    };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return {
      valid: true,
      data: decoded,
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
    };
  }
}

module.exports = {
  generateOTP,
  createOTPToken,
  verifyOTPToken,
  createVerificationToken,
  verifyVerificationToken,
  OTP_EXPIRY_MINUTES,
};
