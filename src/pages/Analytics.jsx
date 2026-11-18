import React, { useState, useEffect } from 'react';
import axios from '../axios-config';

function Analytics() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [engagement, setEngagement] = useState(null);
  const [growth, setGrowth] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setAnalytics(null);
    setEngagement(null);
    setGrowth(null);
    setError('');
    setLoading(Boolean(selectedClient));
    if (selectedClient) {
      const config = { signal: controller.signal };
      Promise.all([
        axios.get(`/api/analytics/${selectedClient}`, config),
        axios.get(`/api/analytics/${selectedClient}/engagement?timeframe=month`, config),
        axios.get(`/api/analytics/${selectedClient}/growth`, config)
      ]).then(([summary, activity, trend]) => {
        if (controller.signal.aborted) return;
        setAnalytics(summary.data.analytics);
        setEngagement(activity.data.engagement);
        setGrowth(trend.data.growth);
      }).catch(() => {
        if (!controller.signal.aborted) setError('Could not load analytics. Please select the client again to retry.');
      }).finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    }
    return () => controller.abort();
  }, [selectedClient]);

  const fetchClients = async () => {
    try {
      const response = await axios.get('/api/clients');
      setClients(response.data.clients);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Analytics</h1>
      <p style={styles.subtitle}>Track performance and insights</p>

      <select
        value={selectedClient}
        onChange={e => setSelectedClient(e.target.value)}
        style={styles.select}
      >
        <option value="">-- Select a client --</option>
        {clients.map(client => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>

      {loading && <p role="status">Loading analytics...</p>}
      {error && <p role="alert">{error}</p>}

      {analytics && (
        <>
          <p>Post counts come from saved records. Followers, engagement and growth are not available until platform metrics are connected.</p>
          {/* Overview Stats */}
          <div style={styles.statsGrid}>
            <StatCard
              icon="📝"
              title="Total Posts"
              value={analytics.overview.totalPosts}
              color="#667eea"
            />
            <StatCard
              icon="❤️"
              title="Total Engagement"
              value={formatMetric(analytics.overview.totalEngagement)}
              color="#f56565"
            />
            <StatCard
              icon="👥"
              title="Total Followers"
              value={formatMetric(analytics.overview.totalFollowers)}
              color="#48bb78"
            />
            <StatCard
              icon="📊"
              title="Avg Engagement Rate"
              value={Number.isFinite(analytics.overview.avgEngagementRate) ? analytics.overview.avgEngagementRate.toFixed(2) + '%' : 'Not available'}
              color="#ed8936"
            />
          </div>

          {/* Engagement Metrics */}
          {engagement && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Engagement Breakdown (This Month)</h2>
              <div style={styles.metricsGrid}>
                <Metric icon="👍" label="Likes" value={formatMetric(engagement.likes)} />
                <Metric icon="💬" label="Comments" value={formatMetric(engagement.comments)} />
                <Metric icon="🔄" label="Shares" value={formatMetric(engagement.shares)} />
                <Metric icon="🖱️" label="Clicks" value={formatMetric(engagement.clicks)} />
                <Metric icon="👁️" label="Impressions" value={formatMetric(engagement.impressions)} />
              </div>
            </div>
          )}

          {/* Growth Metrics */}
          {growth && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Growth Metrics</h2>
              <div style={styles.growthGrid}>
                <GrowthCard
                  title="Followers"
                  current={formatMetric(growth.followers.current)}
                  change={growth.followers.change}
                  changePercent={growth.followers.changePercent}
                />
                <GrowthCard
                  title="Engagement"
                  current={formatMetric(growth.engagement.current)}
                  change={growth.engagement.change}
                  changePercent={growth.engagement.changePercent}
                />
                <GrowthCard
                  title="Reach"
                  current={formatMetric(growth.reach.current)}
                  change={growth.reach.change}
                  changePercent={growth.reach.changePercent}
                />
              </div>
            </div>
          )}

          {/* Platform Distribution */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Confirmed Deliveries by Platform</h2>
            <div style={styles.platformChart}>
              {Object.entries(analytics.platforms).map(([platform, count]) => (
                <div key={platform} style={styles.platformBar}>
                  <span style={styles.platformLabel}>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </span>
                  <div style={styles.barContainer}>
                    <div
                      style={{
                        ...styles.bar,
                        width: `${(analytics.overview.totalPosts ? count / analytics.overview.totalPosts : 0) * 100}%`
                      }}
                    />
                  </div>
                  <span style={styles.platformCount}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Published Posts */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Recent Published Posts</h2>
            {(analytics.recentPublishedPosts || []).map(post => (
              <div key={post.id} style={styles.postRow}>
                <div style={styles.postContent}>
                  <p>{post.content}</p>
                  <span style={styles.postMeta}>
                    {new Date(post.publishedAt).toLocaleDateString()} • {post.platforms.join(', ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!selectedClient && (
        <div style={styles.emptyState}>
          <p>Select a client to view analytics</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  return (
    <div style={{ ...styles.statCard, borderLeft: `4px solid ${color}` }}>
      <div style={styles.statIcon}>{icon}</div>
      <div>
        <p style={styles.statTitle}>{title}</p>
        <p style={styles.statValue}>{value}</p>
      </div>
    </div>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div style={styles.metric}>
      <span style={styles.metricIcon}>{icon}</span>
      <div>
        <p style={styles.metricLabel}>{label}</p>
        <p style={styles.metricValue}>{value}</p>
      </div>
    </div>
  );
}

function formatMetric(value) {
  return Number.isFinite(value) ? value.toLocaleString() : 'Not available';
}

function GrowthCard({ title, current, change, changePercent }) {
  const isPositive = parseFloat(changePercent) > 0;
  return (
    <div style={styles.growthCard}>
      <h3 style={styles.growthTitle}>{title}</h3>
      <p style={styles.growthCurrent}>{current}</p>
      <p style={{ ...styles.growthChange, color: isPositive ? '#48bb78' : '#f56565' }}>
        {Number.isFinite(change) && Number.isFinite(changePercent) ? `${isPositive ? '↑' : '↓'} ${Math.abs(change)} (${changePercent}%)` : 'Not available'}
      </p>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1400px' },
  title: { fontSize: '32px', fontWeight: '700', color: '#2d3748', margin: '0 0 10px 0' },
  subtitle: { fontSize: '16px', color: '#718096', margin: '0 0 30px 0' },
  select: { padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', marginBottom: '30px', minWidth: '300px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' },
  statCard: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  statIcon: { fontSize: '32px' },
  statTitle: { fontSize: '14px', color: '#718096', margin: '0 0 5px 0' },
  statValue: { fontSize: '28px', fontWeight: '700', color: '#2d3748', margin: '0' },
  card: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  cardTitle: { fontSize: '20px', fontWeight: '600', color: '#2d3748', marginBottom: '20px' },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' },
  metric: { display: 'flex', alignItems: 'center', gap: '12px' },
  metricIcon: { fontSize: '28px' },
  metricLabel: { fontSize: '13px', color: '#718096', margin: '0' },
  metricValue: { fontSize: '20px', fontWeight: '700', color: '#2d3748', margin: '5px 0 0 0' },
  growthGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' },
  growthCard: { padding: '20px', backgroundColor: '#f7fafc', borderRadius: '8px', textAlign: 'center' },
  growthTitle: { fontSize: '14px', color: '#718096', margin: '0 0 10px 0' },
  growthCurrent: { fontSize: '32px', fontWeight: '700', color: '#2d3748', margin: '0 0 10px 0' },
  growthChange: { fontSize: '16px', fontWeight: '600', margin: '0' },
  platformChart: { display: 'flex', flexDirection: 'column', gap: '15px' },
  platformBar: { display: 'flex', alignItems: 'center', gap: '15px' },
  platformLabel: { width: '100px', fontSize: '14px', fontWeight: '500' },
  barContainer: { flex: 1, height: '24px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' },
  bar: { height: '100%', background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '4px' },
  platformCount: { width: '40px', textAlign: 'right', fontWeight: '600', color: '#667eea' },
  postRow: { padding: '15px', borderBottom: '1px solid #e2e8f0' },
  postContent: {},
  postMeta: { fontSize: '12px', color: '#718096' },
  emptyState: { backgroundColor: 'white', padding: '60px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
};

export default Analytics;
