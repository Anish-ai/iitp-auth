# API Documentation

Complete API reference for the IIT Patna OTP Authentication Gateway.

Base URL: `https://your-gateway.vercel.app`

## Table of Contents
- [Authentication Flow](#authentication-flow)
- [API Endpoints](#api-endpoints)
- [Error Codes](#error-codes)
- [Rate Limiting](#rate-limiting)
- [Security](#security)
- [Vercel Environment Variables](#vercel-environment-variables)

---

## Authentication Flow

```
┌─────────┐              ┌──────────────┐              ┌───────────┐
│ Client  │              │ Auth Gateway │              │   Gmail   │
│   App   │              │              │              │   SMTP    │
└────┬────┘              └──────┬───────┘              └─────┬─────┘
     │                          │                            │
     │  1. Redirect to /auth    │                            │
     ├─────────────────────────>│                            │
     │                          │                            │
     │  2. User enters email    │                            │
     │                          │                            │
     │  3. POST /api/send-otp   │                            │
     ├─────────────────────────>│                            │
     │                          │                            │
     │                          │  4. Send OTP email         │
     │                          ├───────────────────────────>│
     │                          │                            │
     │  5. Return JWT token     │                            │
     │<─────────────────────────┤                            │
     │                          │                            │
     │  6. User enters OTP      │                            │
     │                          │                            │
     │  7. POST /api/verify-otp │                            │
     ├─────────────────────────>│                            │
     │                          │                            │
     │  8. Return verification  │                            │
     │     token + user data    │                            │
     │<─────────────────────────┤                            │
     │                          │                            │
     │  9. Redirect to callback │                            │
     │     with token           │                            │
     │<─────────────────────────┤                            │
     │                          │                            │
```

---

## API Endpoints

### 1. Send OTP

**Endpoint:** `POST /api/send-otp`

Generates a 6-digit OTP and sends it to the user's email address.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "student_email@iitp.ac.in",
  "redirect_uri": "https://your-app.com/callback" // optional
}
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 300,
  "email": "student_email@iitp.ac.in",
  "redirect_uri": "https://your-app.com/callback"
}
```

**Error (400):**
```json
{
  "success": false,
  "error": "Only @iitp.ac.in email addresses are allowed"
}
```

**Error (429):**
```json
{
  "success": false,
  "error": "Too many requests. Please try again in 60 seconds.",
  "retryAfter": 60
}
```

**Error (500):**
```json
{
  "success": false,
  "error": "Failed to send OTP email. Please check your email configuration."
}
```

#### Notes
- OTP is valid for 5 minutes
- Rate limited to 1 request per email per minute
- Token should be stored and used for OTP verification

---

### 2. Verify OTP

**Endpoint:** `POST /api/verify-otp`

Verifies the OTP entered by the user and returns user data.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "student_email@iitp.ac.in",
  "otp": "123456",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "redirect_uri": "https://your-app.com/callback" // optional
}
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "verificationToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userData": {
    "email": "student_email@iitp.ac.in",
    "name": "student_name",
    "rollNumber": "2301mc40",
    "admissionYear": 2023,
    "degree": "B.Tech",
    "degreeCode": "01",
    "branch": "Mathematics & Computing",
    "branchCode": "mc",
    "verified": true
  },
  "redirect_uri": "https://your-app.com/callback"
}
```

**Error (400):**
```json
{
  "success": false,
  "error": "OTP must be a 6-digit number"
}
```

**Error (401):**
```json
{
  "success": false,
  "error": "Invalid OTP"
}
```

**Error (401):**
```json
{
  "success": false,
  "error": "OTP has expired"
}
```

#### Verification Token Structure

The `verificationToken` is a JWT containing:

```json
{
  "email": "student_email@iitp.ac.in",
  "name": "student_name",
  "rollNumber": "2301mc40",
  "admissionYear": 2023,
  "degree": "B.Tech",
  "degreeCode": "01",
  "branch": "Mathematics & Computing",
  "branchCode": "mc",
  "verified": true,
  "verifiedAt": 1729545600000,
  "iss": "iitp-auth-gateway",
  "iat": 1729545600,
  "exp": 1729549200
}
```

---

### 3. Extract Student Info

**Endpoint:** `GET /api/extract-info` or `POST /api/extract-info`

Extracts student information from IIT Patna email format without authentication.

#### Request (GET)

**Query Parameters:**
```
?email=student_email@iitp.ac.in
```

#### Request (POST)

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "student_email@iitp.ac.in"
}
```

#### Response

**Success (200):**
```json
{
  "success": true,
  "data": {
    "email": "student_email@iitp.ac.in",
    "name": "student_name",
    "rollNumber": "2301mc40",
    "admissionYear": 2023,
    "degree": "B.Tech",
    "degreeCode": "01",
    "branch": "Mathematics & Computing",
    "branchCode": "mc",
    "serialNumber": "40"
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "error": "Only @iitp.ac.in email addresses are allowed"
}
```

**Error (400):**
```json
{
  "success": false,
  "error": "Roll number format is invalid"
}
```

#### Email Format

Expected format: `name_YYDDBBXX@iitp.ac.in`

Where:
- `name` = Student name (can include underscores)
- `YY` = Admission year (23 = 2023)
- `DD` = Degree code (01 = B.Tech, 02 = Dual Degree)
- `BB` = Branch code (mc, cs, ee, etc.)
- `XX` = Serial number (optional)

**Examples:**
- `anish_2301mc40@iitp.ac.in` → Name: anish, Year: 2023, Degree: B.Tech, Branch: Mathematics & Computing
- `john_doe_2202cs15@iitp.ac.in` → Name: john_doe, Year: 2022, Degree: Dual Degree, Branch: Computer Science

---

## Error Codes

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Invalid input parameters |
| 401 | Unauthorized | Invalid or expired OTP/token |
| 405 | Method Not Allowed | Wrong HTTP method used |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error occurred |

### Common Error Messages

| Error Message | Cause | Solution |
|---------------|-------|----------|
| Email is required | Missing email in request | Include email in request body |
| Only @iitp.ac.in email addresses are allowed | Invalid email domain | Use IIT Patna email |
| Too many requests | Rate limit exceeded | Wait 60 seconds before retry |
| OTP has expired | OTP older than 5 minutes | Request new OTP |
| Invalid OTP | Wrong OTP entered | Check email and re-enter |
| Email does not match | Email mismatch in verification | Use same email as OTP request |
| JWT_SECRET is not configured | Missing environment variable | Configure JWT_SECRET |

---

## Rate Limiting

### Limits

- **OTP Requests:** 1 request per email per minute
- **Per IP:** Consider implementing IP-based limits in production

### Rate Limit Headers

Currently not implemented, but recommended for production:

```
X-RateLimit-Limit: 1
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1729545660
```

### Bypassing Rate Limits

Rate limits cannot be bypassed. If you need higher limits:
1. Wait for the rate limit window to expire
2. Contact administrators to adjust limits
3. Implement Redis-based rate limiting for production

---

## Security

### HTTPS Required

All API calls must use HTTPS in production. HTTP is only allowed for localhost development.

### CORS

Currently allows all origins. For production, configure CORS in `next.config.js`:

```javascript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: 'https://your-app.com' },
        { key: 'Access-Control-Allow-Methods', value: 'POST, GET, OPTIONS' },
        { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
      ],
    },
  ];
}
```

### JWT Verification

To verify tokens received from the gateway:

```javascript
const jwt = require('jsonwebtoken');

