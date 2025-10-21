/**
 * Authentication Page (/auth)
 * User enters their IITP email to request OTP
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [redirectUri, setRedirectUri] = useState('');

  useEffect(() => {
    // Get redirect_uri from query params
    const { redirect_uri } = router.query;
    if (redirect_uri) {
      setRedirectUri(redirect_uri);
    }
  }, [router.query]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate email format
      if (!email.endsWith('@iitp.ac.in')) {
        setError('Please use your IIT Patna email (@iitp.ac.in)');
        setLoading(false);
        return;
      }

      // Call send-otp API
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          redirect_uri: redirectUri,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send OTP');
        setLoading(false);
        return;
      }

      // Navigate to verify page with token
      router.push({
        pathname: '/verify',
        query: {
          email: email.trim().toLowerCase(),
          token: data.token,
          redirect_uri: redirectUri || '',
        },
      });

    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>IIT Patna Authentication Gateway</title>
        <meta name="description" content="Secure OTP authentication for IIT Patna students" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.title}>IIT Patna</h1>
            <h2 style={styles.subtitle}>Authentication Gateway</h2>
          </div>

          <div style={styles.content}>
            <p style={styles.description}>
              Enter your IIT Patna email address to receive a one-time password (OTP)
            </p>

            {error && (
              <div style={styles.errorBox}>
                <span style={styles.errorIcon}>⚠️</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label htmlFor="email" style={styles.label}>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your_name_rollno@iitp.ac.in"
                  required
                  disabled={loading}
                  style={styles.input}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.button,
                  ...(loading ? styles.buttonDisabled : {}),
                }}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>

            <div style={styles.infoBox}>
              <p style={styles.infoText}>
                🔒 Secure authentication using end-to-end encryption
              </p>
              <p style={styles.infoText}>
                ⏱️ OTP valid for 5 minutes
              </p>
              <p style={styles.infoText}>
                📧 Only @iitp.ac.in emails accepted
              </p>
            </div>
          </div>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              © 2025 IIT Patna Auth Gateway
            </p>
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
  title: {
    margin: '0 0 5px 0',
    fontSize: '28px',
    fontWeight: 'bold',
  },
  subtitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 'normal',
    opacity: 0.9,
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
  input: {
    width: '100%',
    padding: '12px 15px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '16px',
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
  footerText: {
    margin: 0,
    fontSize: '12px',
    color: '#888',
  },
};
