import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

function Settings() {
  const [instagramToken, setInstagramToken] = useState('');
  const [instagramAccountId, setInstagramAccountId] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  const [facebookConnected, setFacebookConnected] = useState(false);
  const [facebookPageName, setFacebookPageName] = useState('');
  const [facebookPageId, setFacebookPageId] = useState('');
  const [facebookPageToken, setFacebookPageToken] = useState('');

  const [tiktokConnected, setTiktokConnected] = useState(false);
  const [tiktokUsername, setTiktokUsername] = useState('');
  const [tiktokOpenId, setTiktokOpenId] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Handle Instagram OAuth callback
    if (params.get('instagram_connected') === 'true') {
      const token = params.get('access_token');
      const accountId = params.get('account_id');
      const user = params.get('username');

      if (token && accountId) {
        setInstagramToken(token);
        setInstagramAccountId(accountId);
        setUsername(user || '');

        localStorage.setItem('instagram_token', token);
        localStorage.setItem('instagram_account_id', accountId);
        localStorage.setItem('instagram_username', user || '');

        fetch(`${API_URL}/api/auth/instagram/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 1,
            accessToken: token,
            instagramAccountId: accountId,
            username: user,
            pageId: null,
            pageAccessToken: token
          })
        })
        .then(res => res.json())
        .then(data => console.log('Saved to database:', data))
        .catch(err => console.error('Failed to save to database:', err));

        window.history.replaceState({}, document.title, '/settings');
      }
      setLoading(false);
    }

    // Handle Facebook OAuth callback
    else if (params.get('facebook_connected') === 'true') {
      const pageId = params.get('facebook_page_id');
      const pageName = decodeURIComponent(params.get('facebook_page_name') || '');
      const pageToken = params.get('facebook_page_token');

      setFacebookPageId(pageId);
      setFacebookPageName(pageName);
      setFacebookPageToken(pageToken);
      setFacebookConnected(true);

      fetch(`${API_URL}/api/auth/facebook/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1,
          pageId,
          pageName,
          pageAccessToken: pageToken,
          accessToken: pageToken
        })
      }).catch(err => console.error('Failed to save Facebook to database:', err));

      window.history.replaceState({}, document.title, '/settings');
      setLoading(false);
    }

    // Handle Facebook error
    else if (params.get('facebook_error') === 'true') {
      const reason = decodeURIComponent(params.get('reason') || 'Unknown error');
      alert(`Facebook connection failed: ${reason}`);
      window.history.replaceState({}, document.title, '/settings');
      setLoading(false);
    }

    // Handle TikTok OAuth callback
    else if (params.get('tiktok_connected') === 'true') {
      const openId = params.get('tiktok_open_id');
      const displayName = decodeURIComponent(params.get('tiktok_username') || '');

      setTiktokOpenId(openId);
      setTiktokUsername(displayName);
      setTiktokConnected(true);

      window.history.replaceState({}, document.title, '/settings');
      setLoading(false);
    }

    // Handle TikTok error
    else if (params.get('tiktok_error') === 'true') {
      const reason = decodeURIComponent(params.get('reason') || 'Unknown error');
      alert(`TikTok connection failed: ${reason}`);
      window.history.replaceState({}, document.title, '/settings');
      setLoading(false);
    }

    else {
      // Load Instagram from DB
      const loadInstagram = fetch(`${API_URL}/api/auth/instagram/load?userId=1`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.account) {
            const { access_token, instagram_account_id, instagram_account_name } = data.account;
            setInstagramToken(access_token || '');
            setInstagramAccountId(instagram_account_id || '');
            setUsername(instagram_account_name || '');
            localStorage.setItem('instagram_token', access_token || '');
            localStorage.setItem('instagram_account_id', instagram_account_id || '');
            localStorage.setItem('instagram_username', instagram_account_name || '');
          } else {
            const savedToken = localStorage.getItem('instagram_token');
            const savedAccountId = localStorage.getItem('instagram_account_id');
            const savedUsername = localStorage.getItem('instagram_username');
            if (savedToken) setInstagramToken(savedToken);
            if (savedAccountId) setInstagramAccountId(savedAccountId);
            if (savedUsername) setUsername(savedUsername);
          }
        })
        .catch(() => {
          const savedToken = localStorage.getItem('instagram_token');
          const savedAccountId = localStorage.getItem('instagram_account_id');
          const savedUsername = localStorage.getItem('instagram_username');
          if (savedToken) setInstagramToken(savedToken);
          if (savedAccountId) setInstagramAccountId(savedAccountId);
          if (savedUsername) setUsername(savedUsername);
        });

      // Load Facebook from DB
      const loadFacebook = fetch(`${API_URL}/api/auth/facebook/load?userId=1`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.account) {
            setFacebookPageId(data.account.page_id || '');
            setFacebookPageName(data.account.instagram_account_name || '');
            setFacebookPageToken(data.account.page_access_token || '');
            setFacebookConnected(true);
          }
        })
        .catch(() => {});

      // Load TikTok from DB
      const loadTiktok = fetch(`${API_URL}/api/auth/tiktok/load?userId=1`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.account) {
            setTiktokOpenId(data.account.instagram_account_id || '');
            setTiktokUsername(data.account.instagram_account_name || '');
            setTiktokConnected(true);
          }
        })
        .catch(() => {});

      Promise.all([loadInstagram, loadFacebook, loadTiktok]).finally(() => setLoading(false));
    }
  }, []);

  const handleDisconnect = () => {
    localStorage.removeItem('instagram_token');
    localStorage.removeItem('instagram_account_id');
    localStorage.removeItem('instagram_username');
    setInstagramToken('');
    setInstagramAccountId('');
    setUsername('');
  };

  const handleFacebookDisconnect = async () => {
    await fetch(`${API_URL}/api/auth/facebook/disconnect?userId=1`, { method: 'DELETE' });
    setFacebookConnected(false);
    setFacebookPageName('');
    setFacebookPageId('');
    setFacebookPageToken('');
  };

  const handleTiktokDisconnect = async () => {
    await fetch(`${API_URL}/api/auth/tiktok/disconnect?userId=1`, { method: 'DELETE' });
    setTiktokConnected(false);
    setTiktokUsername('');
    setTiktokOpenId('');
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Settings</h1>
      <p style={styles.subtitle}>Configure your NNIT Social Automation Suite</p>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Platform API Keys</h2>
        <p style={styles.description}>
          Connect your social media accounts by entering API credentials below
        </p>

        {/* FACEBOOK */}
        <div style={styles.apiSection}>
          <h3 style={styles.apiTitle}>📘 Facebook</h3>
          {loading ? (
            <p style={{ color: '#718096', fontSize: '14px' }}>Loading...</p>
          ) : facebookConnected ? (
            <>
              <p style={{ color: '#10b981', fontSize: '14px', marginBottom: '8px' }}>
                ✓ Connected as {facebookPageName}
              </p>
              <p style={{ color: '#718096', fontSize: '12px', marginBottom: '12px' }}>
                Page ID: {facebookPageId}
              </p>
              <button onClick={handleFacebookDisconnect} style={{ ...styles.saveButton, background: '#ef4444' }}>
                Disconnect Facebook Page
              </button>
            </>
          ) : (
            <button
              onClick={() => window.location.href = `${API_URL}/api/auth/facebook`}
              style={{ ...styles.saveButton, background: '#1877F2' }}
            >
              Connect Facebook Page
            </button>
          )}
        </div>

        {/* INSTAGRAM */}
        <div style={styles.apiSection}>
          <h3 style={styles.apiTitle}>📸 Instagram</h3>
          {loading ? (
            <p style={{ color: '#718096', fontSize: '14px' }}>Loading...</p>
          ) : (
            <>
              <input
                type="text"
                placeholder="Instagram Business Account ID"
                value={instagramAccountId}
                readOnly
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Access Token"
                value={instagramToken}
                readOnly
                style={styles.input}
              />
              {instagramToken && (
                <p style={{ color: '#10b981', fontSize: '14px', marginTop: '8px' }}>
                  ✓ Connected as {username || 'Instagram User'}
                </p>
              )}
              {instagramToken ? (
                <button
                  onClick={handleDisconnect}
                  style={{ ...styles.saveButton, background: '#ef4444', marginTop: '10px' }}
                >
                  Disconnect Instagram Account
                </button>
              ) : (
                <button
                  onClick={() => window.location.href = `${API_URL}/api/auth/instagram`}
                  style={{ ...styles.saveButton, background: 'linear-gradient(to right, #9333ea, #ec4899)', marginTop: '10px' }}
                >
                  Authorize Instagram
                </button>
              )}
            </>
          )}
        </div>

        {/* TIKTOK */}
        <div style={styles.apiSection}>
          <h3 style={styles.apiTitle}>🎵 TikTok</h3>
          {loading ? (
            <p style={{ color: '#718096', fontSize: '14px' }}>Loading...</p>
          ) : tiktokConnected ? (
            <>
              <p style={{ color: '#10b981', fontSize: '14px', marginBottom: '8px' }}>
                ✓ Connected as {tiktokUsername}
              </p>
              <p style={{ color: '#718096', fontSize: '12px', marginBottom: '12px' }}>
                Open ID: {tiktokOpenId}
              </p>
              <button onClick={handleTiktokDisconnect} style={{ ...styles.saveButton, background: '#ef4444' }}>
                Disconnect TikTok
              </button>
            </>
          ) : (
            <button
              onClick={() => window.location.href = `${API_URL}/api/auth/tiktok`}
              style={{ ...styles.saveButton, background: '#000000' }}
            >
              Connect TikTok
            </button>
          )}
        </div>

        {/* TWITTER */}
        <div style={styles.apiSection}>
          <h3 style={styles.apiTitle}>🐦 Twitter/X</h3>
          <input type="text" placeholder="API Key" style={styles.input} />
          <input type="text" placeholder="API Secret" style={styles.input} />
          <button style={styles.saveButton}>Save Twitter Keys</button>
        </div>

        {/* LINKEDIN */}
        <div style={styles.apiSection}>
          <h3 style={styles.apiTitle}>💼 LinkedIn</h3>
          <input type="text" placeholder="Client ID" style={styles.input} />
          <input type="text" placeholder="Client Secret" style={styles.input} />
          <button style={styles.saveButton}>Save LinkedIn Keys</button>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>General Settings</h2>

        <div style={styles.setting}>
          <label style={styles.label}>
            <input type="checkbox" defaultChecked />
            Enable Auto-Reply
          </label>
        </div>

        <div style={styles.setting}>
          <label style={styles.label}>
            <input type="checkbox" defaultChecked />
            Generate Hashtags Automatically
          </label>
        </div>

        <div style={styles.setting}>
          <label style={styles.label}>
            <input type="checkbox" defaultChecked />
            Best Time Posting Suggestions
          </label>
        </div>

        <div style={styles.setting}>
          <label style={styles.label}>
            <input type="checkbox" />
            Content Moderation (Review before posting)
          </label>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>About NNIT Social Automation</h2>
        <p><strong>Version:</strong> 1.0.0</p>
        <p><strong>Company:</strong> NNIT - Network Nice IT Tec</p>
        <p><strong>Contact:</strong> networkniceit@gmail.com</p>
        <p><strong>Owner:</strong> Solomon Omomeje Ayodele</p>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '900px' },
  title: { fontSize: '32px', fontWeight: '700', color: '#2d3748', margin: '0 0 10px 0' },
  subtitle: { fontSize: '16px', color: '#718096', margin: '0 0 30px 0' },
  card: { backgroundColor: 'white', padding: '30px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  cardTitle: { fontSize: '20px', fontWeight: '600', marginBottom: '15px' },
  description: { fontSize: '14px', color: '#718096', marginBottom: '25px' },
  apiSection: { marginBottom: '30px', paddingBottom: '30px', borderBottom: '1px solid #e2e8f0' },
  apiTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '15px' },
  input: { width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', marginBottom: '10px' },
  saveButton: { padding: '10px 20px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' },
  setting: { padding: '15px', backgroundColor: '#f7fafc', borderRadius: '8px', marginBottom: '10px' },
  label: { fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
};

export default Settings;
