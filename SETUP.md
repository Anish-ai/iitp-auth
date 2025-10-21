# IIT Patna OTP Auth Gateway - Setup Guide

## Quick Setup Steps

### 1. Install Dependencies
```powershell
npm install
```

### 2. Configure Gmail SMTP

#### Enable 2-Step Verification
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"

#### Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer" (or other device)
3. Click "Generate"
4. Copy the 16-character password

### 3. Create .env.local File

Create a file named `.env.local` in the project root:

```env
# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password

# JWT Secret (generate a strong random string)
JWT_SECRET=your-very-strong-secret-key-minimum-32-characters

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# From Email
FROM_EMAIL=noreply@iitp.ac.in
FROM_NAME=IIT Patna Auth Gateway
```

### 4. Generate JWT Secret

Generate a strong JWT secret:

```powershell
# Using PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Or use an online generator: https://generate-secret.vercel.app/32

### 5. Run Development Server

```powershell
npm run dev
```

Open http://localhost:3000 in your browser.

### 6. Test the Application

1. Go to http://localhost:3000/auth
2. Enter a test IITP email: `test_2301mc01@iitp.ac.in`
3. Check your email for the OTP
4. Enter the OTP to verify

## Deploy to Vercel

### Option 1: Using Vercel CLI

```powershell
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add SMTP_USER
vercel env add SMTP_PASS
vercel env add JWT_SECRET
# ... add all other variables
```

### Option 2: Using GitHub + Vercel Dashboard

1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Add environment variables in project settings
5. Deploy!

## Environment Variables for Production

**Required Variables:**
- `SMTP_HOST` - Gmail SMTP host (smtp.gmail.com)
- `SMTP_PORT` - SMTP port (587)
- `SMTP_USER` - Your Gmail address
- `SMTP_PASS` - Gmail App Password
- `JWT_SECRET` - Strong random secret (32+ characters)
- `NEXT_PUBLIC_APP_URL` - Your Vercel domain
- `FROM_EMAIL` - Display email address
- `FROM_NAME` - Display name for emails

## Testing IITP Email Format

Valid email formats:
- `name_2301mc40@iitp.ac.in` ✓
- `firstname_lastname_2301cs50@iitp.ac.in` ✓
- `student_2202ee25@iitp.ac.in` ✓

Invalid formats:
- `name@iitp.ac.in` ✗ (no roll number)
- `name_123@iitp.ac.in` ✗ (invalid roll format)
- `name_roll@gmail.com` ✗ (wrong domain)

## Common Issues

### Issue: Email not sending
**Solution:** Check SMTP credentials, ensure App Password is correct

### Issue: JWT_SECRET not configured
**Solution:** Add JWT_SECRET to .env.local

### Issue: Rate limit error
**Solution:** Wait 60 seconds before requesting new OTP

### Issue: OTP expired
**Solution:** OTP valid for 5 minutes only, request new one

## Next Steps

1. Customize email templates in `utils/emailService.js`
2. Add custom styling in `styles/globals.css`
3. Implement additional security features
4. Set up monitoring and logging
5. Configure custom domain in Vercel

## Security Checklist

- ✓ JWT_SECRET is strong and unique
- ✓ SMTP credentials are secure (App Password, not real password)
- ✓ .env.local is in .gitignore
- ✓ HTTPS enabled (automatic on Vercel)
- ✓ Rate limiting implemented
- ✓ Email domain validation enabled
- ✓ OTP expiry set to 5 minutes

## Support

For issues or questions, check:
- README.md for detailed documentation
- GitHub issues
- Vercel deployment logs

Good luck! 🚀
