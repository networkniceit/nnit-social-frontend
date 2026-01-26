import React from 'react';

function Settings() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Settings</h1>
      <p style={styles.subtitle}>Configure your NNIT Social Automation Suite</p>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Platform API Keys</h2>
        <p style={styles.description}>
          Connect your social media accounts by entering API credentials below
        </p>

        <div style={styles.apiSection}>
          <h3 style={styles.apiTitle}>📘 Facebook</h3>
          <input type="text" placeholder="App ID" style={styles.input} />
          <input type="text" placeholder="App Secret" style={styles.input} />
          <button style={styles.saveButton}>Save Facebook Keys</button>
        </div>

        <div style={styles.apiSection}>
          <h3 style={styles.apiTitle}>📸 Instagram</h3>
          <input type="text" placeholder="Instagram Business Account ID" style={styles.input} />
          <input type="text" placeholder="Access Token" style={styles.input} />
          <button style={styles.saveButton}>Save Instagram Keys</button>
        </div>

        <div style={styles.apiSection}>
          <h3 style={styles.apiTitle}>🐦 Twitter/X</h3>
          <input type="text" placeholder="API Key" style={styles.input} />
          <input type="text" placeholder="API Secret" style={styles.input} />
          <button style={styles.saveButton}>Save Twitter Keys</button>
        </div>

        <div style={styles.apiSection}>
          <h3 style={styles.apiTitle}>💼 LinkedIn</h3>
          <input type="text" placeholder="Client ID" style={styles.input} />
          <input type="text" placeholder="Client Secret" style={styles.input} />
          <button style={styles.saveButton}>Save LinkedIn Keys</button>
        </div>

        <div style={styles.apiSection}>
          <h3 style={styles.apiTitle}>🎵 TikTok</h3>
          <input type="text" placeholder="Client Key" style={styles.input} />
          <input type="text" placeholder="Client Secret" style={styles.input} />
          <button style={styles.saveButton}>Save TikTok Keys</button>
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