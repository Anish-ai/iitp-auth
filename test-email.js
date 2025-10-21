/**
 * Email Delivery Test Script
 * Run this to test and diagnose email delivery issues
 */

// Load environment variables from .env.local
const fs = require('fs');
const path = require('path');

// Simple .env parser (no external dependencies needed)
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...values] = line.split('=');
      if (key && values.length) {
        process.env[key.trim()] = values.join('=').trim();
      }
    }
  });
}

const nodemailer = require('nodemailer');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(color, message) {
  console.log(color + message + colors.reset);
}

async function testEmailDelivery() {
  log(colors.bright + colors.blue, '\n=== IIT Patna Auth Gateway - Email Delivery Test ===\n');

  // Step 1: Check environment variables
  log(colors.yellow, '1. Checking environment variables...');
  
  const requiredVars = ['SMTP_USER', 'SMTP_PASS', 'SMTP_HOST', 'SMTP_PORT'];
  const missingVars = requiredVars.filter(v => !process.env[v]);
  
  if (missingVars.length > 0) {
    log(colors.red, `❌ Missing environment variables: ${missingVars.join(', ')}`);
    log(colors.yellow, 'Please check your .env.local file');
    return;
  }
  
  log(colors.green, '✓ All environment variables present');
  log(colors.blue, `   SMTP_USER: ${process.env.SMTP_USER}`);
  log(colors.blue, `   SMTP_HOST: ${process.env.SMTP_HOST}`);
  log(colors.blue, `   SMTP_PORT: ${process.env.SMTP_PORT}`);

  // Step 2: Test SMTP connection
  log(colors.yellow, '\n2. Testing SMTP connection...');
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2'
    },
    debug: true, // Enable debug output
    logger: true // Log to console
  });

  try {
    await transporter.verify();
    log(colors.green, '✓ SMTP connection successful');
  } catch (error) {
    log(colors.red, '❌ SMTP connection failed:');
    log(colors.red, '   ' + error.message);
    log(colors.yellow, '\nPossible fixes:');
    log(colors.yellow, '   1. Check if App Password is correct (16 characters)');
    log(colors.yellow, '   2. Ensure 2-Step Verification is enabled on Gmail');
    log(colors.yellow, '   3. Check if "Less secure app access" needs to be enabled');
    return;
  }

  // Step 3: Prompt for test email
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question('\n3. Enter your IIT Patna email to test: ', async (toEmail) => {
    readline.close();

    if (!toEmail.endsWith('@iitp.ac.in')) {
      log(colors.yellow, '⚠️  Warning: Email is not @iitp.ac.in domain');
    }

    log(colors.yellow, '\n4. Sending test email...');
    
    const testOTP = '123456';
    const messageId = Date.now() + '.' + Math.random().toString(36).substr(2, 9) + '@iitp-auth-gateway';
    
    try {
      const info = await transporter.sendMail({
        from: `"${process.env.FROM_NAME || 'IIT Patna Auth Gateway'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
        to: toEmail,
        replyTo: process.env.SMTP_USER,
        subject: 'Test OTP - IIT Patna Authentication Gateway',
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high',
          'X-Mailer': 'IIT Patna Auth Gateway Test',
        },
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
              <div style="max-width: 600px; margin: 0 auto; border: 2px solid #0066cc; border-radius: 10px; padding: 20px;">
                <h2 style="color: #0066cc;">Email Delivery Test - SUCCESS!</h2>
                <p>This is a test email from IIT Patna Auth Gateway.</p>
                <div style="background: #f0f0f0; padding: 20px; margin: 20px 0; border-radius: 5px;">
                  <p style="font-size: 24px; font-weight: bold; text-align: center; color: #0066cc; margin: 0;">
                    Test OTP: ${testOTP}
                  </p>
                </div>
                <p><strong>If you received this email, your SMTP configuration is working correctly!</strong></p>
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #ccc;">
                <p style="color: #666; font-size: 12px;">
                  Sent at: ${new Date().toLocaleString()}<br>
                  Message ID: ${messageId}<br>
                  From: ${process.env.SMTP_USER}<br>
                  To: ${toEmail}
                </p>
              </div>
            </body>
          </html>
        `,
        text: `
Test Email - IIT Patna Auth Gateway

This is a test email to verify SMTP delivery.

Test OTP: ${testOTP}

If you received this email, your configuration is working!

Sent at: ${new Date().toLocaleString()}
Message ID: ${messageId}
From: ${process.env.SMTP_USER}
To: ${toEmail}
        `
      });

      log(colors.green, '\n✅ Email sent successfully!');
      log(colors.blue, '\nEmail Details:');
      log(colors.blue, `   Message ID: ${info.messageId}`);
      log(colors.blue, `   Response: ${info.response}`);
      log(colors.blue, `   Accepted: ${info.accepted.join(', ')}`);
      if (info.rejected.length > 0) {
        log(colors.red, `   Rejected: ${info.rejected.join(', ')}`);
      }

      log(colors.yellow, '\n📋 Next Steps:');
      log(colors.yellow, '   1. Check your inbox: ' + toEmail);
      log(colors.yellow, '   2. Check spam/junk folder');
      log(colors.yellow, '   3. Wait 1-2 minutes for delivery');
      log(colors.yellow, '   4. If not received, check Gmail "Sent" folder to confirm it was sent');
      
      log(colors.blue, '\n💡 Tips for better delivery:');
      log(colors.blue, '   • Add authiitp@gmail.com to your contacts');
      log(colors.blue, '   • Mark test emails as "Not Spam" if they go to spam');
      log(colors.blue, '   • Check your college email filters/rules');
      log(colors.blue, '   • Contact IT department if institutional blocking is suspected');

    } catch (error) {
      log(colors.red, '\n❌ Failed to send email:');
      log(colors.red, '   ' + error.message);
      
      log(colors.yellow, '\n🔍 Debugging information:');
      log(colors.yellow, '   Error code: ' + (error.code || 'N/A'));
      log(colors.yellow, '   Error command: ' + (error.command || 'N/A'));
      
      log(colors.yellow, '\n🔧 Possible solutions:');
      log(colors.yellow, '   1. Verify Gmail App Password is correct');
      log(colors.yellow, '   2. Check if recipient email exists');
      log(colors.yellow, '   3. Try sending to a different email first');
      log(colors.yellow, '   4. Check Gmail account for security alerts');
      log(colors.yellow, '   5. Ensure your IP is not blacklisted');
    }

    log(colors.bright + colors.blue, '\n=== Test Complete ===\n');
  });
}

// Run the test
testEmailDelivery().catch(error => {
  log(colors.red, 'Fatal error: ' + error.message);
  process.exit(1);
});
