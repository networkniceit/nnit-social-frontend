import React, { useState, useEffect } from 'react';
import axios from '../axios-config';

function Calendar() {
  const [selectedClient, setSelectedClient] = useState('');
  const [clients, setClients] = useState([]);
  const [posts, setPosts] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'view' | 'edit' | 'repost'
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchClients(); }, []);
  useEffect(() => { if (selectedClient) fetchPosts(); }, [selectedClient]);

  const fetchClients = async () => {
    try {
      const response = await axios.get('/api/clients');
      setClients(response.data.clients || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`/api/posts/scheduled/${selectedClient}`);
      setPosts(response.data || []);
    } catch (error) {
      console.error('Error:', error);
      setPosts([]);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openPost = (post) => {
    setSelectedPost(post);
    setEditData({
      content: post.content,
      scheduled_time: post.scheduled_time ? post.scheduled_time.slice(0, 16) : '',
      platforms: post.platforms || [],
      hashtags: Array.isArray(post.hashtags) ? post.hashtags.join(' ') : post.hashtags || '',
    });
    setModalMode('view');
  };

  const closeModal = () => {
    setSelectedPost(null);
    setModalMode(null);
    setEditData({});
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this scheduled post?')) return;
    try {
      await axios.delete(`/api/posts/${selectedPost.id}`);
      setPosts(posts.filter(p => p.id !== selectedPost.id));
      showToast('Post deleted.');
      closeModal();
    } catch (err) {
      showToast('Delete failed.', 'error');
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await axios.put(`/api/posts/${selectedPost.id}`, {
        content: editData.content,
        scheduled_time: editData.scheduled_time,
        platforms: editData.platforms,
        hashtags: editData.hashtags,
      });
      await fetchPosts();
      showToast('Post updated!');
      closeModal();
    } catch (err) {
      showToast('Update failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRepost = async () => {
    setSaving(true);
    try {
      await axios.post('/api/posts', {
        client_id: selectedClient,
        content: editData.content,
        scheduled_time: editData.scheduled_time,
        platforms: editData.platforms,
        hashtags: editData.hashtags,
        status: 'scheduled',
      });
      await fetchPosts();
      showToast('Reposted successfully!');
      closeModal();
    } catch (err) {
      showToast('Repost failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const togglePlatform = (p) => {
    setEditData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(p)
        ? prev.platforms.filter(x => x !== p)
        : [...prev.platforms, p],
    }));
  };

  const getPostsForDate = (date) => {
    return posts.filter(post => {
      const postDate = new Date(post.scheduled_time);
      return postDate.toDateString() === date.toDateString();
    });
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} style={styles.emptyDay}></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayPosts = getPostsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <div key={day} style={{ ...styles.calendarDay, ...(isToday ? styles.today : {}) }}>
          <div style={styles.dayNumber}>{day}</div>
          {dayPosts.length > 0 && (
            <div style={styles.postIndicator}>
              {dayPosts.length} post{dayPosts.length > 1 ? 's' : ''}
            </div>
          )}
          {dayPosts.map(post => (
            <div
              key={post.id}
              style={styles.postBadge}
              onClick={() => openPost(post)}
              title={post.content?.slice(0, 80)}
            >
              <div style={styles.postBadgeIcons}>
                {(post.platforms || []).map(p => (
                  <span key={p}>
                    {p === 'facebook' && 'ðŸ“˜'}
                    {p === 'instagram' && 'ðŸ“¸'}
                    {p === 'twitter' && 'ðŸ¦'}
                    {p === 'linkedin' && 'ðŸ’¼'}
                    {p === 'tiktok' && 'ðŸŽµ'}
                    {p === 'youtube' && 'â–¶ï¸'}
                  </span>
                ))}
              </div>
              <div style={styles.postTime}>
                {new Date(post.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      );
    }
    return days;
  };

  const changeMonth = (delta) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  const platformList = ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube'];
  const platformEmoji = { facebook: 'ðŸ“˜', instagram: 'ðŸ“¸', twitter: 'ðŸ¦', linkedin: 'ðŸ’¼', tiktok: 'ðŸŽµ', youtube: 'â–¶ï¸' };

  return (
    <div style={styles.container}>
      {toast && (
        <div style={{ ...styles.toast, backgroundColor: toast.type === 'error' ? '#e53e3e' : '#38a169' }}>
          {toast.msg}
        </div>
      )}

      <h1 style={styles.title}>Content Calendar</h1>
      <p style={styles.subtitle}>View and manage scheduled posts</p>

      <div style={styles.controls}>
        <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)} style={styles.select}>
          <option value="">-- Select a client --</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>
        {selectedClient && (
          <div style={styles.stats}>
            <span style={styles.statBadge}>ðŸ“ {posts.length} scheduled posts</span>
          </div>
        )}
      </div>

      {selectedClient ? (
        <div style={styles.calendarContainer}>
          <div style={styles.calendarHeader}>
            <button onClick={() => changeMonth(-1)} style={styles.navButton}>â† Previous</button>
            <h2 style={styles.monthTitle}>
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={() => changeMonth(1)} style={styles.navButton}>Next â†’</button>
          </div>
          <div style={styles.calendar}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} style={styles.dayHeader}>{day}</div>
            ))}
            {renderCalendar()}
          </div>
        </div>
      ) : (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>Select a client to view their content calendar</p>
        </div>
      )}

      {selectedPost && (
        <div style={styles.overlay} onClick={closeModal}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {modalMode === 'edit' ? 'âœï¸ Edit Post' : modalMode === 'repost' ? 'ðŸ” Repost' : 'ðŸ“„ Post Details'}
              </h3>
              <button onClick={closeModal} style={styles.closeBtn}>âœ•</button>
            </div>

            <div style={styles.modalBody}>
              <label style={styles.label}>Content</label>
              <textarea
                style={styles.textarea}
                value={editData.content || ''}
                onChange={e => setEditData({ ...editData, content: e.target.value })}
                disabled={modalMode === 'view'}
                rows={10}
              />

              <label style={styles.label}>Scheduled Time</label>
              <input
                type="datetime-local"
                style={styles.input}
                value={editData.scheduled_time || ''}
                onChange={e => setEditData({ ...editData, scheduled_time: e.target.value })}
                disabled={modalMode === 'view'}
              />

              <label style={styles.label}>Platforms</label>
              <div style={styles.platformRow}>
                {platformList.map(p => (
                  <button
                    key={p}
                    onClick={() => modalMode !== 'view' && togglePlatform(p)}
                    style={{
                      ...styles.platformBtn,
                      ...(editData.platforms?.includes(p) ? styles.platformBtnActive : {}),
                      cursor: modalMode === 'view' ? 'default' : 'pointer',
                    }}
                  >
                    {platformEmoji[p]} {p}
                  </button>
                ))}
              </div>

              <label style={styles.label}>Hashtags</label>
              <input
                type="text"
                style={styles.input}
                value={editData.hashtags || ''}
                onChange={e => setEditData({ ...editData, hashtags: e.target.value })}
                disabled={modalMode === 'view'}
                placeholder="#hashtag1 #hashtag2"
              />
            </div>

            <div style={styles.modalFooter}>
              {modalMode === 'view' && (
                <>
                  <button style={styles.btnEdit} onClick={() => setModalMode('edit')}>âœï¸ Edit</button>
                  <button style={styles.btnRepost} onClick={() => setModalMode('repost')}>ðŸ” Repost</button>
                  <button style={styles.btnDelete} onClick={handleDelete}>ðŸ—‘ï¸ Delete</button>
                </>
              )}
              {modalMode === 'edit' && (
                <>
                  <button style={styles.btnSave} onClick={handleSaveEdit} disabled={saving}>
                    {saving ? 'Saving...' : 'ðŸ’¾ Save Changes'}
                  </button>
                  <button style={styles.btnCancel} onClick={() => setModalMode('view')}>Cancel</button>
                </>
              )}
              {modalMode === 'repost' && (
                <>
                  <button style={styles.btnSave} onClick={handleRepost} disabled={saving}>
                    {saving ? 'Posting...' : 'ðŸ” Confirm Repost'}
                  </button>
                  <button style={styles.btnCancel} onClick={() => setModalMode('view')}>Cancel</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '1400px', position: 'relative' },
  title: { fontSize: '32px', fontWeight: '700', color: '#2d3748', margin: '0 0 10px 0' },
  subtitle: { fontSize: '16px', color: '#718096', margin: '0 0 30px 0' },
  controls: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  select: { padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', minWidth: '250px' },
  stats: { display: 'flex', gap: '10px' },
  statBadge: { padding: '8px 16px', backgroundColor: '#667eea', color: 'white', borderRadius: '6px', fontSize: '14px', fontWeight: '500' },
  calendarContainer: { backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  calendarHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  navButton: { padding: '10px 20px', backgroundColor: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' },
  monthTitle: { fontSize: '24px', fontWeight: '600', color: '#2d3748' },
  calendar: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' },
  dayHeader: { padding: '10px', textAlign: 'center', fontWeight: '600', color: '#718096', fontSize: '14px' },
  calendarDay: { minHeight: '100px', padding: '10px', backgroundColor: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0', position: 'relative' },
  today: { backgroundColor: '#f0f4ff', borderColor: '#667eea', borderWidth: '2px' },
  emptyDay: { minHeight: '100px' },
  dayNumber: { fontSize: '14px', fontWeight: '600', color: '#2d3748', marginBottom: '8px' },
  postIndicator: { fontSize: '11px', color: '#667eea', fontWeight: '500', marginBottom: '8px' },
  postBadge: { display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px', backgroundColor: '#edf2ff', borderRadius: '6px', padding: '4px 6px', cursor: 'pointer', border: '1px solid #c3dafe' },
  postBadgeIcons: { display: 'flex', gap: '2px', flexWrap: 'wrap' },
  postTime: { fontSize: '10px', color: '#667eea', fontWeight: '600' },
  emptyState: { backgroundColor: 'white', padding: '60px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  emptyText: { fontSize: '16px', color: '#718096' },
  toast: { position: 'fixed', top: '20px', right: '20px', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', zIndex: 9999, fontSize: '14px' },
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: 'white', borderRadius: '12px', width: '720px', maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f7fafc' },
  modalTitle: { fontSize: '18px', fontWeight: '700', color: '#2d3748', margin: 0 },
  closeBtn: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#718096' },
  modalBody: { padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '75vh', overflowY: 'auto' },
  label: { fontSize: '13px', fontWeight: '600', color: '#4a5568', marginBottom: '4px', display: 'block' },
  textarea: { width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' },
  input: { width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' },
  platformRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  platformBtn: { padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', backgroundColor: '#f7fafc', color: '#4a5568' },
  platformBtnActive: { backgroundColor: '#667eea', color: 'white', borderColor: '#667eea' },
  modalFooter: { padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px', justifyContent: 'flex-end' },
  btnEdit: { padding: '10px 20px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  btnRepost: { padding: '10px 20px', backgroundColor: '#38a169', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  btnDelete: { padding: '10px 20px', backgroundColor: '#e53e3e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  btnSave: { padding: '10px 20px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  btnCancel: { padding: '10px 20px', backgroundColor: '#e2e8f0', color: '#4a5568', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
};

export default Calendar;
