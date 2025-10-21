# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies (1 min)

```powershell
npm install
```

### Step 2: Configure Gmail (2 min)

1. **Enable 2-Step Verification:**
   - Visit: https://myaccount.google.com/security
   - Turn on "2-Step Verification"

2. **Generate App Password:**
   - Visit: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password

### Step 3: Create .env.local (1 min)

Copy `.env.local.example` to `.env.local` and fill in:

```env
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
JWT_SECRET=generate-a-random-32-char-string
```

**Generate JWT Secret (PowerShell):**
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### Step 4: Run Development Server (1 min)

```powershell
npm run dev
```

Open http://localhost:3000 🎉

---

## 🧪 Test It Out

1. **Go to:** http://localhost:3000/auth
2. **Enter email:** `test_2301mc40@iitp.ac.in`
3. **Check your email** for the OTP
4. **Enter OTP** on the verify page
5. **See the magic!** ✨

---

## 📦 What You Get

- ✅ Secure OTP authentication
- ✅ Email validation (@iitp.ac.in only)
- ✅ Student info extraction (name, roll, branch, year)
- ✅ JWT-based stateless verification
- ✅ Rate limiting (1 OTP/min per email)
- ✅ Beautiful UI with responsive design
- ✅ Ready for Vercel deployment

---

## 🚀 Deploy to Vercel

```powershell
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables in dashboard
```

Or push to GitHub and import in Vercel Dashboard!

---

## 📚 Next Steps

- Read `README.md` for full documentation
- Check `API_DOCS.md` for API reference
- Review `SECURITY.md` for production security
- See `INTEGRATION_EXAMPLES.js` for client integration

---

## ❓ Common Issues

**Q: Email not sending?**  
A: Check SMTP credentials and ensure App Password is correct.

**Q: JWT_SECRET error?**  
A: Make sure you generated and added JWT_SECRET to .env.local.

**Q: Rate limit hit?**  
A: Wait 60 seconds between OTP requests for the same email.

**Q: OTP expired?**  
A: OTPs are valid for 5 minutes only. Request a new one.

---

## 🎓 Learn More

- **Next.js Docs:** https://nextjs.org/docs
- **Vercel Deployment:** https://vercel.com/docs
- **JWT.io:** https://jwt.io
- **Nodemailer:** https://nodemailer.com

---

**Need help?** Open an issue or check the docs!

Happy coding! 🚀
