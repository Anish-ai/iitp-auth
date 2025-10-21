# IIT Patna OTP Authentication Gateway

A secure, centralized OTP authentication gateway for IIT Patna students. This serverless application provides JWT-based stateless authentication for multiple web and mobile applications.

## 🌟 Features

- **Secure OTP Authentication**: 6-digit OTP sent via email with 5-minute expiry
- **Stateless Verification**: JWT-based authentication without database or Redis
- **Email Domain Validation**: Only accepts @iitp.ac.in email addresses
- **Student Info Extraction**: Automatically parses roll number, branch, degree, and admission year
- **Rate Limiting**: Maximum 1 OTP request per email per minute
- **Serverless Architecture**: Fully deployable on Vercel using Next.js API routes
- **Secure Redirects**: Client apps receive signed JWT tokens for verification

## 📋 Prerequisites

- Node.js 18+ installed
- Gmail account with App Password enabled
- Vercel account (for deployment)

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Navigate to the project directory
cd iitp-otp-auth

# Install dependencies
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password

# JWT Secret (use a strong random string)
JWT_SECRET=your-very-strong-secret-key-change-this-in-production

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# From Email
FROM_EMAIL=noreply@iitp.ac.in
FROM_NAME=IIT Patna Auth Gateway
```

### 3. Set Up Gmail App Password

1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification
3. Scroll down and click on "App passwords"
4. Generate a new app password for "Mail"
5. Copy the 16-character password to `SMTP_PASS` in `.env.local`

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
iitp-otp-auth/
├── pages/
│   ├── api/
│   │   ├── send-otp.js         # Send OTP to email
│   │   ├── verify-otp.js       # Verify OTP and return user data
│   │   └── extract-info.js     # Extract info from IITP email
│   ├── _app.js                 # Next.js app wrapper
│   ├── index.js                # Home page (redirects to /auth)
│   ├── auth.js                 # OTP request page
│   └── verify.js               # OTP verification page
├── utils/
│   ├── emailService.js         # Email sending with Nodemailer
│   ├── otpService.js           # OTP generation and JWT handling
│   ├── emailParser.js          # Parse IITP email format
│   └── rateLimiter.js          # In-memory rate limiting
├── styles/
│   └── globals.css             # Global styles
├── .env.local.example          # Environment variables template
├── .gitignore
├── next.config.js
├── package.json
└── README.md
```

## 🔐 Security Features

### JWT-Based Stateless Authentication

- OTPs are hashed using bcrypt before storing in JWT
- Tokens are signed with `JWT_SECRET` and include expiry timestamps
- Verification tokens contain user data and cannot be forged

### Rate Limiting

- Maximum 1 OTP request per email per minute
- In-memory implementation (resets on serverless cold starts)
- For production, consider Vercel Edge Config or external service

### Email Validation

- Only @iitp.ac.in domain accepted
- Roll number format validation
- Proper error messages for invalid formats

### HTTPS Enforcement

- All communications should be over HTTPS
- Vercel automatically provides SSL certificates

## 🔄 User Flow

### 1. Authentication Request

Client app redirects user to:
```
https://your-gateway.vercel.app/auth?redirect_uri=https://client-app.com/callback
```

### 2. OTP Generation

- User enters IITP email (e.g., `anish_2301mc40@iitp.ac.in`)
- Gateway generates 6-digit OTP
- OTP sent via email
- Hashed OTP stored in signed JWT token

### 3. OTP Verification

- User enters OTP on verification page
- Gateway verifies OTP against JWT
- Extracts student information from email

### 4. Redirect with Token

On success, user is redirected to:
```
https://client-app.com/callback?token=<verification-jwt>&success=true
```

Client app can verify the token to ensure authenticity.

## 📧 Email Format Parsing

The gateway automatically extracts information from IITP email addresses:

**Format**: `name_rollnumber@iitp.ac.in`

**Roll Number Format**: `YYDDBBXX`
- `YY` = Admission year (23 = 2023)
- `DD` = Degree code (01 = B.Tech, 02 = Dual Degree)
- `BB` = Branch code (mc = Mathematics & Computing, cs = Computer Science)
- `XX` = Serial number

**Example**: `anish_2301mc40@iitp.ac.in`
- Name: anish
- Roll: 2301mc40
- Year: 2023
- Degree: B.Tech
- Branch: Mathematics & Computing

### Supported Branch Codes

