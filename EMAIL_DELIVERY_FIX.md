# Email Delivery Issues - Troubleshooting Guide

## Problem: SMTP emails not reaching @iitp.ac.in inbox

Manual emails work, but SMTP-sent OTPs aren't delivered to college email.

---

## Quick Test

Run this command to test email delivery:

```powershell
node test-email.js
```

This will:
1. ✅ Check your environment variables
2. ✅ Test SMTP connection
3. ✅ Send a test email
4. ✅ Show detailed debugging info

---

## Common Causes & Solutions

### 1. **Emails Going to Spam** (Most Common)

**Why:** Institutional mail servers are very strict about spam filtering.

**Solutions:**

a) **Check Spam Folder**
   - Look in Spam/Junk folder of your @iitp.ac.in email
   - Mark the email as "Not Spam"
   - Add `authiitp@gmail.com` to your contacts

b) **Whitelist the Sender**
   - In your college email settings
   - Add `authiitp@gmail.com` to safe senders list
   - Create a filter to never mark as spam

c) **Improve Email Reputation**
   - Send emails slowly (our rate limiter helps)
   - Don't send too many in short time
   - Use the same Gmail account consistently

### 2. **Institutional Email Filtering**

**Why:** IIT Patna's mail server might block external SMTP sources.

**Check:**
```
1. Contact IIT Patna IT Department
2. Ask if external Gmail SMTP is blocked
3. Request whitelisting of authiitp@gmail.com
```

**Alternative Solution:**
Use IIT Patna's own SMTP server if available:
```env
SMTP_HOST=smtp.iitp.ac.in  # (if they provide one)
SMTP_PORT=587
SMTP_USER=your-iitp-email@iitp.ac.in
SMTP_PASS=your-password
```

### 3. **Gmail Authentication Issues**

**Verify:**

a) **Check App Password**
   ```powershell
   # Your current password (from .env.local):
   rozz exui vkks edju
   
   # Verify:
   - Exactly 16 characters ✓
   - Generated from Google Account ✓
   - 2-Step Verification enabled ✓
   ```

b) **Regenerate App Password**
   1. Go to: https://myaccount.google.com/apppasswords
   2. Delete old password
   3. Generate new one
   4. Update `.env.local`

c) **Check Gmail Security**
   - Visit: https://myaccount.google.com/notifications
   - Look for any blocked sign-in attempts
   - Approve the access if blocked

### 4. **SPF/DKIM Issues**

**Problem:** College mail server rejects emails without proper authentication.

**Current Status:**
- Your Gmail (`authiitp@gmail.com`) has Gmail's SPF/DKIM ✓
- But some servers still filter it

**Solutions:**

a) **Use Gmail's SMTP** (Current setup - already done ✓)

b) **Add proper headers** (Already implemented ✓)
   - Priority headers
   - Reply-To address
   - Message-ID

c) **Alternative: Professional Email Service**
   ```env
   # Use SendGrid (free tier: 100 emails/day)
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-api-key
   ```

### 5. **Delivery Delay**

**Issue:** Emails take time to reach institutional servers.

**Check:**
- Wait 2-5 minutes
- Check Gmail "Sent" folder to confirm it was sent
- Look at "Delivery Status" in Gmail Sent items

### 6. **Email Server Capacity**

**Issue:** College mail server might be slow or down.

**Check:**
- Can you receive OTHER emails at @iitp.ac.in?
- Try sending manual email to yourself
- Check if college email is working at all

---

## Testing Procedure

### Step 1: Run Email Test

```powershell
node test-email.js
```

Enter your @iitp.ac.in email when prompted.

### Step 2: Check Results

**✅ If test email is received:**
- OTP system should work
- Test the actual auth flow

**❌ If test email NOT received:**
- Continue troubleshooting below

### Step 3: Check Gmail Sent Folder

1. Login to authiitp@gmail.com
2. Go to "Sent" folder
3. Look for the test email
4. Check "Show original" to see headers

**If email is in Sent:**
- ✓ Gmail sent it successfully
- ✗ College server blocked/filtered it

**If email NOT in Sent:**
- ✗ SMTP sending failed
- Check credentials and connection

---

## Advanced Diagnostics

### Check Email Headers

If email reached spam, check headers:

1. Open the email in spam
2. Click "Show original" or "View source"
3. Look for:

```
SPF: PASS ✓
DKIM: PASS ✓
DMARC: PASS ✓
```

If any FAIL, contact IT department.

### Test with Different Email

Try sending to:
1. Your personal Gmail (test@gmail.com)
2. Another student's @iitp.ac.in
3. Faculty @iitp.ac.in (if allowed)

This helps identify if issue is:
- Your specific account
- All @iitp.ac.in emails
- College-wide filtering

### Check Blacklists