const decoded = jwt.verify(token, JWT_SECRET);

// Check issuer
if (decoded.iss !== 'iitp-auth-gateway') {
  throw new Error('Invalid token issuer');
}

// Check verification status
if (!decoded.verified) {
  throw new Error('User not verified');
}
```

### Token Expiry

- **OTP Token:** 5 minutes
- **Verification Token:** 1 hour (configurable)

---

## Vercel Environment Variables

If you see this during deployment: "Environment Variable \"SMTP_HOST\" references Secret \"smtp_host\", which does not exist", your `vercel.json` was pointing to Vercel Secrets (values like `@smtp_host`) that haven’t been created.

Fix it in one of two ways:

1) Recommended: Set plain Environment Variables in the Vercel Dashboard
- Vercel → Project → Settings → Environment Variables
- Add (Production or All Environments):
  - `SMTP_HOST` = `smtp.gmail.com`
  - `SMTP_PORT` = `587`
  - `SMTP_USER` = your Gmail address (e.g., `authiitp@gmail.com`)
  - `SMTP_PASS` = your 16-character Gmail App Password
  - `JWT_SECRET` = a strong random string (32+ chars)
  - `FROM_EMAIL` = optional, defaults to `SMTP_USER`
  - `FROM_NAME` = optional, e.g., `IIT Patna Auth Gateway`
  - `NEXT_PUBLIC_APP_URL` = your deployed URL, e.g., `https://your-project.vercel.app`
