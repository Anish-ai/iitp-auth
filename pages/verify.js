/**
 * OTP Verification Page (/verify)
 * User enters the OTP received via email
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function VerifyPage() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [redirectUri, setRedirectUri] = useState('');
  const [success, setSuccess] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Get parameters from query
    const { email: qEmail, token: qToken, redirect_uri } = router.query;
    
    if (!qEmail || !qToken) {
      // Redirect back to auth page if required params are missing
      router.push('/auth');
      return;
    }

    setEmail(qEmail);
    setToken(qToken);
    setRedirectUri(redirect_uri || '');
  }, [router.query]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate OTP format
      if (!/^\d{6}$/.test(otp)) {
        setError('OTP must be a 6-digit number');
        setLoading(false);
        return;
      }

      // Call verify-otp API
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
          token,
          redirect_uri: redirectUri,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid OTP');
        setLoading(false);
        return;
      }

      // Verification successful
      setSuccess(true);
      setUserData(data.userData);

      // Redirect to client app if redirect_uri is provided
      if (redirectUri) {
        setTimeout(() => {
          const separator = redirectUri.includes('?') ? '&' : '?';
          window.location.href = `${redirectUri}${separator}token=${data.verificationToken}&success=true`;
        }, 2000);
      }

    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          redirect_uri: redirectUri,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to resend OTP');
        setLoading(false);
        return;
      }

      // Update token with new one
      setToken(data.token);
      setOtp('');
      alert('New OTP sent to your email!');
      setLoading(false);

    } catch (err) {
      console.error('Error:', err);
      setError('Failed to resend OTP. Please try again.');
      setLoading(false);
    }
  };

  if (success && userData) {
    return (
      <>
        <Head>
          <title>Verification Successful - IIT Patna Auth</title>
        </Head>

        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.successHeader}>
              <div style={styles.checkmark}>✓</div>
              <h1 style={styles.successTitle}>Verification Successful!</h1>
            </div>

            <div style={styles.content}>
              <div style={styles.userInfoBox}>
                <h3 style={styles.userInfoTitle}>Your Information</h3>
                <div style={styles.userInfoItem}>
                  <strong>Name:</strong> {userData.name}
                </div>
                <div style={styles.userInfoItem}>
                  <strong>Email:</strong> {userData.email}
                </div>
                <div style={styles.userInfoItem}>
                  <strong>Roll Number:</strong> {userData.rollNumber}
                </div>
                <div style={styles.userInfoItem}>
                  <strong>Degree:</strong> {userData.degree}
                </div>
                <div style={styles.userInfoItem}>
                  <strong>Branch:</strong> {userData.branch}
                </div>
                <div style={styles.userInfoItem}>
                  <strong>Admission Year:</strong> {userData.admissionYear}
                </div>
              </div>

              {redirectUri && (
                <p style={styles.redirectText}>
                  Redirecting you back to the application...
                </p>
              )}

              {!redirectUri && (
                <button
                  onClick={() => router.push('/auth')}
                  style={styles.button}
                >
                  Return to Home
                </button>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Verify OTP - IIT Patna Auth</title>
        <meta name="description" content="Enter your OTP to verify your identity" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.title}>Verify Your Identity</h1>
            <h2 style={styles.subtitle}>Enter OTP</h2>
          </div>

          <div style={styles.content}>
            <p style={styles.description}>
              We've sent a 6-digit OTP to <strong>{email}</strong>
            </p>

            {error && (
              <div style={styles.errorBox}>
                <span style={styles.errorIcon}>⚠️</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label htmlFor="otp" style={styles.label}>
                  Enter OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength="6"
                  required
                  disabled={loading}
                  style={styles.otpInput}
                  autoComplete="off"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                style={{
                  ...styles.button,
                  ...(loading || otp.length !== 6 ? styles.buttonDisabled : {}),
                }}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>

            <div style={styles.resendSection}>
              <p style={styles.resendText}>Didn't receive the OTP?</p>
              <button
                onClick={handleResendOTP}
                disabled={loading}
                style={styles.resendButton}
              >
                Resend OTP
              </button>
            </div>

            <div style={styles.infoBox}>
              <p style={styles.infoText}>
                ⏱️ OTP expires in 5 minutes
              </p>
              <p style={styles.infoText}>
                📧 Check your spam folder if you don't see the email
              </p>
            </div>
          </div>

          <div style={styles.footer}>
            <button
              onClick={() => router.push('/auth')}
              style={styles.backButton}
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    maxWidth: '500px',
    width: '100%',
    overflow: 'hidden',
  },
  header: {
    background: 'linear-gradient(135deg, #0066cc 0%, #004499 100%)',
    color: 'white',
    padding: '30px 20px',
    textAlign: 'center',
  },
  successHeader: {
    background: 'linear-gradient(135deg, #00cc66 0%, #009944 100%)',
    color: 'white',
    padding: '30px 20px',
    textAlign: 'center',
  },
  title: {
    margin: '0 0 5px 0',
    fontSize: '28px',
    fontWeight: 'bold',
  },
  successTitle: {
    margin: '10px 0 0 0',
    fontSize: '28px',
    fontWeight: 'bold',
  },
  subtitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 'normal',
    opacity: 0.9,
  },
  checkmark: {
    fontSize: '60px',
    margin: '0',
  },
  content: {
    padding: '30px',
  },
  description: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '25px',
    lineHeight: '1.5',
  },
  form: {
    marginBottom: '25px',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#333',
    fontWeight: '600',
    fontSize: '14px',
  },
  otpInput: {
    width: '100%',
    padding: '16px 15px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '24px',
    textAlign: 'center',
    letterSpacing: '8px',
    fontWeight: 'bold',
    transition: 'border-color 0.3s',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  errorBox: {
    backgroundColor: '#fee',
    border: '1px solid #fcc',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '20px',
    color: '#c00',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  errorIcon: {
    fontSize: '18px',
  },
  resendSection: {
    textAlign: 'center',
    marginBottom: '20px',
    paddingTop: '10px',
    borderTop: '1px solid #e0e0e0',
  },
  resendText: {
    color: '#666',
    fontSize: '14px',
    marginBottom: '10px',
  },
  resendButton: {
    backgroundColor: 'transparent',
    color: '#0066cc',
    border: '2px solid #0066cc',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  infoBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '15px',
    marginTop: '20px',
  },
  infoText: {
    margin: '8px 0',
    fontSize: '13px',
    color: '#555',
  },
  footer: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    textAlign: 'center',
    borderTop: '1px solid #e0e0e0',
  },
  backButton: {
    backgroundColor: 'transparent',
    color: '#666',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '5px 10px',
  },
  userInfoBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
  },
  userInfoTitle: {
    margin: '0 0 15px 0',
    color: '#333',
    fontSize: '18px',
  },
  userInfoItem: {
    padding: '8px 0',
    color: '#555',
    fontSize: '14px',
    borderBottom: '1px solid #e0e0e0',
  },
  redirectText: {
    textAlign: 'center',
    color: '#00cc66',
    fontWeight: '600',
    marginTop: '20px',
  },
};
