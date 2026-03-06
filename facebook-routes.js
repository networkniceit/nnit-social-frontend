// ================================================================
// FACEBOOK OAuth & INTEGRATION ROUTES
// Add these routes to server.js (before the /health route)
// ================================================================

// Facebook OAuth Start
app.get('/api/auth/facebook', (req, res) => {
  const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
  const REDIRECT_URI = `${process.env.BACKEND_URL}/api/auth/facebook/callback`;

  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
    `client_id=${FACEBOOK_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=pages_show_list,pages_read_engagement,pages_manage_posts,pages_read_user_content,read_insights` +
    `&response_type=code`;

  res.redirect(authUrl);
});

// Facebook OAuth Callback
app.get('/api/auth/facebook/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect(`${process.env.FRONTEND_URL}/settings?facebook_error=true&reason=no_code`);
  }

  try {
    const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
    const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
    const REDIRECT_URI = `${process.env.BACKEND_URL}/api/auth/facebook/callback`;

    // Exchange code for user access token
    const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${FACEBOOK_APP_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&client_secret=${FACEBOOK_APP_SECRET}` +
      `&code=${code}`;

    const tokenResponse = await axios.get(tokenUrl);
    const userAccessToken = tokenResponse.data.access_token;

    // Get user info
    const userUrl = `https://graph.facebook.com/v18.0/me?fields=id,name&access_token=${userAccessToken}`;
    const userResponse = await axios.get(userUrl);
    const { id: facebookUserId, name: facebookUserName } = userResponse.data;

    // Get pages
    const pagesUrl = `https://graph.facebook.com/v18.0/me/accounts?access_token=${userAccessToken}`;
    const pagesResponse = await axios.get(pagesUrl);

    if (!pagesResponse.data.data || pagesResponse.data.data.length === 0) {
      return res.redirect(`${process.env.FRONTEND_URL}/settings?facebook_error=true&reason=no_pages`);
    }

    const page = pagesResponse.data.data[0];
    const pageAccessToken = page.access_token;
    const pageId = page.id;
    const pageName = page.name;

    // Save to DB
    await pool.query(`
      CREATE TABLE IF NOT EXISTS social_accounts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL DEFAULT 1,
        platform VARCHAR(50) NOT NULL,
        access_token TEXT,
        instagram_account_id VARCHAR(100),
        instagram_account_name VARCHAR(100),
        page_id VARCHAR(100),
        page_access_token TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, platform)
      )
    `);

    await pool.query(`
      INSERT INTO social_accounts (user_id, platform, access_token, instagram_account_name, page_id, page_access_token)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, platform)
      DO UPDATE SET
        access_token = $3,
        instagram_account_name = $4,
        page_id = $5,
        page_access_token = $6,
        updated_at = CURRENT_TIMESTAMP
    `, [1, 'facebook', userAccessToken, pageName, pageId, pageAccessToken]);

    res.redirect(
      `${process.env.FRONTEND_URL}/settings?` +
      `facebook_connected=true` +
      `&facebook_page_id=${pageId}` +
      `&facebook_page_name=${encodeURIComponent(pageName)}` +
      `&facebook_page_token=${pageAccessToken}`
    );

  } catch (error) {
    console.error('Facebook OAuth error:', error.response?.data || error.message);
    res.redirect(`${process.env.FRONTEND_URL}/settings?facebook_error=true&reason=${encodeURIComponent(error.response?.data?.error?.message || error.message)}`);
  }
});

