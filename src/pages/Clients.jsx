import React, { useState, useEffect } from 'react';
import axios from '../axios-config';

function Clients() {
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [managingClient, setManagingClient] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', industry: '', website: '', notes: '', plan: 'basic'
  });

  useEffect(() => { fetchClients(); }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get('/api/clients');
      setClients(response.data.clients || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const openAddModal = () => {
    setEditingClient(null);
    setFormData({ name: '', email: '', phone: '', industry: '', website: '', notes: '', plan: 'basic' });
    setShowModal(true);
  };

  const openEditModal = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      industry: client.industry || '',
      website: client.website || '',
      notes: client.notes || '',
      plan: client.plan || 'basic'
    });
    setShowModal(true);
  };

  const openManageModal = (client) => {
    setManagingClient(client);
    setShowManageModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await axios.put('/api/clients/' + editingClient.id, formData);
      } else {
        await axios.post('/api/clients', formData);
      }
      setShowModal(false);
      fetchClients();
      setFormData({ name: '', email: '', phone: '', industry: '', website: '', notes: '', plan: 'basic' });
    } catch (error) {
      console.error('Error:', error);
      alert(editingClient ? 'Failed to update client' : 'Failed to add client');
    }
  };

  const handleDelete = async (clientId) => {
    try {
      await axios.delete('/api/clients/' + clientId);
      setDeleteConfirm(null);
      fetchClients();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete client');
    }
  };

  const handleCopy = (client) => {
    const text = 'Name: ' + client.name + '\nEmail: ' + (client.email || '') + '\nPhone: ' + (client.phone || '') + '\nIndustry: ' + (client.industry || '') + '\nWebsite: ' + (client.website || '') + '\nPlan: ' + (client.plan || 'basic');
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(client.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Clients</h1>
          <p style={styles.subtitle}>Manage your social media clients</p>
        </div>
        <button style={styles.addButton} onClick={openAddModal}>+ Add Client</button>
      </div>

      {clients.length === 0 && (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No clients yet. Click <strong>+ Add Client</strong> to get started.</p>
        </div>
      )}

      <div style={styles.grid}>
        {clients.map(client => (
          <div key={client.id} style={styles.clientCard}>
            <div style={styles.clientHeader}>
              <div style={styles.avatar}>{(client.name || '?').charAt(0).toUpperCase()}</div>
              <div style={styles.clientInfo}>
                <h3 style={styles.clientName}>{client.name}</h3>
                <p style={styles.clientEmail}>{client.email}</p>
              </div>
            </div>

            <div style={styles.clientDetails}>
              {client.industry && <p><strong>Industry:</strong> {client.industry}</p>}
              {client.phone && <p><strong>Phone:</strong> {client.phone}</p>}
              {client.website && <p><strong>Website:</strong> {client.website}</p>}
              <p><strong>Plan:</strong> <span style={styles.planBadge}>{client.plan || 'basic'}</span></p>
            </div>

            <div style={styles.actionButtons}>
              <button style={styles.manageButton} onClick={() => openManageModal(client)}>
                Manage
              </button>
              <button style={styles.editButton} onClick={() => openEditModal(client)}>
                Edit
              </button>
              <button
                style={copiedId === client.id ? { ...styles.copyButton, ...styles.copiedButton } : styles.copyButton}
                onClick={() => handleCopy(client)}
              >
                {copiedId === client.id ? 'Copied!' : 'Copy'}
              </button>
              <button style={styles.deleteButton} onClick={() => setDeleteConfirm(client.id)}>
                Delete
              </button>
            </div>

            {deleteConfirm === client.id && (
              <div style={styles.deleteConfirm}>
                <p style={styles.deleteText}>Delete this client? This cannot be undone.</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={styles.confirmDeleteBtn} onClick={() => handleDelete(client.id)}>Yes, Delete</button>
                  <button style={styles.cancelDeleteBtn} onClick={() => setDeleteConfirm(null)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>{editingClient ? 'Edit Client' : 'Add New Client'}</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <input type="text" placeholder="Client Name *" value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })} style={styles.input} required />
              <input type="email" placeholder="Email *" value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })} style={styles.input} required />
              <input type="text" placeholder="Phone" value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })} style={styles.input} />
              <input type="text" placeholder="Industry (e.g. fitness, tech, food)" value={formData.industry}
                onChange={e => setFormData({ ...formData, industry: e.target.value })} style={styles.input} />
              <input type="text" placeholder="Website (e.g. https://example.com)" value={formData.website}
                onChange={e => setFormData({ ...formData, website: e.target.value })} style={styles.input} />
              <textarea placeholder="Notes" value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })} style={styles.textarea} />
              <select value={formData.plan} onChange={e => setFormData({ ...formData, plan: e.target.value })} style={styles.select}>
                <option value="basic">Basic - 99 euro/month</option>
                <option value="pro">Pro - 199 euro/month</option>
                <option value="enterprise">Enterprise - 499 euro/month</option>
              </select>
              <div style={styles.modalButtons}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelButton}>Cancel</button>
                <button type="submit" style={styles.submitButton}>{editingClient ? 'Save Changes' : 'Add Client'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showManageModal && managingClient && (
        <div style={styles.modalOverlay} onClick={() => setShowManageModal(false)}>
          <div style={{ ...styles.modal, maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div style={styles.manageHeader}>
              <div style={styles.manageAvatar}>{(managingClient.name || '?').charAt(0).toUpperCase()}</div>
              <div>
                <h2 style={styles.modalTitle}>{managingClient.name}</h2>
                <p style={{ color: '#718096', margin: 0 }}>{managingClient.email}</p>
              </div>
            </div>

            <div style={styles.manageGrid}>
              <div style={styles.manageItem}>
                <span style={styles.manageLabel}>Industry</span>
                <span style={styles.manageValue}>{managingClient.industry || 'Not set'}</span>
              </div>
              <div style={styles.manageItem}>
                <span style={styles.manageLabel}>Plan</span>
                <span style={{ ...styles.manageValue, ...styles.planBadge }}>{managingClient.plan || 'basic'}</span>
              </div>
              <div style={styles.manageItem}>
                <span style={styles.manageLabel}>Phone</span>
                <span style={styles.manageValue}>{managingClient.phone || 'Not set'}</span>
              </div>
              <div style={styles.manageItem}>
                <span style={styles.manageLabel}>Website</span>
                <span style={styles.manageValue}>
                  {managingClient.website
                    ? <a href={managingClient.website} target="_blank" rel="noreferrer" style={{ color: '#667eea' }}>{managingClient.website}</a>
                    : 'Not set'}
                </span>
              </div>
            </div>

            {managingClient.notes && (
              <div style={styles.notesBox}>
                <strong>Notes:</strong>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#4a5568' }}>{managingClient.notes}</p>
              </div>
            )}

            <div style={styles.manageActions}>
              <button style={styles.editButton} onClick={() => { setShowManageModal(false); openEditModal(managingClient); }}>
                Edit Client
              </button>
              <button
                style={copiedId === managingClient.id ? { ...styles.copyButton, ...styles.copiedButton } : styles.copyButton}
                onClick={() => handleCopy(managingClient)}
              >
                {copiedId === managingClient.id ? 'Copied!' : 'Copy Details'}
              </button>
              <button style={styles.cancelButton} onClick={() => setShowManageModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '1400px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  title: { fontSize: '32px', fontWeight: '700', color: '#2d3748', margin: '0 0 10px 0' },
  subtitle: { fontSize: '16px', color: '#718096', margin: '0' },
  addButton: { padding: '12px 24px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' },
  emptyState: { backgroundColor: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  emptyText: { fontSize: '16px', color: '#718096' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' },
  clientCard: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  clientHeader: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' },
  avatar: { width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700', flexShrink: 0 },
  clientInfo: { flex: 1 },
  clientName: { fontSize: '18px', fontWeight: '600', margin: '0 0 5px 0' },
  clientEmail: { fontSize: '14px', color: '#718096', margin: '0' },
  clientDetails: { marginBottom: '20px', fontSize: '14px', lineHeight: '1.8' },
  planBadge: { padding: '2px 8px', backgroundColor: '#667eea', color: 'white', borderRadius: '4px', fontSize: '12px', textTransform: 'uppercase' },
  actionButtons: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' },
  manageButton: { padding: '8px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  editButton: { padding: '8px', backgroundColor: '#48bb78', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  copyButton: { padding: '8px', backgroundColor: '#ed8936', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  copiedButton: { backgroundColor: '#38a169' },
  deleteButton: { padding: '8px', backgroundColor: '#fc8181', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  deleteConfirm: { marginTop: '15px', padding: '12px', backgroundColor: '#fff5f5', borderRadius: '8px', border: '1px solid #fed7d7' },
  deleteText: { margin: '0 0 8px 0', fontSize: '14px', color: '#c53030', fontWeight: '500' },
  confirmDeleteBtn: { padding: '6px 14px', backgroundColor: '#e53e3e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '13px' },
  cancelDeleteBtn: { padding: '6px 14px', backgroundColor: '#e2e8f0', color: '#4a5568', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '13px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: 'white', padding: '30px', borderRadius: '12px', maxWidth: '500px', width: '90%', maxHeight: '85vh', overflow: 'auto' },
  modalTitle: { fontSize: '24px', fontWeight: '700', margin: '0 0 20px 0' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' },
  textarea: { padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', minHeight: '80px', resize: 'vertical' },
  select: { padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px' },
  modalButtons: { display: 'flex', gap: '10px', marginTop: '10px' },
  cancelButton: { flex: 1, padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: 'white', cursor: 'pointer', fontWeight: '500' },
  submitButton: { flex: 1, padding: '12px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  manageHeader: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' },
  manageAvatar: { width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700', flexShrink: 0 },
  manageGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' },
  manageItem: { backgroundColor: '#f7fafc', padding: '12px', borderRadius: '8px' },
  manageLabel: { display: 'block', fontSize: '11px', color: '#718096', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' },
  manageValue: { fontSize: '14px', fontWeight: '500', color: '#2d3748' },
  notesBox: { backgroundColor: '#fffbeb', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #fef08a' },
  manageActions: { display: 'flex', gap: '10px' },
};

export default Clients;
