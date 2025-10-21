# 📋 Setup Checklist

Complete this checklist to ensure proper setup of the IIT Patna OTP Authentication Gateway.

## ✅ Pre-Installation

- [ ] **Node.js installed** (version 18 or higher)
  ```powershell
  node --version  # Should show v18.x.x or higher
  ```

- [ ] **npm available**
  ```powershell
  npm --version
  ```

- [ ] **Gmail account ready** (for SMTP)
- [ ] **Text editor installed** (VS Code recommended)
- [ ] **Terminal/PowerShell access**

---

## ✅ Project Setup

- [ ] **Navigate to project directory**
  ```powershell
  cd d:\Projects\iitp-otp-auth
  ```

- [ ] **Install dependencies**
  ```powershell
  npm install
  ```
  - [ ] Installation completed without errors
  - [ ] `node_modules` folder created

- [ ] **Verify package installations**
  ```powershell
  npm list --depth=0
  ```
  - [ ] next
  - [ ] react
  - [ ] react-dom
  - [ ] nodemailer
  - [ ] jsonwebtoken
  - [ ] bcryptjs

---

## ✅ Gmail SMTP Configuration

### Step 1: Enable 2-Step Verification
- [ ] Go to https://myaccount.google.com/security
- [ ] Find "2-Step Verification"
- [ ] Click "Get started" and follow steps
- [ ] Verification enabled successfully

