/**
 * API Route: /api/send-otp
 * Generates and sends OTP to the user's email
 * 
 * POST Request Body:
 * {
 *   "email": "student_email@iitp.ac.in",
 *   "redirect_uri": "https://client-app.com/callback" (optional)
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "OTP sent successfully",
 *   "token": "jwt-token-containing-hashed-otp",
 *   "expiresIn": 300
 * }
 */

const { isValidIITPEmail } = require('../../utils/emailParser');
const { generateOTP, createOTPToken, OTP_EXPIRY_MINUTES } = require('../../utils/otpService');
const { sendOTPEmail } = require('../../utils/emailService');
const { checkRateLimit } = require('../../utils/rateLimiter');

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { email, redirect_uri } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    // Validate email format
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!isValidIITPEmail(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Only @iitp.ac.in email addresses are allowed',
      });
    }

    // Check rate limiting
    const rateLimitResult = checkRateLimit(trimmedEmail);
    
    if (!rateLimitResult.allowed) {
      return res.status(429).json({
        success: false,
        error: rateLimitResult.message,
        retryAfter: rateLimitResult.retryAfter,
      });
    }

    // Generate OTP
    const otp = generateOTP();
    
    console.log(`[OTP] Generated OTP for ${trimmedEmail}: ${otp}`); // For development only
    
    // Create JWT token with hashed OTP
    const token = await createOTPToken(trimmedEmail, otp);

    // Send OTP via email
    try {
      await sendOTPEmail(trimmedEmail, otp);
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      return res.status(500).json({
        success: false,
        error: 'Failed to send OTP email. Please check your email configuration.',
      });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email',
      token: token,
      expiresIn: OTP_EXPIRY_MINUTES * 60, // in seconds
      email: trimmedEmail,
      redirect_uri: redirect_uri || null,
    });

  } catch (error) {
    console.error('Error in send-otp:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error: ' + error.message,
    });
  }
}