- Redeploy the project.

2) Alternative: Use Vercel Secrets with `@name` references
- Create secrets named: `smtp_host`, `smtp_port`, `smtp_user`, `smtp_pass`, `jwt_secret`, `from_email`, `from_name`
- Keep `vercel.json` entries like `"SMTP_HOST": "@smtp_host"`
- Redeploy after the secrets exist

Note: In this repo, we removed secret references from `vercel.json` to avoid this error by default. Configure variables in the Vercel Dashboard instead.

---

## Code Examples

### JavaScript/Node.js

```javascript
// Send OTP
const response = await fetch('https://gateway.vercel.app/api/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'student_2301mc40@iitp.ac.in',
    redirect_uri: 'https://myapp.com/callback'
  })
});

const data = await response.json();
console.log('Token:', data.token);

// Verify OTP
const verifyResponse = await fetch('https://gateway.vercel.app/api/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'student_2301mc40@iitp.ac.in',
    otp: '123456',
    token: data.token
  })
});

const verifyData = await verifyResponse.json();
console.log('User:', verifyData.userData);
```

### Python

```python
import requests

# Send OTP
response = requests.post(
    'https://gateway.vercel.app/api/send-otp',
    json={
        'email': 'student_2301mc40@iitp.ac.in',
        'redirect_uri': 'https://myapp.com/callback'
    }
)

data = response.json()
token = data['token']

# Verify OTP
verify_response = requests.post(
    'https://gateway.vercel.app/api/verify-otp',
    json={
        'email': 'student_2301mc40@iitp.ac.in',
        'otp': '123456',
        'token': token
    }
)

user_data = verify_response.json()['userData']
print(f"User: {user_data['name']}")
```

### cURL

```bash
# Send OTP
curl -X POST https://gateway.vercel.app/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"student_2301mc40@iitp.ac.in"}'

# Verify OTP
curl -X POST https://gateway.vercel.app/api/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email":"student_2301mc40@iitp.ac.in",
    "otp":"123456",
    "token":"your-jwt-token"
  }'

# Extract info
curl https://gateway.vercel.app/api/extract-info?email=student_2301mc40@iitp.ac.in
```

---

## Testing

### Test Credentials

For development/testing, use any valid IITP email format:
- `test_2301mc01@iitp.ac.in`
- `demo_2202cs50@iitp.ac.in`

### Postman Collection

Import this JSON into Postman for easy testing:

```json
{
  "info": {
    "name": "IITP Auth Gateway",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Send OTP",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"test_2301mc01@iitp.ac.in\"}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/send-otp",
          "host": ["{{baseUrl}}"],
          "path": ["api", "send-otp"]
        }
      }
    }
  ]
}
```

---

## Support

For API issues or questions:
- Check the main README.md
- Review SECURITY.md for security concerns
- Open an issue on GitHub
- Contact: support@iitp.ac.in

---

**API Version:** 1.0.0  
**Last Updated:** October 2025
