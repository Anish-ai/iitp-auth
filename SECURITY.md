# Security Considerations for Production

## Critical Security Measures

### 1. Environment Variables
- **Never commit `.env.local` to version control**
- Use strong, unique JWT_SECRET (minimum 32 characters)
- Rotate secrets periodically (every 3-6 months)
- Use different secrets for dev/staging/production

### 2. Rate Limiting
- Current implementation uses in-memory storage (resets on cold starts)
- **Production recommendations:**
  - Use Vercel Edge Config for rate limiting
  - Implement Redis with Upstash (free tier available)
  - Use Cloudflare Rate Limiting
  - Consider IP-based rate limiting with Vercel Edge Middleware

### 3. Email Security
- Use Gmail App Passwords, never real password
- Enable 2FA on the Gmail account
- **Production alternatives:**
  - SendGrid (99,000 free emails/month)
  - AWS SES (62,000 free emails/month)
  - Mailgun (5,000 free emails/month)
  - Postmark (100 free emails/month)

### 4. HTTPS Enforcement
- Always use HTTPS in production (automatic on Vercel)
- Set secure cookies with `httpOnly` and `sameSite` flags
- Implement Content Security Policy (CSP)

### 5. JWT Security
- Tokens expire after 1 hour (configurable)
- OTP tokens expire after 5 minutes
- Include issuer claim (`iss`) for verification
- Sign tokens with HS256 or RS256 algorithm

### 6. Input Validation
- Email domain validation (@iitp.ac.in only)
- OTP format validation (6 digits)
- Roll number format validation
- Sanitize all user inputs

### 7. CORS Configuration
If allowing cross-origin requests, configure properly:

```javascript
// In API routes
res.setHeader('Access-Control-Allow-Origin', 'https://your-allowed-domain.com');
res.setHeader('Access-Control-Allow-Methods', 'POST');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
```

### 8. Logging and Monitoring
- Log authentication attempts
- Monitor failed OTP attempts
- Set up alerts for suspicious activity
- Use Vercel Analytics or Sentry for error tracking

### 9. Database Considerations
While this implementation is stateless:
- Consider adding audit logs in a database
- Track authentication history
- Store failed attempt counts
- Implement account lockout after multiple failures

### 10. DDoS Protection
- Vercel provides basic DDoS protection
- Consider Cloudflare for additional layer
- Implement progressive delays for repeated failures
- Add CAPTCHA for suspicious activity

## Implementation Checklist

Before deploying to production:

- [ ] Strong JWT_SECRET configured
- [ ] Gmail App Password or email service configured
- [ ] Rate limiting tested and working
- [ ] HTTPS enforced everywhere
- [ ] Error messages don't leak sensitive info
- [ ] Logging implemented for security events
- [ ] Environment variables secured in Vercel
- [ ] CORS configured correctly
- [ ] Input validation on all endpoints
- [ ] Token expiry times appropriate
- [ ] Email templates reviewed (no phishing risks)
- [ ] Redirect URI validation implemented
- [ ] Documentation reviewed and updated

## Advanced Security Features to Consider

### 1. Trusted Redirect URIs
Only allow redirects to pre-approved domains:

```javascript
const ALLOWED_REDIRECT_DOMAINS = [
  'https://app1.iitp.ac.in',
  'https://app2.iitp.ac.in',
  'localhost:3000', // for development
];

function isValidRedirectUri(uri) {
  try {
    const url = new URL(uri);
    return ALLOWED_REDIRECT_DOMAINS.some(domain => 
      uri.startsWith(domain)
    );
  } catch {
    return false;
  }
}
```

### 2. CSRF Protection
Implement state parameter for OAuth-like flow:

```javascript
// When redirecting to auth
const state = crypto.randomBytes(32).toString('hex');
sessionStorage.setItem('auth_state', state);
window.location.href = `${authUrl}?redirect_uri=${redirectUri}&state=${state}`;

// In callback
const returnedState = urlParams.get('state');
const storedState = sessionStorage.getItem('auth_state');
if (returnedState !== storedState) {
  throw new Error('CSRF validation failed');
}
```

### 3. IP-Based Rate Limiting
Track attempts by IP address:

```javascript
// Vercel Edge Middleware (middleware.js)
export function middleware(request) {
  const ip = request.ip || 'unknown';
  // Implement rate limiting by IP
}
```

### 4. Suspicious Activity Detection
- Multiple failed OTP attempts
- Requests from unusual locations
- Rapid authentication attempts
- Pattern of testing different emails

### 5. Email Verification Enhancement
- Add verification link in addition to OTP
- Implement magic links as alternative
- Send notification of new login attempts

## Compliance Considerations

### Data Privacy
- Minimal data collection (only what's necessary)
- No storage of OTPs in plain text
- JWT tokens contain only essential user data
- Consider GDPR compliance if applicable

### Audit Trail
- Log all authentication events
- Store IP addresses and timestamps
- Track successful and failed attempts
- Maintain logs for required retention period

## Emergency Procedures

### If JWT_SECRET is Compromised
1. Generate new JWT_SECRET immediately
2. Update environment variable in Vercel
3. Invalidate all existing tokens
4. Force re-authentication for all users
5. Review logs for unauthorized access
6. Notify affected users if necessary

### If Email Credentials are Compromised
1. Revoke Gmail App Password
2. Generate new App Password
3. Update environment variables
4. Monitor for unauthorized emails sent
5. Review account security settings

## Security Testing

Before going live:

1. **Penetration Testing**
   - Test for SQL injection (N/A - no database)
   - Test for XSS vulnerabilities
   - Test for CSRF attacks
   - Test rate limiting effectiveness

2. **Load Testing**
   - Test with concurrent requests
   - Verify rate limiting under load
   - Check serverless function performance

3. **Security Scanning**
   - Run `npm audit` regularly
   - Use Snyk or similar for vulnerability scanning
   - Check dependencies for known issues

## Contact Security Issues

If you discover a security vulnerability:
1. Do NOT create a public GitHub issue
2. Email security concerns to: security@iitp.ac.in
3. Include detailed description of the vulnerability
4. Allow time for patch before public disclosure

---

**Remember: Security is an ongoing process, not a one-time task!**
