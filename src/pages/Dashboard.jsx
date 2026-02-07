import React, { useEffect, useState } from 'react';
import axios from '../axios-config';

function Dashboard({ stats }) {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/clients`);
      setClients(response.data.clients);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Dashboard</h1>
      <p style={styles.subtitle}>Overview of your social media automation</p>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <StatCard
          icon="👥"
          title="Total Clients"
          value={stats?.totalClients || 0}
          color="#667eea"
        />
        <StatCard
          icon="✅"
          title="Active Clients"
          value={stats?.activeClients || 0}
          color="#48bb78"
        />
        <StatCard
          icon="📝"
          title="Scheduled Posts"
          value={stats?.totalScheduledPosts || 0}
          color="#ed8936"
        />
        <StatCard
          icon="📤"
          title="Published Posts"
          value={stats?.totalPublishedPosts || 0}
          color="#9f7aea"
        />
      </div>

      {/* Platform Stats */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Connected Platforms</h2>
        <div style={styles.platformGrid}>
          <PlatformStat name="Facebook" count={stats?.platformsConnected?.facebook || 0} icon="📘" />
          <PlatformStat name="Instagram" count={stats?.platformsConnected?.instagram || 0} icon="📸" />
          <PlatformStat name="Twitter" count={stats?.platformsConnected?.twitter || 0} icon="🐦" />
          <PlatformStat name="LinkedIn" count={stats?.platformsConnected?.linkedin || 0} icon="💼" />
          <PlatformStat name="TikTok" count={stats?.platformsConnected?.tiktok || 0} icon="🎵" />
        </div>
      </div>

      {/* Recent Clients */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Recent Clients</h2>
        {clients.slice(0, 5).map(client => (
          <div key={client.id} style={styles.clientRow}>
            <div>
              <strong>{client.name}</strong>
              <p style={styles.clientMeta}>{client.industry} • {client.platforms.length} platforms</p>
            </div>
            <span style={styles.badge}>{client.plan}</span>
          </div>
        ))}
      </div>
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

function PlatformStat({ name, count, icon }) {
  return (
    <div style={styles.platformStat}>
      <span style={styles.platformIcon}>{icon}</span>
      <span style={styles.platformName}>{name}</span>
      <span style={styles.platformCount}>{count}</span>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1400px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#2d3748',
    margin: '0 0 10px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: '#718096',
    margin: '0 0 30px 0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  statIcon: {
    fontSize: '32px',
  },
  statTitle: {
    fontSize: '14px',
    color: '#718096',
    margin: '0 0 5px 0',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#2d3748',
    margin: '0',
  },
  card: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '20px',
  },
  platformGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
  },
  platformStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    backgroundColor: '#f7fafc',
    borderRadius: '8px',
  },
  platformIcon: {
    fontSize: '24px',
  },
  platformName: {
    flex: 1,
    fontSize: '14px',
    fontWeight: '500',
  },
  platformCount: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#667eea',
  },
  clientRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    borderBottom: '1px solid #e2e8f0',
  },
  clientMeta: {
    fontSize: '13px',
    color: '#718096',
    margin: '5px 0 0 0',
  },
  badge: {
    padding: '4px 12px',
    backgroundColor: '#667eea',
    color: 'white',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
};

export default Dashboard;