| Code | Branch |
|------|--------|
| cs | Computer Science |
| mc | Mathematics & Computing |
| ee | Electrical Engineering |
| ec | Electronics and Communication Engineering |
| me | Mechanical Engineering |
| ce | Civil Engineering |
| ch | Chemical Engineering |
| mm | Metallurgical and Materials Engineering |
| ai | Artificial Intelligence |
| ds | Data Science |

## 🌐 API Endpoints

### POST /api/send-otp

Send OTP to user's email.

**Request Body:**
```json
{
  "email": "student_email@iitp.ac.in",
  "redirect_uri": "https://client-app.com/callback"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "token": "jwt-token-containing-hashed-otp",
  "expiresIn": 300,
  "email": "student_email@iitp.ac.in"
}
```

### POST /api/verify-otp

Verify OTP and return user data.

**Request Body:**
```json
{
  "email": "student_email@iitp.ac.in",
  "otp": "123456",
  "token": "jwt-token-from-send-otp",
  "redirect_uri": "https://client-app.com/callback"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "verificationToken": "signed-jwt-with-user-info",
  "userData": {
    "email": "student_email@iitp.ac.in",
    "name": "student_name",
    "rollNumber": "2301mc40",
    "admissionYear": 2023,
    "degree": "B.Tech",
    "branch": "Mathematics & Computing",
    "verified": true
  }
}
```

### GET|POST /api/extract-info

Extract student information from email.

**Request:**
```json
{
  "email": "student_email@iitp.ac.in"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "email": "student_email@iitp.ac.in",
    "name": "student_name",
    "rollNumber": "2301mc40",
    "admissionYear": 2023,
    "degree": "B.Tech",
    "branch": "Mathematics & Computing"
  }
}
```

## 🚀 Deployment to Vercel

### Using Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Set environment variables in Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add all variables from `.env.local`

### Using Vercel Dashboard

1. Push code to GitHub/GitLab/Bitbucket
2. Import project in Vercel dashboard
3. Configure environment variables
4. Deploy!

### Environment Variables for Production

Make sure to set these in Vercel:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
JWT_SECRET=strong-random-secret-for-production
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
FROM_EMAIL=noreply@iitp.ac.in
FROM_NAME=IIT Patna Auth Gateway
```

## 🧪 Testing

### Test Email Format Parsing

```javascript
// Test with sample IITP emails
fetch('/api/extract-info', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'anish_2301mc40@iitp.ac.in' })
})
```

### Test OTP Flow

1. Go to `/auth`
2. Enter your IITP email
3. Check your email for OTP
4. Enter OTP on `/verify` page
5. View extracted information

## 📝 Integration Guide for Client Apps

### Step 1: Redirect to Gateway

```javascript
const redirectUri = encodeURIComponent('https://your-app.com/callback');
window.location.href = `https://auth-gateway.vercel.app/auth?redirect_uri=${redirectUri}`;
```

### Step 2: Handle Callback

```javascript
// In your callback page
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
const success = urlParams.get('success');

if (success && token) {
  // Verify token (optional - check signature)
  // Store token in session/localStorage
  // Redirect to authenticated area
}
```

### Step 3: Verify Token (Optional)

```javascript
// Verify JWT signature using the same JWT_SECRET
const jwt = require('jsonwebtoken');

try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('User data:', decoded);
  // Use decoded.email, decoded.name, decoded.rollNumber, etc.
} catch (error) {
  console.error('Invalid token');
}
```

## ⚠️ Important Notes

### Rate Limiting in Serverless

The in-memory rate limiter resets on serverless cold starts. For production:

- Consider using Vercel Edge Config
- Use Redis with Upstash (free tier available)
- Implement IP-based rate limiting with Vercel Edge Middleware

### Email Security

- Use App Passwords, not your actual Gmail password
- Enable 2-Factor Authentication on Gmail
- Consider using a dedicated email service like SendGrid or AWS SES for production

### JWT Secret

- Generate a strong random secret (at least 32 characters)
- Never commit JWT_SECRET to version control
- Use different secrets for development and production

## 🛠️ Troubleshooting

### Email Not Sending

1. Check SMTP credentials in `.env.local`
2. Verify App Password is correct
3. Check Gmail account security settings
4. Review server logs for error messages

### OTP Expired

- OTPs expire after 5 minutes
- Request a new OTP if expired
- Check server time synchronization

### Invalid Email Format

- Ensure email follows pattern: `name_rollnumber@iitp.ac.in`
- Roll number must start with year digits
- Check branch and degree codes are valid

## 📄 License

This project is open source and available for use by IIT Patna and its students.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Contact IIT Patna IT Support

---

**Made with ❤️ for IIT Patna**
