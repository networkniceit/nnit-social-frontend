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

  const [twitterConnected, setTwitterConnected] = useState(false);
  const [twitterUsername, setTwitterUsername] = useState('');
  const [twitterName, setTwitterName] = useState('');

  const [youtubeConnected, setYoutubeConnected] = useState(false);
  const [youtubeChannel, setYoutubeChannel] = useState('');
  const [youtubeId, setYoutubeId] = useState('');

  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [linkedinName, setLinkedinName] = useState('');
  const [linkedinId, setLinkedinId] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

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
          body: JSON.stringify({ userId: 1, accessToken: token, instagramAccountId: accountId, username: user, pageId: null, pageAccessToken: token })
        }).then(res => res.json()).then(data => console.log('Saved to database:', data)).catch(err => console.error('Failed to save to database:', err));
        window.history.replaceState({}, document.title, '/settings');
      }
      setLoading(false);
    }

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
        body: JSON.stringify({ userId: 1, pageId, pageName, pageAccessToken: pageToken, accessToken: pageToken })
      }).catch(err => console.error('Failed to save Facebook to database:', err));
      window.history.replaceState({}, document.title, '/settings');
      setLoading(false);
    }

    else if (params.get('facebook_error') === 'true') {
      alert(`Facebook connection failed: ${decodeURIComponent(params.get('reason') || 'Unknown error')}`);
      window.history.replaceState({}, document.title, '/settings');
      setLoading(false);
    }

    else if (params.get('tiktok_connected') === 'true') {
      setTiktokOpenId(params.get('tiktok_open_id'));
      setTiktokUsername(decodeURIComponent(params.get('tiktok_username') || ''));
      setTiktokConnected(true);
      window.history.replaceState({}, document.title, '/settings');
      setLoading(false);
    }

    else if (params.get('tiktok_error') === 'true') {
      alert(`TikTok connection failed: ${decodeURIComponent(params.get('reason') || 'Unknown error')}`);
      window.history.replaceState({}, document.title, '/settings');
      setLoading(false);
    }

    else if (params.get('twitter_connected') === 'true') {
      setTwitterUsername(decodeURIComponent(params.get('twitter_username') || ''));
      setTwitterName(decodeURIComponent(params.get('twitter_name') || ''));
      setTwitterConnected(true);
      window.history.replaceState({}, document.title, '/settings');
      setLoading(false);
    }

    else if (params.get('twitter_error') === 'true') {
      alert(`Twitter connection failed: ${decodeURIComponent(params.get('reason') || 'Unknown error')}`);
      window.history.replaceState({}, document.title, '/settings');
      setLoading(false);
    }

    else if (params.get('youtube_connected') === 'true') {
      setYoutubeChannel(decodeURIComponent(params.get('youtube_channel') || ''));
      setYoutubeId(params.get('youtube_id') || '');
      setYoutubeConnected(true);
      window.history.replaceState({}, document.title, '/settings');
      setLoading(false);
    }

    else if (params.get('youtube_error') === 'true') {
      alert(`YouTube connection failed: ${decodeURIComponent(params.get('reason') || 'Unknown error')}`);
      window.history.replaceState({}, document.title, '/settings');
      setLoading(false);
    }

    else if (params.get('linkedin_connected') === 'true') {
      setLinkedinName(decodeURIComponent(params.get('linkedin_name') || ''));
      setLinkedinId(params.get('linkedin_id') || '');
      setLinkedinConnected(true);
      window.history.replaceState({}, document.title, '/settings');
      setLoading(false);
    }

    else if (params.get('linkedin_error') === 'true') {
      alert(`LinkedIn connection failed: ${decodeURIComponent(params.get('reason') || 'Unknown error')}`);
      window.history.replaceState({}, document.title, '/settings');
      setLoading(false);
    }

    else {
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

      const loadFacebook = fetch(`${API_URL}/api/auth/facebook/load?userId=1`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.account) {
            setFacebookPageId(data.account.pageId || '');
            setFacebookPageName(data.account.pageName || '');
            setFacebookPageToken(data.account.pageAccessToken || '');
            setFacebookConnected(true);
          }
        })
        .catch(() => {});

      const loadTiktok = fetch(`${API_URL}/api/auth/tiktok/load?userId=1`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.account) {
            setTiktokOpenId(data.account.instagram_account_id || data.account.pageId || '');
            setTiktokUsername(data.account.instagram_account_name || data.account.username || '');
            setTiktokConnected(true);
          }
        })
        .catch(() => {});

      const loadTwitter = fetch(`${API_URL}/api/auth/twitter/load?userId=1`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.account) {
            setTwitterUsername(data.account.username || data.account.instagram_account_id || '');
            setTwitterName(data.account.accountName || data.account.instagram_account_name || '');
            setTwitterConnected(true);
          }
        })
        .catch(() => {});

      const loadYoutube = fetch(`${API_URL}/api/auth/youtube/load?userId=1`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.account) {
            setYoutubeChannel(data.account.instagram_account_name || data.account.accountName || '');
            setYoutubeId(data.account.instagram_account_id || data.account.accountId || '');
            setYoutubeConnected(true);
          }
        })
        .catch(() => {});

      const loadLinkedin = fetch(`${API_URL}/api/auth/linkedin/load?userId=1`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.account) {
            setLinkedinName(data.account.accountName || data.account.username || '');
            setLinkedinId(data.account.accountId || '');
            setLinkedinConnected(true);
          }
        })
        .catch(() => {});

      Promise.all([loadInstagram, loadFacebook, loadTiktok, loadTwitter, loadYoutube, loadLinkedin]).finally(() => setLoading(false));
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

  const handleTwitterDisconnect = async () => {
    await fetch(`${API_URL}/api/auth/twitter/disconnect?userId=1`, { method: 'DELETE' });
    setTwitterConnected(false);
    setTwitterUsername('');
    setTwitterName('');
  };

  const handleYoutubeDisconnect = async () => {
    await fetch(`${API_URL}/api/auth/youtube/disconnect?userId=1`, { method: 'DELETE' });
    setYoutubeConnected(false);
    setYoutubeChannel('');
    setYoutubeId('');
  };

  const handleLinkedinDisconnect = async () => {
    await fetch(`${API_URL}/api/auth/linkedin/disconnect?userId=1`, { method: 'DELETE' });
    setLinkedinConnected(false);
    setLinkedinName('');
    setLinkedinId('');
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Settings</h1>
      <p style={styles.subtitle}>Configure your NNIT Social Automation Suite</p>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Platform API Keys</h2>
        <p style={styles.description}>Connect your social media accounts by entering API credentials below</p>

        {/* FACEBOOK */}
        <div style={styles.apiSection}>
          <h3 style={styles.apiTitle}>📘 Facebook</h3>
          {loading ? (
            <p style={{ color: '#718096', fontSize: '14px' }}>Loading...</p>
          ) : facebookConnected ? (
            <>
              <p style={{ color: '#10b981', fontSize: '14px', marginBottom: '8px' }}>✓ Connected as {facebookPageName}</p>
              <p style={{ color: '#718096', fontSize: '12px', marginBottom: '12px' }}>Page ID: {facebookPageId}</p>
              <button onClick={handleFacebookDisconnect} style={{ ...styles.saveButton, background: '#ef4444' }}>
                Disconnect Facebook Page
              </button>
            </>
          ) : (
            <button onClick={() => window.location.href = `${API_URL}/api/auth/facebook`} style={{ ...styles.saveButton, background: '#1877F2' }}>
              Connect Facebook Page
            </button>
          )}
        </div>

        {/* INSTAGRAM */}
        <div style={styles.apiSection}>
          <h3 style={styles.apiTitle}>📸 Instagram</h3>
          {loading ? (
            <p style={{ color: '#718096', fontSize: '14px' }}>Loading...</p>
          ) : instagramToken ? (
            <>
              <p style={{ color: '#10b981', fontSize: '14px', marginBottom: '8px' }}>✓ Connected as {username || 'Instagram User'}</p>
              <p style={{ color: '#718096', fontSize: '12px', marginBottom: '12px' }}>Account ID: {instagramAccountId}</p>
              <button onClick={handleDisconnect} style={{ ...styles.saveButton, background: '#ef4444' }}>
                Disconnect Instagram Account
              </button>
            </>
          ) : (
            <button onClick={() => window.location.href = `${API_URL}/api/auth/instagram`} style={{ ...styles.saveButton, background: 'linear-gradient(to right, #9333ea, #ec4899)' }}>
              Authorize Instagram
            </button>
          )}
        </div>

        {/* TIKTOK */}
        <div style={styles.apiSection}>
          <h3 style={styles.apiTitle}>🎵 TikTok</h3>
          {loading ? (
            <p style={{ color: '#718096', fontSize: '14px' }}>Loading...</p>
          ) : tiktokConnected ? (
            <>
              <p style={{ color: '#10b981', fontSize: '14px', marginBottom: '8px' }}>✓ Connected as {tiktokUsername}</p>
              <p style={{ color: '#718096', fontSize: '12px', marginBottom: '12px' }}>Open ID: {tiktokOpenId}</p>
              <button onClick={handleTiktokDisconnect} style={{ ...styles.saveButton, background: '#ef4444' }}>
                Disconnect TikTok
              </button>
            </>
          ) : (
            <button onClick={() => window.location.href = `${API_URL}/api/auth/tiktok`} style={{ ...styles.saveButton, background: '#000000' }}>
              Connect TikTok
            </button>
          )}
        </div>

        {/* TWITTER/X */}
        <div style={styles.apiSection}>
          <h3 style={styles.apiTitle}>🐦 Twitter/X</h3>
          {loading ? (
            <p style={{ color: '#718096', fontSize: '14px' }}>Loading...</p>
          ) : twitterConnected ? (
            <>
              <p style={{ color: '#10b981', fontSize: '14px', marginBottom: '8px' }}>✓ Connected as @{twitterUsername}</p>
              <p style={{ color: '#718096', fontSize: '12px', marginBottom: '12px' }}>{twitterName}</p>
              <button onClick={handleTwitterDisconnect} style={{ ...styles.saveButton, background: '#ef4444' }}>
                Disconnect Twitter/X
              </button>
            </>
          ) : (
            <button onClick={() => window.location.href = `${API_URL}/api/auth/twitter`} style={{ ...styles.saveButton, background: '#000000' }}>
              Connect Twitter/X
            </button>
          )}
        </div>

        {/* YOUTUBE */}
        <div style={styles.apiSection}>
          <h3 style={styles.apiTitle}>▶️ YouTube</h3>
          {loading ? (
            <p style={{ color: '#718096', fontSize: '14px' }}>Loading...</p>
          ) : youtubeConnected ? (
            <>
              <p style={{ color: '#10b981', fontSize: '14px', marginBottom: '8px' }}>✓ Connected as {youtubeChannel}</p>
              <p style={{ color: '#718096', fontSize: '12px', marginBottom: '12px' }}>Channel ID: {youtubeId}</p>
              <button onClick={handleYoutubeDisconnect} style={{ ...styles.saveButton, background: '#ef4444' }}>
                Disconnect YouTube
              </button>
            </>
          ) : (
            <button onClick={() => window.location.href = `${API_URL}/api/auth/youtube`} style={{ ...styles.saveButton, background: '#FF0000' }}>
              Connect YouTube
            </button>
          )}
        </div>

        {/* LINKEDIN */}
        <div style={styles.apiSection}>
          <h3 style={styles.apiTitle}>💼 LinkedIn</h3>
          {loading ? (
            <p style={{ color: '#718096', fontSize: '14px' }}>Loading...</p>
          ) : linkedinConnected ? (
            <>
              <p style={{ color: '#10b981', fontSize: '14px', marginBottom: '8px' }}>✓ Connected as {linkedinName}</p>
              <p style={{ color: '#718096', fontSize: '12px', marginBottom: '12px' }}>Profile ID: {linkedinId}</p>
              <button onClick={handleLinkedinDisconnect} style={{ ...styles.saveButton, background: '#ef4444' }}>
                Disconnect LinkedIn
              </button>
            </>
          ) : (
            <button onClick={() => window.location.href = `${API_URL}/api/auth/linkedin`} style={{ ...styles.saveButton, background: '#0077B5' }}>
              Connect LinkedIn
            </button>
          )}
        </div>

      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>General Settings</h2>
        <div style={styles.setting}>
          <label style={styles.label}><input type="checkbox" defaultChecked /> Enable Auto-Reply</label>
        </div>
        <div style={styles.setting}>
          <label style={styles.label}><input type="checkbox" defaultChecked /> Generate Hashtags Automatically</label>
        </div>
        <div style={styles.setting}>
          <label style={styles.label}><input type="checkbox" defaultChecked /> Best Time Posting Suggestions</label>
        </div>
        <div style={styles.setting}>
          <label style={styles.label}><input type="checkbox" /> Content Moderation (Review before posting)</label>
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
