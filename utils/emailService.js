/**
 * Email Utility for sending OTPs via Gmail SMTP
 * Uses Nodemailer with Gmail configuration
 */

const nodemailer = require('nodemailer');

/**
 * Create and configure the email transporter
 * @returns {Object} Nodemailer transporter instance
 */
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Enhanced settings for better delivery to institutional emails
    tls: {
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2'
    },
    // Retry settings
    pool: true,
    maxConnections: 5,
    maxMessages: 10,
    rateDelta: 1000,
    rateLimit: 5,
    // DKIM signing (optional but recommended)
    dkim: {
      domainName: 'gmail.com',
      keySelector: 'default',
      privateKey: process.env.DKIM_PRIVATE_KEY || ''
    }
  });
}

/**
 * Send OTP email to the user
 * @param {string} toEmail - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<Object>} Email sending result
 */
async function sendOTPEmail(toEmail, otp) {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'IIT Patna Auth Gateway'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: toEmail,
      replyTo: process.env.SMTP_USER, // Explicitly set reply-to
      subject: 'Your OTP for IIT Patna Authentication',
      // Add email headers to improve deliverability
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'X-Mailer': 'IIT Patna Auth Gateway',
        'List-Unsubscribe': '<mailto:' + process.env.SMTP_USER + '>',
      },
      // Message ID for better tracking
      messageId: '<' + Date.now() + '.' + Math.random().toString(36).substr(2, 9) + '@iitp-auth-gateway>',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
                border-radius: 10px;
              }
              .header {
                text-align: center;
                padding: 20px 0;
                background-color: #0066cc;
                color: white;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background-color: white;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .otp-code {
                font-size: 32px;
                font-weight: bold;
                color: #0066cc;
                text-align: center;
                padding: 20px;
                background-color: #f0f0f0;
                border-radius: 5px;
                letter-spacing: 5px;
                margin: 20px 0;
              }
              .warning {
                color: #d9534f;
                font-size: 14px;
                text-align: center;
                margin-top: 20px;
              }
              .footer {
                text-align: center;
                color: #777;
                font-size: 12px;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>IIT Patna Authentication</h1>
              </div>
              <div class="content">
                <h2>Your One-Time Password (OTP)</h2>
                <p>Hello,</p>
                <p>You have requested to log in using your IIT Patna email. Please use the following OTP to complete your authentication:</p>
                
                <div class="otp-code">${otp}</div>
                
                <p><strong>This OTP is valid for 5 minutes only.</strong></p>
                
                <p>If you did not request this OTP, please ignore this email and ensure your account is secure.</p>
                
                <div class="warning">
                  ⚠️ Never share this OTP with anyone. IIT Patna staff will never ask for your OTP.
                </div>
                
                <div class="footer">
                  <p>This is an automated email. Please do not reply.</p>
                  <p>&copy; 2025 IIT Patna Auth Gateway</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `Your OTP for IIT Patna Authentication is: ${otp}\n\nThis OTP is valid for 5 minutes only.\n\nIf you did not request this OTP, please ignore this email.`,
    };

    const info = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: info.messageId,
      message: 'OTP sent successfully',
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send OTP email: ' + error.message);
  }
}

/**
 * Verify SMTP configuration
 * @returns {Promise<boolean>} True if configuration is valid
 */
async function verifyEmailConfig() {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('SMTP configuration error:', error);
    return false;
  }
}

module.exports = {
  sendOTPEmail,
  verifyEmailConfig,
};
