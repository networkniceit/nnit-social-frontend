import React, { useState, useEffect } from 'react';
import axios from '../axios-config';

function Analytics() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [engagement, setEngagement] = useState(null);
  const [growth, setGrowth] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchAnalytics();
      fetchEngagement();
      fetchGrowth();
    }
  }, [selectedClient]);

  const fetchClients = async () => {
    try {
      const response = await axios.get('/api/clients');
      setClients(response.data.clients);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`/api/analytics/${selectedClient}`);
      setAnalytics(response.data.analytics);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchEngagement = async () => {
    try {
      const response = await axios.get(`/api/analytics/${selectedClient}/engagement?timeframe=month`);
      setEngagement(response.data.engagement);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchGrowth = async () => {
    try {
      const response = await axios.get(`/api/analytics/${selectedClient}/growth`);
      setGrowth(response.data.growth);
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

      {analytics && (
        <>
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
              value={analytics.overview.totalEngagement.toLocaleString()}
              color="#f56565"
            />
            <StatCard
              icon="👥"
              title="Total Followers"
              value={analytics.overview.totalFollowers.toLocaleString()}
              color="#48bb78"
            />
            <StatCard
              icon="📊"
              title="Avg Engagement Rate"
              value={analytics.overview.avgEngagementRate.toFixed(2) + '%'}
              color="#ed8936"
            />
          </div>

          {/* Engagement Metrics */}
          {engagement && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Engagement Breakdown (This Month)</h2>
              <div style={styles.metricsGrid}>
                <Metric icon="👍" label="Likes" value={engagement.likes.toLocaleString()} />
                <Metric icon="💬" label="Comments" value={engagement.comments.toLocaleString()} />
                <Metric icon="🔄" label="Shares" value={engagement.shares.toLocaleString()} />
                <Metric icon="🖱️" label="Clicks" value={engagement.clicks.toLocaleString()} />
                <Metric icon="👁️" label="Impressions" value={engagement.impressions.toLocaleString()} />
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
                  current={growth.followers.current.toLocaleString()}
                  change={growth.followers.change}
                  changePercent={growth.followers.changePercent}
                />
                <GrowthCard
                  title="Engagement"
                  current={growth.engagement.current.toLocaleString()}
                  change={growth.engagement.change}
                  changePercent={growth.engagement.changePercent}
                />
                <GrowthCard
                  title="Reach"
                  current={growth.reach.current.toLocaleString()}
                  change={growth.reach.change}
                  changePercent={growth.reach.changePercent}
                />
              </div>
            </div>
          )}

          {/* Platform Distribution */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Platform Distribution</h2>
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
                        width: `${(count / analytics.overview.totalPosts) * 100}%`
                      }}
                    />
                  </div>
                  <span style={styles.platformCount}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performing Posts */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Top Performing Posts</h2>
            {analytics.topPerformingPosts.map(post => (
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

function GrowthCard({ title, current, change, changePercent }) {
  const isPositive = parseFloat(changePercent) > 0;
  return (
    <div style={styles.growthCard}>
      <h3 style={styles.growthTitle}>{title}</h3>
      <p style={styles.growthCurrent}>{current}</p>
      <p style={{ ...styles.growthChange, color: isPositive ? '#48bb78' : '#f56565' }}>
        {isPositive ? '↑' : '↓'} {Math.abs(change)} ({changePercent}%)
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