### Step 2: Generate App Password
- [ ] Go to https://myaccount.google.com/apppasswords
- [ ] Select app: **Mail**
- [ ] Select device: **Windows Computer** (or other)
- [ ] Click **Generate**
- [ ] Copy 16-character password (format: `xxxx xxxx xxxx xxxx`)
- [ ] Store password securely (you'll need it next)

---

## ✅ Environment Configuration

- [ ] **Create .env.local file**
  ```powershell
  Copy-Item .env.local.example .env.local
  ```

- [ ] **Edit .env.local with your values**
  - [ ] Open `.env.local` in text editor
  - [ ] Update each variable below:

### SMTP Configuration
- [ ] `SMTP_HOST=smtp.gmail.com` (don't change)
- [ ] `SMTP_PORT=587` (don't change)
- [ ] `SMTP_USER=your-email@gmail.com` (your Gmail address)
- [ ] `SMTP_PASS=xxxxxxxxxxxx` (16-char App Password, no spaces)

### JWT Secret
- [ ] Generate strong JWT secret:
  ```powershell
  -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
  ```
- [ ] Copy generated string
- [ ] `JWT_SECRET=<paste-generated-secret-here>`
- [ ] Secret is at least 32 characters

### App URL
- [ ] `NEXT_PUBLIC_APP_URL=http://localhost:3000` (for development)

### Email Display
- [ ] `FROM_EMAIL=noreply@iitp.ac.in` (can customize)
- [ ] `FROM_NAME=IIT Patna Auth Gateway` (can customize)

- [ ] **Save .env.local file**
- [ ] **Verify no extra spaces or quotes around values**

---

## ✅ File Verification

Check that all essential files exist:

### Configuration Files
- [ ] `package.json`
- [ ] `next.config.js`
- [ ] `.env.local` (NOT committed to git)
- [ ] `.env.local.example`
- [ ] `.gitignore`
- [ ] `vercel.json`

### Pages
- [ ] `pages/index.js`
- [ ] `pages/auth.js`
- [ ] `pages/verify.js`
- [ ] `pages/_app.js`

### API Routes
- [ ] `pages/api/send-otp.js`
- [ ] `pages/api/verify-otp.js`
- [ ] `pages/api/extract-info.js`

### Utilities
- [ ] `utils/emailService.js`
- [ ] `utils/otpService.js`
- [ ] `utils/emailParser.js`
- [ ] `utils/rateLimiter.js`

### Documentation
- [ ] `README.md`
- [ ] `QUICKSTART.md`
- [ ] `SETUP.md`
- [ ] `API_DOCS.md`
- [ ] `SECURITY.md`
- [ ] `TROUBLESHOOTING.md`

---

## ✅ Development Server

- [ ] **Start development server**
  ```powershell
  npm run dev
  ```

- [ ] **Server started successfully**
  - Should see: `ready - started server on 0.0.0.0:3000`
  - [ ] No error messages in terminal

- [ ] **Open in browser**
  - [ ] Navigate to http://localhost:3000
  - [ ] Page loads without errors

- [ ] **Check browser console**
  - [ ] Press F12 to open developer tools
  - [ ] No error messages in Console tab

---

## ✅ Functionality Testing

### Test 1: Access Auth Page
- [ ] Go to http://localhost:3000/auth
- [ ] Page loads with email input form
- [ ] Form looks correct (no styling issues)

### Test 2: Send OTP
- [ ] Enter a test IITP email: `test_2301mc40@iitp.ac.in`
- [ ] Click "Send OTP" button
- [ ] No errors shown
- [ ] Redirected to verify page
- [ ] Check your email inbox
- [ ] **OTP email received** ✅

### Test 3: Verify OTP
- [ ] Enter the 6-digit OTP from email
- [ ] Click "Verify OTP" button
- [ ] Verification successful
- [ ] User information displayed correctly:
  - [ ] Name extracted correctly
  - [ ] Roll number shown
  - [ ] Branch identified
  - [ ] Degree shown
  - [ ] Admission year calculated

### Test 4: Rate Limiting
- [ ] Try requesting OTP again immediately
- [ ] Should see rate limit error
- [ ] Error message says to wait 60 seconds

### Test 5: Invalid Email
- [ ] Go back to /auth page
- [ ] Try email without @iitp.ac.in domain
- [ ] Should show error message
- [ ] Error: "Only @iitp.ac.in email addresses are allowed"

### Test 6: Invalid OTP
- [ ] Request new OTP
- [ ] Enter wrong OTP (e.g., 000000)
- [ ] Should show "Invalid OTP" error

### Test 7: Expired OTP
- [ ] Request OTP
- [ ] Wait 6+ minutes (OTP expires after 5 min)
- [ ] Try to verify
- [ ] Should show "OTP has expired" error

### Test 8: Resend OTP
- [ ] On verify page, click "Resend OTP"
- [ ] New OTP should be sent
- [ ] Alert shows "New OTP sent"
- [ ] Verify with new OTP works

### Test 9: Extract Info API
- [ ] Test API endpoint directly:
  ```powershell
  curl http://localhost:3000/api/extract-info?email=test_2301mc40@iitp.ac.in
  ```
- [ ] Returns JSON with student info
- [ ] All fields populated correctly

---

## ✅ Security Verification

- [ ] **.env.local is in .gitignore**
  - [ ] Open `.gitignore`
  - [ ] Verify `.env*.local` is listed

- [ ] **JWT_SECRET is strong**
  - [ ] At least 32 characters
  - [ ] Mix of letters, numbers
  - [ ] Not a common phrase or password

- [ ] **SMTP_PASS is App Password**
  - [ ] NOT your regular Gmail password
  - [ ] 16 characters from Google

- [ ] **No secrets in code**
  - [ ] Check source files
  - [ ] No hardcoded passwords or keys

---

## ✅ Code Quality

- [ ] **No console errors**
  - [ ] Check browser console (F12)
  - [ ] Check terminal output

- [ ] **All imports working**
  - [ ] No "Module not found" errors

- [ ] **Linting passes** (optional)
  ```powershell
  npm run lint
  ```

---

## ✅ Documentation Review

- [ ] **Read README.md** - Main documentation
- [ ] **Read QUICKSTART.md** - Quick setup guide
- [ ] **Skim API_DOCS.md** - API reference
- [ ] **Skim SECURITY.md** - Security practices
- [ ] **Bookmark TROUBLESHOOTING.md** - For issues

---

## ✅ Production Preparation (Optional)

If deploying to Vercel:

- [ ] **Vercel account created**
  - Go to https://vercel.com/signup

- [ ] **Vercel CLI installed**
  ```powershell
  npm install -g vercel
  ```

- [ ] **Test build locally**
  ```powershell
  npm run build
  ```
  - [ ] Build completes without errors

- [ ] **Environment variables ready**
  - [ ] List of all variables from .env.local
  - [ ] Ready to add in Vercel dashboard

- [ ] **Custom domain ready** (optional)
  - [ ] Domain purchased
  - [ ] DNS access available

---

## ✅ Final Checks

- [ ] **All tests passed**
- [ ] **No errors in console**
- [ ] **No errors in terminal**
- [ ] **Email sending works**
- [ ] **OTP verification works**
- [ ] **Student info parsing works**
- [ ] **Rate limiting works**
- [ ] **Documentation reviewed**

---

## 🎉 Success Criteria

You're ready to go when:

✅ Development server runs without errors  
✅ Can request OTP successfully  
✅ OTP arrives via email  
✅ OTP verification works  
✅ Student information extracted correctly  
✅ Rate limiting prevents spam  
✅ All security measures in place  
✅ Documentation understood  

---

## 📝 Notes

**Date Completed:** _______________

**Tested By:** _______________

**Issues Encountered:**
- 
- 
- 

**Solutions Applied:**
- 
- 
- 

**Next Steps:**
- [ ] Deploy to Vercel
- [ ] Integrate with client app
- [ ] Set up monitoring
- [ ] Configure production email service
- [ ] Implement additional security features

---

## 🆘 If Something Doesn't Work

1. **Check TROUBLESHOOTING.md** - Most common issues covered
2. **Review configuration** - Verify .env.local values
3. **Restart server** - Sometimes fixes transient issues
4. **Check logs** - Terminal and browser console
5. **Ask for help** - Don't struggle alone!

---

**Congratulations on completing the setup! 🎊**

You now have a fully functional OTP authentication gateway ready for IIT Patna students!
