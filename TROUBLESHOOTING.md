# Troubleshooting Guide

Common issues and their solutions for the IIT Patna OTP Authentication Gateway.

---

## 🔧 Installation Issues

### Issue: `npm install` fails

**Symptoms:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**
```powershell
# Try with legacy peer deps
npm install --legacy-peer-deps

# Or force install
npm install --force

# Or clear cache first
npm cache clean --force
npm install
```

### Issue: Node version incompatibility

**Symptoms:**
```
Error: The engine "node" is incompatible with this module
```

**Solution:**
```powershell
# Check your Node version
node --version

# Should be 18.x or higher
# Update Node.js from nodejs.org
```

---

## 📧 Email Issues

### Issue: OTP email not received

**Possible Causes & Solutions:**

1. **Wrong SMTP Credentials**
   ```powershell
   # Verify in .env.local:
   SMTP_USER=your-email@gmail.com  # Your actual Gmail
   SMTP_PASS=xxxx xxxx xxxx xxxx   # App Password (16 chars)
   ```

2. **App Password not generated**
   - Go to: https://myaccount.google.com/apppasswords
   - Enable 2-Step Verification first
   - Generate new App Password
   - Use the 16-character code (no spaces)

3. **Gmail security blocking**
   - Check https://myaccount.google.com/notifications
   - Look for security alerts
   - Allow "Less secure app access" if needed

4. **Email in spam folder**
   - Check spam/junk folder
   - Mark as "Not Spam"
   - Add sender to contacts

5. **SMTP settings wrong**
   ```env
   SMTP_HOST=smtp.gmail.com  # Must be exactly this
   SMTP_PORT=587             # Must be 587 (not 465 or 25)
   ```

### Issue: "Failed to send OTP email" error

**Solutions:**
```powershell
# Test SMTP connection
# Create test.js:
```
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('SMTP Error:', error);
  } else {
    console.log('SMTP is ready!');
  }
});
```

```powershell
# Run test
node test.js
```

---

## 🔐 JWT Issues

### Issue: "JWT_SECRET is not configured"

**Symptoms:**
```json
{
  "success": false,
  "error": "JWT_SECRET is not configured"
}
```

**Solution:**
```powershell
# Generate a strong secret
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Add to .env.local:
JWT_SECRET=your-generated-secret-here
```

### Issue: "Invalid token" or "Token expired"

**Solutions:**

1. **Token expired (expected)**
   - OTP tokens expire after 5 minutes
   - Request a new OTP

2. **Wrong JWT_SECRET**
   - Ensure same JWT_SECRET used for signing and verifying
   - Check .env.local is loaded correctly

3. **Token tampered**
   - Client cannot modify JWT without invalidating signature
   - Request a fresh token

---

## 🚫 Rate Limiting Issues

### Issue: "Too many requests" error

**Symptoms:**
```json
{
  "success": false,
  "error": "Too many requests. Please try again in 60 seconds.",
  "retryAfter": 45
}
```

**Solutions:**

1. **Wait and retry**
   - Rate limit is 1 OTP per email per minute
   - Wait for the specified seconds

2. **Use different email**
   - Each email has separate rate limit
   - Test with another IITP email

3. **Rate limit stuck (serverless restart)**
   ```powershell
   # In development, restart the server
   # Ctrl+C to stop
   npm run dev
   ```

---

## ✉️ Email Format Issues

### Issue: "Only @iitp.ac.in email addresses are allowed"

**Solution:**
- Email must end with `@iitp.ac.in`
- Correct: `student_2301mc40@iitp.ac.in` ✅
- Wrong: `student@gmail.com` ❌
- Wrong: `student@iitp.com` ❌

### Issue: "Roll number format is invalid"

**Valid Format:** `name_YYDDBBXX@iitp.ac.in`

**Examples:**
```
✅ anish_2301mc40@iitp.ac.in
✅ john_doe_2202cs15@iitp.ac.in
✅ test_2301ee01@iitp.ac.in

❌ anish@iitp.ac.in          (no roll number)
❌ anish_123@iitp.ac.in      (invalid roll format)
❌ anish_mc2301@iitp.ac.in   (wrong order)
```

**Roll Number Breakdown:**
- `23` = Year (2023)
- `01` = Degree code (B.Tech)
- `mc` = Branch code (Mathematics & Computing)
- `40` = Serial number (optional)

---

## 🌐 Development Server Issues

### Issue: Server won't start

**Symptoms:**
```
Error: Cannot find module 'next'
```

**Solution:**
```powershell
# Install dependencies
npm install

# Start server
npm run dev
```

### Issue: Port 3000 already in use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or use a different port
$env:PORT=3001; npm run dev
```

### Issue: Changes not reflecting

**Solutions:**
```powershell
# Hard restart (Ctrl+C, then)
npm run dev

# Clear Next.js cache
Remove-Item .next -Recurse -Force
npm run dev

# Clear browser cache
# Ctrl+Shift+R (hard reload)
```

---

## 🚀 Deployment Issues (Vercel)

### Issue: Environment variables not set

**Solution:**
1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Add all variables from .env.local
5. Redeploy the project

### Issue: "Module not found" in production

**Solution:**
```powershell
# Ensure all dependencies are in package.json (not devDependencies)
# Check package.json:
```
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "nodemailer": "^6.9.7",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3"
  }
}
```

### Issue: Build fails on Vercel

**Check build logs:**
1. Go to Vercel Dashboard
2. Deployments tab
3. Click on failed deployment
4. Check logs for errors

**Common fixes:**
```powershell
# Ensure builds locally first
npm run build

