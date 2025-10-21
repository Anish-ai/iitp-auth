/**
 * Example: How to integrate the Auth Gateway in your client application
 */

// ============================================
// EXAMPLE 1: Redirect user to Auth Gateway
// ============================================

function loginWithIITPAuth() {
  // Your callback URL where user will be redirected after authentication
  const callbackUrl = 'https://your-app.com/auth/callback';
  
  // Auth Gateway URL (replace with your deployed Vercel URL)
  const authGatewayUrl = 'https://iitp-auth-gateway.vercel.app';
  
  // Redirect to Auth Gateway
  window.location.href = `${authGatewayUrl}/auth?redirect_uri=${encodeURIComponent(callbackUrl)}`;
}

// ============================================
// EXAMPLE 2: Handle callback in your app
// ============================================

// In your callback page (e.g., pages/auth/callback.js)
function handleAuthCallback() {
  // Get parameters from URL
  const urlParams = new URLSearchParams(window.location.search);
  const verificationToken = urlParams.get('token');
  const success = urlParams.get('success');
  
  if (!success || !verificationToken) {
    console.error('Authentication failed');
    // Redirect to login page or show error
    return;
  }
  
  // Store the verification token
  localStorage.setItem('iitp_auth_token', verificationToken);
  
  // Optionally decode the token to get user info
  // Note: You need to verify the signature for security
  const userData = parseJWT(verificationToken);
  console.log('User authenticated:', userData);
  
  // Redirect to your app's main page
  window.location.href = '/dashboard';
}

// ============================================
// EXAMPLE 3: Parse JWT token (client-side)
// ============================================

function parseJWT(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to parse JWT:', error);
    return null;
  }
}

// ============================================
// EXAMPLE 4: Verify JWT token (server-side with Node.js)
// ============================================

const jwt = require('jsonwebtoken');

function verifyAuthToken(token, jwtSecret) {
  try {
    const decoded = jwt.verify(token, jwtSecret);
    
    // Check if token is from the correct issuer
    if (decoded.iss !== 'iitp-auth-gateway') {
      throw new Error('Invalid token issuer');
    }
    
    // Check if user is verified
    if (!decoded.verified) {
      throw new Error('User not verified');
    }
    
    return {
      valid: true,
      user: {
        email: decoded.email,
        name: decoded.name,
        rollNumber: decoded.rollNumber,
        branch: decoded.branch,
        degree: decoded.degree,
        admissionYear: decoded.admissionYear,
      },
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
    };
  }
}

// ============================================
// EXAMPLE 5: API call to verify OTP directly
// ============================================

async function authenticateUser(email) {
  const authGatewayUrl = 'https://iitp-auth-gateway.vercel.app';
  
  try {
    // Step 1: Request OTP
    const sendOtpResponse = await fetch(`${authGatewayUrl}/api/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        redirect_uri: window.location.origin + '/auth/callback',
      }),
    });
    
    const otpData = await sendOtpResponse.json();
    
    if (!otpData.success) {
      throw new Error(otpData.error);
    }
    
    // Store the token for later verification
    const otpToken = otpData.token;
    
    // Step 2: Show OTP input to user
    const userOtp = prompt('Enter the OTP sent to your email:');
    
    // Step 3: Verify OTP
    const verifyResponse = await fetch(`${authGatewayUrl}/api/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        otp: userOtp,
        token: otpToken,
      }),
    });
    
    const verifyData = await verifyResponse.json();
    
    if (verifyData.success) {
      console.log('User authenticated:', verifyData.userData);
      // Store verification token
      localStorage.setItem('iitp_auth_token', verifyData.verificationToken);
      return verifyData.userData;
    } else {
      throw new Error(verifyData.error);
    }
    
  } catch (error) {
    console.error('Authentication failed:', error);
    return null;
  }
}

// ============================================
// EXAMPLE 6: React Hook for Auth Gateway
// ============================================

import { useState, useEffect } from 'react';

function useIITPAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('iitp_auth_token');
    if (token) {
      const userData = parseJWT(token);
      setUser(userData);
    }
    setLoading(false);
  }, []);
  
  const login = () => {
    const authGatewayUrl = 'https://iitp-auth-gateway.vercel.app';
    const callbackUrl = window.location.origin + '/auth/callback';
    window.location.href = `${authGatewayUrl}/auth?redirect_uri=${encodeURIComponent(callbackUrl)}`;
  };
  
  const logout = () => {
    localStorage.removeItem('iitp_auth_token');
    setUser(null);
  };
  
  return { user, loading, login, logout };
}

// Usage in React component:
function MyApp() {
  const { user, loading, login, logout } = useIITPAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return (
      <div>
        <h1>Please log in</h1>
        <button onClick={login}>Login with IITP Email</button>
      </div>
    );
  }
  
  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Email: {user.email}</p>
      <p>Roll: {user.rollNumber}</p>
      <p>Branch: {user.branch}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

// ============================================
// EXAMPLE 7: Express.js Middleware
// ============================================

const express = require('express');
const jwt = require('jsonwebtoken');

// Middleware to verify IITP auth token
function verifyIITPAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.iss !== 'iitp-auth-gateway' || !decoded.verified) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Usage:
const app = express();
app.get('/api/protected', verifyIITPAuth, (req, res) => {
  res.json({
    message: 'This is a protected route',
    user: req.user,
  });
});

// ============================================
// EXAMPLE 8: Extract info from email only
// ============================================

async function getStudentInfo(email) {
  const authGatewayUrl = 'https://iitp-auth-gateway.vercel.app';
  
  try {
    const response = await fetch(`${authGatewayUrl}/api/extract-info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Student info:', data.data);
      return data.data;
    }
  } catch (error) {
    console.error('Failed to extract info:', error);
  }
  return null;
}

// Usage:
getStudentInfo('anish_2301mc40@iitp.ac.in').then(info => {
  if (info) {
    console.log(`Name: ${info.name}`);
    console.log(`Roll: ${info.rollNumber}`);
    console.log(`Branch: ${info.branch}`);
    console.log(`Year: ${info.admissionYear}`);
  }
});