Check if Gmail IP is blacklisted:
- Visit: https://mxtoolbox.com/blacklists.aspx
- Enter: authiitp@gmail.com
- Look for any blacklisting

---

## Recommended Solutions (In Order)

### Solution 1: Check Spam (Quickest)
```
1. Check spam folder
2. Mark as "Not Spam"
3. Add to contacts
4. Try again
```

### Solution 2: Contact IT (Most Effective)
```
1. Email: it-support@iitp.ac.in
2. Subject: "Whitelist authiitp@gmail.com for Auth Gateway"
3. Explain the project
4. Request whitelisting
```

### Solution 3: Use Professional Email Service
```
1. Sign up for SendGrid (free tier)
2. Get API key
3. Update SMTP settings
4. Test delivery
```

### Solution 4: Use IIT SMTP (Best Long-term)
```
1. Get SMTP credentials from IT dept
2. Use smtp.iitp.ac.in (if available)
3. Update .env.local
4. Test thoroughly
```

---

## Email Service Alternatives

If Gmail continues to have issues:

### 1. **SendGrid** (Recommended)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your-api-key-here
FROM_EMAIL=noreply@your-verified-domain.com
```

**Pros:**
- ✓ Free 100 emails/day
- ✓ Better deliverability
- ✓ Professional reputation
- ✓ Detailed analytics

**Setup:**
1. Sign up: https://sendgrid.com
2. Verify email
3. Get API key
4. Update .env.local

### 2. **AWS SES**
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-access-key-id
SMTP_PASS=your-secret-access-key
```

**Pros:**
- ✓ Very cheap (first 62k emails free)
- ✓ Excellent deliverability
- ✓ AWS ecosystem

### 3. **Mailgun**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-password
```

**Pros:**
- ✓ Free 5,000 emails/month
- ✓ Simple API
- ✓ Good docs

---

## Debug Mode

Enable detailed logging in email service:

Edit `utils/emailService.js`:

```javascript
function createTransporter() {
  return nodemailer.createTransporter({
    // ... existing config
    debug: true,  // ADD THIS
    logger: true  // ADD THIS
  });
}
```

This will show:
- Connection details
- SMTP commands
- Server responses
- Error details

---

## Contact IT Department Template

**Subject:** Request to Whitelist Gmail SMTP for Student Auth Gateway

**Body:**
```
Dear IT Support Team,

I am developing an OTP authentication gateway for IIT Patna students 
as part of [project name/course].

The system sends OTP verification emails from:
- Email: authiitp@gmail.com
- Purpose: Student authentication for web applications

Currently, emails sent via Gmail SMTP are not reaching @iitp.ac.in 
inboxes (possibly filtered as spam).

Request:
1. Whitelist authiitp@gmail.com in the mail server
2. Allow SMTP emails from this address to reach student inboxes

Alternatively, if institutional SMTP is available:
- Please provide SMTP server details (host, port, credentials)
- I can switch to using IIT Patna's mail server

Project Repository: [if applicable]
Contact: [your details]

Thank you for your assistance.

Best regards,
[Your Name]
[Roll Number]
```

---

## Quick Checklist

Before reaching out for help, verify:

- [ ] App Password is correct (16 chars, no spaces)
- [ ] 2-Step Verification enabled on Gmail
- [ ] Test email script runs without errors
- [ ] Email appears in Gmail "Sent" folder
- [ ] Checked spam folder in @iitp.ac.in
- [ ] Tried different @iitp.ac.in email
- [ ] Waited 5+ minutes for delivery
- [ ] Personal Gmail receives test emails fine
- [ ] College email receives manual emails
- [ ] No security alerts in Gmail account

---

## Still Not Working?

### Run Full Diagnostic:

```powershell
# 1. Test email delivery
node test-email.js

# 2. Check environment
echo $env:SMTP_USER
echo $env:SMTP_PASS

# 3. Test with curl (Windows)
curl -v --url "smtp://smtp.gmail.com:587" --mail-from "authiitp@gmail.com" --mail-rcpt "your_email@iitp.ac.in" --user "authiitp@gmail.com:rozz exui vkks edju"

# 4. Check Gmail activity
# Visit: https://myaccount.google.com/device-activity
```

### Get Help:

1. **Documentation:** Read `TROUBLESHOOTING.md`
2. **GitHub Issues:** (if repository exists)
3. **Email:** Include test-email.js output
4. **IT Support:** Contact IIT Patna IT department

---

## Success Indicators

You'll know it's fixed when:

✅ Test email arrives in inbox (not spam)  
✅ OTP emails delivered within 1 minute  
✅ Multiple emails work consecutively  
✅ Different students receive emails  
✅ No bounce-back messages in Gmail  

---

**Last Updated:** October 21, 2025  
**For:** IIT Patna OTP Auth Gateway