# Check for TypeScript errors
# Check for missing dependencies
# Check for syntax errors
```

---

## 🔒 Security Issues

### Issue: CORS errors in browser

**Symptoms:**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Solution for development:**
```javascript
// In pages/api/send-otp.js (and other API routes)
export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // ... rest of code
}
```

**For production:** Configure in `next.config.js`

### Issue: Verification token validation fails

**Client-side verification:**
```javascript
const jwt = require('jsonwebtoken');

try {
  const decoded = jwt.verify(token, JWT_SECRET);
  
  // Check issuer
  if (decoded.iss !== 'iitp-auth-gateway') {
    throw new Error('Invalid issuer');
  }
  
  // Check verified flag
  if (!decoded.verified) {
    throw new Error('Not verified');
  }
  
  console.log('Valid token:', decoded);
} catch (error) {
  console.error('Invalid token:', error.message);
}
```

---

## 🐛 Runtime Errors

### Issue: "Cannot read property 'toLowerCase' of undefined"

**Cause:** Email not provided in request

**Solution:**
```javascript
// Always validate input first
if (!email) {
  return res.status(400).json({ 
    success: false, 
    error: 'Email is required' 
  });
}
```

### Issue: "Unexpected token in JSON"

**Cause:** Invalid JSON in request body

**Solution:**
```javascript
// In client code, ensure proper JSON
await fetch('/api/send-otp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'  // Important!
  },
  body: JSON.stringify({ email })  // Valid JSON
});
```

### Issue: "bcrypt.compare is not a function"

**Cause:** Wrong bcrypt package

**Solution:**
```powershell
# Uninstall bcrypt
npm uninstall bcrypt

# Install bcryptjs (JavaScript implementation)
npm install bcryptjs
```

---

## 📱 UI/UX Issues

### Issue: Page not redirecting after OTP verification

**Check:**
1. Browser console for JavaScript errors
2. `redirect_uri` parameter in URL
3. Network tab for API response

**Debug:**
```javascript
// In pages/verify.js, add logging
console.log('Redirect URI:', redirectUri);
console.log('Verification data:', data);
console.log('Redirecting to:', `${redirectUri}?token=${data.verificationToken}`);
```

### Issue: OTP input not accepting numbers

**Check:**
```javascript
// In pages/verify.js
<input
  type="text"  // Not "number" - use "text" with pattern
  pattern="[0-9]*"  // Mobile numeric keyboard
  inputMode="numeric"  // Better mobile UX
  maxLength="6"
  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
/>
```

### Issue: Styles not loading

**Solutions:**
```powershell
# Restart dev server
npm run dev

# Check if globals.css exists
# Ensure _app.js imports it
```

---

## 🧪 Testing Issues

### Issue: Can't test with real IITP email

**Solution:** Use test credentials
```javascript
// For testing, temporarily modify validation
// In utils/emailParser.js

function isValidIITPEmail(email) {
  // Allow test domain for development
  if (process.env.NODE_ENV === 'development') {
    return email.endsWith('@iitp.ac.in') || email.endsWith('@test.com');
  }
  return email.endsWith('@iitp.ac.in');
}
```

**Remember to remove for production!**

---

## 📊 Logging for Debugging

### Enable detailed logging

Create `utils/logger.js`:
```javascript
const isDev = process.env.NODE_ENV === 'development';

function log(level, message, data = {}) {
  if (isDev || level === 'error') {
    console.log(`[${level.toUpperCase()}] ${message}`, data);
  }
}

module.exports = {
  info: (msg, data) => log('info', msg, data),
  error: (msg, data) => log('error', msg, data),
  debug: (msg, data) => log('debug', msg, data),
};
```

Use in API routes:
```javascript
const logger = require('../../utils/logger');

logger.info('OTP request received', { email });
logger.error('Failed to send email', { error: error.message });
```

---

## 🆘 Get Help

### Before asking for help:

1. **Check logs:**
   - Browser console (F12)
   - Terminal output
   - Vercel deployment logs

2. **Verify configuration:**
   - .env.local has all variables
   - Values are correct (no extra spaces)
   - JWT_SECRET is set

3. **Try basic troubleshooting:**
   - Restart development server
   - Clear browser cache
   - Check internet connection

### How to report an issue:

Include:
1. What you're trying to do
2. What happened instead
3. Error messages (full text)
4. Steps to reproduce
5. Your environment (Node version, OS)
6. Configuration (without secrets!)

---

## 📞 Support Channels

- **Documentation:** Check README.md and other docs
- **GitHub Issues:** (if repository exists)
- **Email:** support@iitp.ac.in
- **Community:** IIT Patna developer forums

---

## ✅ Quick Diagnostic Checklist

Copy and check each item:

- [ ] Node.js 18+ installed
- [ ] All dependencies installed (`npm install`)
- [ ] `.env.local` file exists
- [ ] `SMTP_USER` is correct Gmail address
- [ ] `SMTP_PASS` is 16-char App Password (not regular password)
- [ ] `JWT_SECRET` is at least 32 characters
- [ ] 2-Step Verification enabled on Gmail
- [ ] App Password generated from Google
- [ ] Development server running (`npm run dev`)
- [ ] Port 3000 not blocked
- [ ] Internet connection working
- [ ] Email format is correct (`name_roll@iitp.ac.in`)
- [ ] No typos in domain (`@iitp.ac.in`, not `@iitp.com`)
- [ ] Checking correct email inbox
- [ ] Spam folder checked
- [ ] Browser console has no errors
- [ ] API requests returning 200 status

---

**Still stuck? Don't give up! Check the documentation again or reach out for help.** 💪
