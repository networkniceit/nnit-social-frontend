import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CreatePost() {
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    clientId: '',
    content: '',
    platforms: [],
    scheduledTime: '',
    hashtags: ''
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [variations, setVariations] = useState([]);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get('/api/clients');
      setClients(response.data.clients);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const generateCaption = async () => {
    if (!formData.clientId) {
      alert('Please select a client first');
      return;
    }

    setAiLoading(true);
    try {
      const response = await axios.post('/api/ai/generate-caption', {
        topic: formData.content || 'engaging social media post',
        tone: 'engaging',
        length: 'medium',
        clientId: formData.clientId,
        includeEmojis: true,
        includeHashtags: true
      });

      setFormData({ ...formData, content: response.data.caption });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate caption');
    }
    setAiLoading(false);
  };

  const generateVariations = async () => {
    if (!formData.content) {
      alert('Please write or generate content first');
      return;
    }

    setAiLoading(true);
    try {
      const response = await axios.post('/api/ai/generate-variations', {
        caption: formData.content,
        count: 3,
        clientId: formData.clientId
      });

      setVariations(response.data.variations);
    } catch (error) {
      console.error('Error:', error);
    }
    setAiLoading(false);
  };

  const generateHashtags = async () => {
    if (!formData.content) {
      alert('Please write content first');
      return;
    }

    setAiLoading(true);
    try {
      const client = clients.find(c => c.id === formData.clientId);
      const response = await axios.post('/api/ai/generate-hashtags', {
        content: formData.content,
        industry: client?.industry,
        count: 10
      });

      setFormData({
        ...formData,
        hashtags: response.data.hashtags.join(' ')
      });
    } catch (error) {
      console.error('Error:', error);
    }
    setAiLoading(false);
  };

  const handlePlatformToggle = (platform) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    
    if (!formData.clientId || !formData.content || formData.platforms.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await axios.post('/api/posts/schedule', {
        ...formData,
        scheduledTime: formData.scheduledTime || new Date().toISOString()
      });

      alert('Post scheduled successfully!');
      
      // Reset form
      setFormData({
        clientId: '',
        content: '',
        platforms: [],
        scheduledTime: '',
        hashtags: ''
      });
      setVariations([]);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to schedule post');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Create Post</h1>
      <p style={styles.subtitle}>Schedule social media posts with AI assistance</p>

      <div style={styles.grid}>
        {/* Main Form */}
        <div style={styles.mainColumn}>
          <form onSubmit={handleSchedule} style={styles.form}>
            {/* Client Selection */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Select Client *</label>
              <select
                value={formData.clientId}
                onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                style={styles.select}
                required
              >
                <option value="">-- Choose a client --</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({client.industry})
                  </option>
                ))}
              </select>
            </div>

            {/* Content */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Post Content *</label>
              <textarea
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                style={styles.textarea}
                placeholder="Write your post content here..."
                rows="6"
              />
              <div style={styles.aiButtons}>
                <button
                  type="button"
                  onClick={generateCaption}
                  disabled={aiLoading}
                  style={styles.aiButton}
                >
                  🤖 {aiLoading ? 'Generating...' : 'Generate with AI'}
                </button>
                <button
                  type="button"
                  onClick={generateVariations}
                  disabled={aiLoading || !formData.content}
                  style={styles.aiButton}
                >
                  ✨ Get Variations
                </button>
              </div>
            </div>

            {/* Variations */}
            {variations.length > 0 && (
              <div style={styles.variations}>
                <label style={styles.label}>AI Generated Variations:</label>
                {variations.map((variation, index) => (
                  <div
                    key={index}
                    style={styles.variation}
                    onClick={() => setFormData({ ...formData, content: variation })}
                  >
                    <span style={styles.variationNumber}>{index + 1}</span>
                    <p style={styles.variationText}>{variation}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Hashtags */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Hashtags</label>
              <div style={styles.hashtagWrapper}>
                <input
                  type="text"
                  value={formData.hashtags}
                  onChange={e => setFormData({ ...formData, hashtags: e.target.value })}
                  style={styles.input}
                  placeholder="#marketing #socialmedia"
                />
                <button
                  type="button"
                  onClick={generateHashtags}
                  disabled={aiLoading || !formData.content}
                  style={styles.hashtagButton}
                >
                  # Generate
                </button>
              </div>
            </div>

            {/* Platforms */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Select Platforms *</label>
              <div style={styles.platformGrid}>
                {[
                  { name: 'facebook', icon: '📘', label: 'Facebook' },
                  { name: 'instagram', icon: '📸', label: 'Instagram' },
                  { name: 'twitter', icon: '🐦', label: 'Twitter/X' },
                  { name: 'linkedin', icon: '💼', label: 'LinkedIn' },
                  { name: 'tiktok', icon: '🎵', label: 'TikTok' }
                ].map(platform => (
                  <button
                    key={platform.name}
                    type="button"
                    onClick={() => handlePlatformToggle(platform.name)}
                    style={{
                      ...styles.platformCard,
                      ...(formData.platforms.includes(platform.name) ? styles.platformCardActive : {})
                    }}
                  >
                    <span style={styles.platformIcon}>{platform.icon}</span>
                    <span>{platform.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule Time */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Schedule Time (optional)</label>
              <input
                type="datetime-local"
                value={formData.scheduledTime}
                onChange={e => setFormData({ ...formData, scheduledTime: e.target.value })}
                style={styles.input}
              />
              <p style={styles.hint}>Leave empty to publish immediately</p>
            </div>

            {/* Submit Buttons */}
            <div style={styles.submitButtons}>
              <button type="submit" style={styles.scheduleButton}>
                📅 Schedule Post
              </button>
              <button
                type="button"
                onClick={handleSchedule}
                style={styles.publishButton}
              >
                📤 Publish Now
              </button>
            </div>
          </form>
        </div>

        {/* Preview Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.previewCard}>
            <h3 style={styles.previewTitle}>Post Preview</h3>
            
            {formData.clientId && (
              <div style={styles.clientBadge}>
                {clients.find(c => c.id === formData.clientId)?.name}
              </div>
            )}

            <div style={styles.previewContent}>
              {formData.content || (
                <p style={styles.placeholder}>Your post content will appear here...</p>
              )}
            </div>

            {formData.hashtags && (
              <div style={styles.hashtagPreview}>
                {formData.hashtags}
              </div>
            )}

            {formData.platforms.length > 0 && (
              <div style={styles.platformPreview}>
                <p style={styles.previewLabel}>Publishing to:</p>
                <div style={styles.platformIcons}>
                  {formData.platforms.map(p => (
                    <span key={p} style={styles.platformIconSmall}>
                      {p === 'facebook' && '📘'}
                      {p === 'instagram' && '📸'}
                      {p === 'twitter' && '🐦'}
                      {p === 'linkedin' && '💼'}
                      {p === 'tiktok' && '🎵'}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {formData.scheduledTime && (
              <div style={styles.schedulePreview}>
                <p style={styles.previewLabel}>Scheduled for:</p>
                <p style={styles.scheduleTime}>
                  {new Date(formData.scheduledTime).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* AI Tips */}
          <div style={styles.tipsCard}>
            <h4 style={styles.tipsTitle}>💡 AI Tips</h4>
            <ul style={styles.tipsList}>
              <li>Use "Generate with AI" for instant captions</li>
              <li>Try "Get Variations" for different styles</li>
              <li>Click on any variation to use it</li>
              <li>Generate hashtags based on your content</li>
              <li>Schedule posts for optimal times</li>
            </ul>
          </div>
        </div>
      </div>
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
  grid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '30px',
  },
  mainColumn: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '8px',
  },
  select: {
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
  },
  textarea: {
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  input: {
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
  },
  aiButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  },
  aiButton: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  variations: {
    marginTop: '15px',
  },
  variation: {
    padding: '15px',
    backgroundColor: '#f7fafc',
    borderRadius: '8px',
    marginTop: '10px',
    cursor: 'pointer',
    border: '2px solid transparent',
    display: 'flex',
    gap: '12px',
    transition: 'all 0.3s',
  },
  variationNumber: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#667eea',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
    flexShrink: 0,
  },
  variationText: {
    flex: 1,
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.6',
  },
  hashtagWrapper: {
    display: 'flex',
    gap: '10px',
  },
  hashtagButton: {
    padding: '12px 20px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
  platformGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
  },
  platformCard: {
    padding: '15px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: 'white',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s',
  },
  platformCardActive: {
    borderColor: '#667eea',
    backgroundColor: '#f7f7ff',
  },
  platformIcon: {
    fontSize: '28px',
  },
  hint: {
    fontSize: '12px',
    color: '#718096',
    margin: '5px 0 0 0',
  },
  submitButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginTop: '10px',
  },
  scheduleButton: {
    padding: '14px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
  },
  publishButton: {
    padding: '14px',
    backgroundColor: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  previewCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  previewTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '15px',
  },
  clientBadge: {
    display: 'inline-block',
    padding: '6px 12px',
    backgroundColor: '#667eea',
    color: 'white',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    marginBottom: '15px',
  },
  previewContent: {
    padding: '15px',
    backgroundColor: '#f7fafc',
    borderRadius: '8px',
    minHeight: '120px',
    marginBottom: '15px',
    lineHeight: '1.6',
  },
  placeholder: {
    color: '#a0aec0',
    fontStyle: 'italic',
  },
  hashtagPreview: {
    padding: '10px',
    backgroundColor: '#f0f4ff',
    borderRadius: '6px',
    color: '#667eea',
    fontSize: '14px',
    marginBottom: '15px',
  },
  platformPreview: {
    marginBottom: '15px',
  },
  previewLabel: {
    fontSize: '12px',
    color: '#718096',
    marginBottom: '8px',
  },
  platformIcons: {
    display: 'flex',
    gap: '8px',
  },
  platformIconSmall: {
    fontSize: '24px',
  },
  schedulePreview: {},
  scheduleTime: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2d3748',
  },
  tipsCard: {
    backgroundColor: '#f0f4ff',
    padding: '20px',
    borderRadius: '12px',
  },
  tipsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#667eea',
  },
  tipsList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '13px',
    lineHeight: '1.8',
    color: '#4a5568',
  },
};

export default CreatePost;