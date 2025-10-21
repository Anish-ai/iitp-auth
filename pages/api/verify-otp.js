/**
 * API Route: /api/verify-otp
 * Verifies the OTP entered by the user
 * 
 * POST Request Body:
 * {
 *   "email": "student_email@iitp.ac.in",
 *   "otp": "123456",
 *   "token": "jwt-token-from-send-otp",
 *   "redirect_uri": "https://client-app.com/callback" (optional)
 * }
 * 
 * Response (Success):
 * {
 *   "success": true,
 *   "message": "OTP verified successfully",
 *   "verificationToken": "signed-jwt-with-user-info",
 *   "userData": { ... },
 *   "redirect_uri": "..."
 * }
 */

const { verifyOTPToken, createVerificationToken } = require('../../utils/otpService');
const { extractStudentInfo, isValidIITPEmail } = require('../../utils/emailParser');

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { email, otp, token, redirect_uri } = req.body;

    // Validate input
    if (!email || !otp || !token) {
      return res.status(400).json({
        success: false,
        error: 'Email, OTP, and token are required',
      });
    }

    // Validate email format
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!isValidIITPEmail(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid IIT Patna email address',
      });
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        error: 'OTP must be a 6-digit number',
      });
    }

    // Verify OTP against the token
    const verificationResult = await verifyOTPToken(token, otp, trimmedEmail);

    if (!verificationResult.valid) {
      return res.status(401).json({
        success: false,
        error: verificationResult.error || 'OTP verification failed',
      });
    }

    // Extract student information from email
    const studentInfo = extractStudentInfo(trimmedEmail);

    if (!studentInfo.valid) {
      return res.status(400).json({
        success: false,
        error: 'Failed to extract student information: ' + studentInfo.error,
      });
    }

    // Create verification token for client apps
    const userData = {
      email: studentInfo.email,
      name: studentInfo.name,
      rollNumber: studentInfo.rollNumber,
      admissionYear: studentInfo.admissionYear,
      degree: studentInfo.degree,
      degreeCode: studentInfo.degreeCode,
      branch: studentInfo.branch,
      branchCode: studentInfo.branchCode,
      verified: true,
    };

    const verificationToken = createVerificationToken(userData);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      verificationToken: verificationToken,
      userData: userData,
      redirect_uri: redirect_uri || null,
    });

  } catch (error) {
    console.error('Error in verify-otp:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error: ' + error.message,
    });
  }
}
