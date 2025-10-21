/**
 * API Route: /api/extract-info
 * Extracts student information from IIT Patna email
 * 
 * POST Request Body:
 * {
 *   "email": "student_email@iitp.ac.in"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "name": "student_name",
 *     "rollNumber": "2301mc40",
 *     "admissionYear": 2023,
 *     "degree": "B.Tech",
 *     "branch": "Mathematics & Computing",
 *     ...
 *   }
 * }
 */

const { extractStudentInfo, isValidIITPEmail } = require('../../utils/emailParser');

export default async function handler(req, res) {
  // Allow both GET and POST requests
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    // Get email from query params (GET) or body (POST)
    const email = req.method === 'GET' ? req.query.email : req.body.email;

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

    // Extract student information
    const studentInfo = extractStudentInfo(trimmedEmail);

    if (!studentInfo.valid) {
      return res.status(400).json({
        success: false,
        error: studentInfo.error,
      });
    }

    // Return extracted information
    return res.status(200).json({
      success: true,
      data: {
        email: studentInfo.email,
        name: studentInfo.name,
        rollNumber: studentInfo.rollNumber,
        admissionYear: studentInfo.admissionYear,
        degree: studentInfo.degree,
        degreeCode: studentInfo.degreeCode,
        branch: studentInfo.branch,
        branchCode: studentInfo.branchCode,
        serialNumber: studentInfo.serialNumber,
      },
    });

  } catch (error) {
    console.error('Error in extract-info:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error: ' + error.message,
    });
  }
}
