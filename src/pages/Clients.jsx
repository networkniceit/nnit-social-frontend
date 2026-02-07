import React, { useState, useEffect } from 'react';
import axios from '../axios-config';

function Clients() {
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    industry: '',
    brandVoice: '',
    platforms: [],
    plan: 'basic'
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/clients`);
      setClients(response.data.clients);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/clients`, formData);
      setShowModal(false);
      fetchClients();
      setFormData({
        name: '',
        email: '',
        industry: '',
        brandVoice: '',
        platforms: [],
        plan: 'basic'
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handlePlatformToggle = (platform) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Clients</h1>
          <p style={styles.subtitle}>Manage your social media clients</p>
        </div>
        <button style={styles.addButton} onClick={() => setShowModal(true)}>
          + Add Client
        </button>
      </div>

      <div style={styles.grid}>
        {clients.map(client => (
          <div key={client.id} style={styles.clientCard}>
            <div style={styles.clientHeader}>
              <div style={styles.avatar}>{client.name.charAt(0)}</div>
              <div style={styles.clientInfo}>
                <h3 style={styles.clientName}>{client.name}</h3>
                <p style={styles.clientEmail}>{client.email}</p>
              </div>
            </div>
            
            <div style={styles.clientDetails}>
              <p><strong>Industry:</strong> {client.industry}</p>
              <p><strong>Plan:</strong> <span style={styles.planBadge}>{client.plan}</span></p>
              <p><strong>Platforms:</strong> {client.platforms.length}</p>
            </div>

            <div style={styles.stats}>
              <div style={styles.stat}>
                <span style={styles.statValue}>{client.stats.totalPosts}</span>
                <span style={styles.statLabel}>Posts</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statValue}>{client.stats.scheduledPosts}</span>
                <span style={styles.statLabel}>Scheduled</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statValue}>{client.stats.totalEngagement}</span>
                <span style={styles.statLabel}>Engagement</span>
              </div>
            </div>

            <button style={styles.manageButton}>Manage Client</button>
          </div>
        ))}
      </div>

      {/* Add Client Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Add New Client</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <input
                type="text"
                placeholder="Client Name"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                style={styles.input}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                style={styles.input}
                required
              />
              <input
                type="text"
                placeholder="Industry"
                value={formData.industry}
                onChange={e => setFormData({...formData, industry: e.target.value})}
                style={styles.input}
              />
              <textarea
                placeholder="Brand Voice (e.g., professional and friendly)"
                value={formData.brandVoice}
                onChange={e => setFormData({...formData, brandVoice: e.target.value})}
                style={styles.textarea}
              />
              
              <div style={styles.platformsSection}>
                <label style={styles.label}>Platforms:</label>
                <div style={styles.platformButtons}>
                  {['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok'].map(platform => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => handlePlatformToggle(platform)}
                      style={{
                        ...styles.platformButton,
                        ...(formData.platforms.includes(platform) ? styles.platformButtonActive : {})
                      }}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>

              <select
                value={formData.plan}
                onChange={e => setFormData({...formData, plan: e.target.value})}
                style={styles.select}
              >
                <option value="basic">Basic - €99/month</option>
                <option value="pro">Pro - €199/month</option>
                <option value="enterprise">Enterprise - €499/month</option>
              </select>

              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitButton}>
                  Add Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1400px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
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
    margin: '0',
  },
  addButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  clientCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  clientHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '20px',
  },
  avatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: '700',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 5px 0',
  },
  clientEmail: {
    fontSize: '14px',
    color: '#718096',
    margin: '0',
  },
  clientDetails: {
    marginBottom: '20px',
    fontSize: '14px',
    lineHeight: '1.8',
  },
  planBadge: {
    padding: '2px 8px',
    backgroundColor: '#667eea',
    color: 'white',
    borderRadius: '4px',
    fontSize: '12px',
    textTransform: 'uppercase',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
    marginBottom: '20px',
  },
  stat: {
    textAlign: 'center',
  },
  statValue: {
    display: 'block',
    fontSize: '24px',
    fontWeight: '700',
    color: '#667eea',
  },
  statLabel: {
    display: 'block',
    fontSize: '12px',
    color: '#718096',
  },
  manageButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#f7fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  input: {
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
  },
  textarea: {
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    minHeight: '80px',
    resize: 'vertical',
  },
  select: {
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
  },
  platformsSection: {
    marginTop: '10px',
  },
  label: {
    display: 'block',
    marginBottom: '10px',
    fontWeight: '500',
  },
  platformButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  platformButton: {
    padding: '8px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    backgroundColor: 'white',
    cursor: 'pointer',
    textTransform: 'capitalize',
  },
  platformButtonActive: {
    backgroundColor: '#667eea',
    color: 'white',
    borderColor: '#667eea',
  },
  modalButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    padding: '12px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
  },
};

export default Clients;
