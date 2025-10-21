/**
 * Home Page - Redirects to /auth
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Preserve query params when redirecting
    const { redirect_uri } = router.query;
    const query = redirect_uri ? { redirect_uri } : {};
    
    router.push({
      pathname: '/auth',
      query,
    });
  }, [router]);

  return (
    <>
      <Head>
        <title>IIT Patna Auth Gateway</title>
        <meta name="description" content="Redirecting to authentication page..." />
      </Head>
      <div style={styles.container}>
        <p style={styles.text}>Redirecting...</p>
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
  },
  text: {
    color: 'white',
    fontSize: '20px',
  },
};