// Load Facebook credentials from DB
app.get('/api/auth/facebook/load', async (req, res) => {
  try {
    const userId = req.query.userId || 1;

    await pool.query(`
      CREATE TABLE IF NOT EXISTS social_accounts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL DEFAULT 1,
        platform VARCHAR(50) NOT NULL,
        access_token TEXT,
        instagram_account_id VARCHAR(100),
        instagram_account_name VARCHAR(100),
        page_id VARCHAR(100),
        page_access_token TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, platform)
      )
    `);

    const result = await pool.query(
      `SELECT * FROM social_accounts WHERE user_id = $1 AND platform = 'facebook'`,
      [userId]
    );

    if (result.rows.length > 0) {
      res.json({ success: true, account: result.rows[0] });
    } else {
      res.json({ success: false, account: null });
    }
  } catch (error) {
    console.error('Facebook load error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save Facebook credentials to DB
app.post('/api/auth/facebook/save', async (req, res) => {
  try {
    const { userId, pageId, pageName, pageAccessToken, accessToken } = req.body;
    const resolvedUserId = userId || 1;

    await pool.query(`
      CREATE TABLE IF NOT EXISTS social_accounts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL DEFAULT 1,
        platform VARCHAR(50) NOT NULL,
        access_token TEXT,
        instagram_account_id VARCHAR(100),
        instagram_account_name VARCHAR(100),
        page_id VARCHAR(100),
        page_access_token TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, platform)
      )
    `);

    const result = await pool.query(`
      INSERT INTO social_accounts (user_id, platform, access_token, instagram_account_name, page_id, page_access_token)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id, platform)
      DO UPDATE SET
        access_token = $3,
        instagram_account_name = $4,
        page_id = $5,
        page_access_token = $6,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [resolvedUserId, 'facebook', accessToken, pageName, pageId, pageAccessToken]);

    res.json({ success: true, account: result.rows[0] });
  } catch (error) {
    console.error('Facebook save error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ================================================================
// FACEBOOK POSTING
// ================================================================

// Post text to Facebook Page
app.post('/api/facebook/post', async (req, res) => {
  try {
    const { message, link, userId } = req.body;
    const resolvedUserId = userId || 1;

    // Get page token from DB
    const dbResult = await pool.query(
      `SELECT page_id, page_access_token FROM social_accounts WHERE user_id = $1 AND platform = 'facebook'`,
      [resolvedUserId]
    );

    if (dbResult.rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Facebook not connected' });
    }

    const { page_id, page_access_token } = dbResult.rows[0];

    const postData = { message, access_token: page_access_token };
    if (link) postData.link = link;

    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${page_id}/feed`,
      postData
    );

    res.json({ success: true, postId: response.data.id });
  } catch (error) {
    console.error('Facebook post error:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.response?.data?.error?.message || error.message });
  }
});

// Post photo to Facebook Page
app.post('/api/facebook/post/photo', async (req, res) => {
  try {
    const { caption, imageUrl, userId } = req.body;
    const resolvedUserId = userId || 1;

    const dbResult = await pool.query(
      `SELECT page_id, page_access_token FROM social_accounts WHERE user_id = $1 AND platform = 'facebook'`,
      [resolvedUserId]
    );

    if (dbResult.rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Facebook not connected' });
    }

    const { page_id, page_access_token } = dbResult.rows[0];

    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${page_id}/photos`,
      {
        caption,
        url: imageUrl,
        access_token: page_access_token
      }
    );

    res.json({ success: true, postId: response.data.id });
  } catch (error) {
    console.error('Facebook photo post error:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.response?.data?.error?.message || error.message });
  }
});

// Get Facebook Page posts
app.get('/api/facebook/posts', async (req, res) => {
  try {
    const userId = req.query.userId || 1;

    const dbResult = await pool.query(
      `SELECT page_id, page_access_token FROM social_accounts WHERE user_id = $1 AND platform = 'facebook'`,
      [userId]
    );

    if (dbResult.rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Facebook not connected' });
    }

    const { page_id, page_access_token } = dbResult.rows[0];

    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${page_id}/feed?fields=id,message,created_time,likes.summary(true),comments.summary(true),shares&access_token=${page_access_token}`
    );

    res.json({ success: true, posts: response.data.data });
  } catch (error) {
    console.error('Facebook posts error:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.response?.data?.error?.message || error.message });
  }
});

// ================================================================
// FACEBOOK ANALYTICS
// ================================================================

// Get Page insights
app.get('/api/facebook/analytics', async (req, res) => {
  try {
    const userId = req.query.userId || 1;
    const { metric = 'page_impressions,page_engaged_users,page_fans,page_views_total', period = 'day' } = req.query;

    const dbResult = await pool.query(
      `SELECT page_id, page_access_token, instagram_account_name FROM social_accounts WHERE user_id = $1 AND platform = 'facebook'`,
      [userId]
    );

    if (dbResult.rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Facebook not connected' });
    }

    const { page_id, page_access_token, instagram_account_name: pageName } = dbResult.rows[0];

    // Get page insights
    const insightsUrl = `https://graph.facebook.com/v18.0/${page_id}/insights?metric=${metric}&period=${period}&access_token=${page_access_token}`;
    const insightsResponse = await axios.get(insightsUrl);

    // Get page info (fans/followers)
    const pageInfoUrl = `https://graph.facebook.com/v18.0/${page_id}?fields=fan_count,followers_count,name&access_token=${page_access_token}`;
    const pageInfoResponse = await axios.get(pageInfoUrl);

    const insights = {};
    insightsResponse.data.data.forEach(item => {
      insights[item.name] = item.values;
    });

    res.json({
      success: true,
      pageName: pageInfoResponse.data.name || pageName,
      fanCount: pageInfoResponse.data.fan_count,
      followersCount: pageInfoResponse.data.followers_count,
      insights
    });
  } catch (error) {
    console.error('Facebook analytics error:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.response?.data?.error?.message || error.message });
  }
});

// Get post-level analytics
app.get('/api/facebook/analytics/post/:postId', async (req, res) => {
  try {
    const userId = req.query.userId || 1;

    const dbResult = await pool.query(
      `SELECT page_access_token FROM social_accounts WHERE user_id = $1 AND platform = 'facebook'`,
      [userId]
    );

    if (dbResult.rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Facebook not connected' });
    }

    const { page_access_token } = dbResult.rows[0];
    const { postId } = req.params;

    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${postId}/insights?metric=post_impressions,post_engaged_users,post_reactions_by_type_total,post_clicks&access_token=${page_access_token}`
    );

    const insights = {};
    response.data.data.forEach(item => {
      insights[item.name] = item.values?.[0]?.value || 0;
    });

    res.json({ success: true, postId, insights });
  } catch (error) {
    console.error('Facebook post analytics error:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.response?.data?.error?.message || error.message });
  }
});

// Disconnect Facebook
app.delete('/api/auth/facebook/disconnect', async (req, res) => {
  try {
    const userId = req.query.userId || 1;
    await pool.query(
      `DELETE FROM social_accounts WHERE user_id = $1 AND platform = 'facebook'`,
      [userId]
    );
    res.json({ success: true, message: 'Facebook disconnected' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});