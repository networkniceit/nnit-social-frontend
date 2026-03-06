// ================================================================
// FACEBOOK SECTION - Add to Settings.jsx
// ================================================================

// 1. Add these state variables at the top of your Settings component:
/*
  const [facebookConnected, setFacebookConnected] = useState(false);
  const [facebookPageName, setFacebookPageName] = useState('');
  const [facebookPageId, setFacebookPageId] = useState('');
  const [facebookPageToken, setFacebookPageToken] = useState('');
*/

// 2. Add this inside your main useEffect (alongside the Instagram load logic):
/*
  // Load Facebook from DB
  fetch(`${API_URL}/api/auth/facebook/load?userId=1`)
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
*/

// 3. Add this useEffect to handle OAuth callback params:
/*
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('facebook_connected') === 'true') {
      const pageId = params.get('facebook_page_id');
      const pageName = decodeURIComponent(params.get('facebook_page_name') || '');
      const pageToken = params.get('facebook_page_token');

      setFacebookPageId(pageId);
      setFacebookPageName(pageName);
      setFacebookPageToken(pageToken);
      setFacebookConnected(true);

      // Save to DB
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
      });

      // Clean URL
      window.history.replaceState({}, document.title, '/settings');
    }

    if (params.get('facebook_error') === 'true') {
      const reason = decodeURIComponent(params.get('reason') || 'Unknown error');
      alert(`Facebook connection failed: ${reason}`);
      window.history.replaceState({}, document.title, '/settings');
    }
  }, []);
*/

// 4. Add disconnect handler:
/*
  const handleFacebookDisconnect = async () => {
    await fetch(`${API_URL}/api/auth/facebook/disconnect?userId=1`, { method: 'DELETE' });
    setFacebookConnected(false);
    setFacebookPageName('');
    setFacebookPageId('');
    setFacebookPageToken('');
  };
*/

// 5. JSX - Replace the Facebook section in your Settings UI with this:
/*
  <div className="platform-section">
    <div className="platform-header">
      <span className="platform-icon">📘</span>
      <h3>Facebook</h3>
    </div>

    {facebookConnected ? (
      <div className="connected-section">
        <p style={{ color: '#4CAF50' }}>✓ Connected as {facebookPageName}</p>
        <p style={{ fontSize: '12px', color: '#888' }}>Page ID: {facebookPageId}</p>
        <button
          onClick={handleFacebookDisconnect}
          className="disconnect-btn"
          style={{ backgroundColor: '#e53935', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' }}
        >
          Disconnect Facebook Page
        </button>
      </div>
    ) : (
      <button
        onClick={() => window.location.href = `${API_URL}/api/auth/facebook`}
        className="connect-btn"
        style={{ backgroundColor: '#1877F2', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}
      >
        Connect Facebook Page
      </button>
    )}
  </div>
*/