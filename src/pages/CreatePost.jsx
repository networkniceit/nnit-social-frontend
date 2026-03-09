import React, { useState, useEffect } from 'react';
import axios from '../axios-config';
import { API_URL } from '../config';

function CreatePost() {
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    clientId: '',
    content: '',
    platforms: [],
    scheduledTime: '',
    hashtags: '',
    videoUrl: ''
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [variations, setVariations] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [postResults, setPostResults] = useState([]);
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);

  useEffect(() => {
    fetchClients();
    loadConnectedPlatforms();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get('/api/clients');
      setClients(response.data.clients || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const loadConnectedPlatforms = async () => {
    const checks = [
      { platform: 'facebook', url: `${API_URL}/api/auth/facebook/load?userId=1` },
      { platform: 'instagram', url: `${API_URL}/api/auth/instagram/load?userId=1` },
      { platform: 'twitter', url: `${API_URL}/api/auth/twitter/load?userId=1` },
      { platform: 'linkedin', url: `${API_URL}/api/auth/linkedin/load?userId=1` },
      { platform: 'tiktok', url: `${API_URL}/api/auth/tiktok/load?userId=1` },
      { platform: 'youtube', url: `${API_URL}/api/auth/youtube/load?userId=1` }
    ];
    const connected = [];
    for (const check of checks) {
      try {
        const res = await fetch(check.url);
        const data = await res.json();
        if (data.success || data.connected) connected.push(check.platform);
      } catch {}
    }
    setConnectedPlatforms(connected);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
  };

  const generateCaption = async () => {
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
      alert('Failed to generate caption');
    }
    setAiLoading(false);
  };

  const generateVariations = async () => {
    if (!formData.content) { alert('Please write or generate content first'); return; }
    setAiLoading(true);
    try {
      const response = await axios.post('/api/ai/generate-variations', {
        caption: formData.content,
        count: 3,
        clientId: formData.clientId
      });
      setVariations(response.data.variations || []);
    } catch (error) {
      console.error('Error:', error);
      setVariations([]);
    }
    setAiLoading(false);
  };

  const generateHashtags = async () => {
    if (!formData.content) { alert('Please write content first'); return; }
    setAiLoading(true);
    try {
      const client = clients.find(c => c.id === formData.clientId);
      const response = await axios.post('/api/ai/generate-hashtags', {
        content: formData.content,
        industry: client?.industry,
        count: 10
      });
      setFormData({ ...formData, hashtags: (response.data.hashtags || []).join(' ') });
    } catch (error) {
      console.error('Error:', error);
    }
    setAiLoading(false);
  };

  const handlePlatformToggle = (platform) => {
    if (!connectedPlatforms.includes(platform)) {
      alert(`${platform} is not connected. Go to Settings to connect it.`);
      return;
    }
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const uploadToCloudinary = async (file, type = 'image') => {
    const fd = new FormData();
    fd.append(type, file);
    const uploadRes = await fetch(`${API_URL}/api/upload/${type}`, { method: 'POST', body: fd });
    const uploadData = await uploadRes.json();
    if (!uploadData.url) throw new Error(`${type} upload failed`);
    return uploadData.url;
  };

  const postToAllPlatforms = async () => {
    if (!formData.content || formData.platforms.length === 0) {
      alert('Please add content and select at least one platform');
      return;
    }

    setPosting(true);
    setPostResults([]);
    const results = [];
    const fullContent = formData.content + (formData.hashtags ? '\n\n' + formData.hashtags : '');

    let imageUrl = null;
    let videoUrl = formData.videoUrl || null;

    if (imageFile) {
      try {
        imageUrl = await uploadToCloudinary(imageFile, 'image');
      } catch (err) {
        console.error('Image upload failed:', err);
      }
    }

    if (videoFile) {
      try {
        videoUrl = await uploadToCloudinary(videoFile, 'video');
      } catch (err) {
        console.error('Video upload failed:', err);
      }
    }

    for (const platform of formData.platforms) {
      try {
        const body = { content: fullContent, userId: 1 };

        if (platform === 'instagram') {
          if (videoUrl) {
            body.videoUrl = videoUrl;
            body.mediaType = 'REELS';
          } else {
            body.imageUrl = imageUrl;
            body.mediaType = 'IMAGE';
          }
        }
        if (platform === 'facebook') {
          body.imageUrl = imageUrl;
          body.videoUrl = videoUrl;
        }
        if (platform === 'tiktok') {
          body.videoUrl = videoUrl;
        }
        if (platform === 'youtube') {
          body.videoUrl = videoUrl;
        }

        const response = await fetch(`${API_URL}/api/${platform}/post`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await response.json();
        results.push({ platform, success: data.success, postId: data.postId, error: data.error });
      } catch (err) {
        results.push({ platform, success: false, error: err.message });
      }
    }

    setPostResults(results);
    setPosting(false);

    const successCount = results.filter(r => r.success).length;
    if (successCount === results.length) {
      alert(`✅ Posted successfully to all ${successCount} platforms!`);
      setFormData({ clientId: '', content: '', platforms: [], scheduledTime: '', hashtags: '', videoUrl: '' });
      setVariations([]);
      setImageFile(null);
      setImagePreview(null);
      setVideoFile(null);
      setVideoPreview(null);
    } else {
      alert(`Posted to ${successCount}/${results.length} platforms. Check results below.`);
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!formData.content || formData.platforms.length === 0) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      await axios.post('/api/posts/schedule', {
        ...formData,
        scheduledTime: formData.scheduledTime || new Date().toISOString()
      });
      alert('Post scheduled successfully!');
      setFormData({ clientId: '', content: '', platforms: [], scheduledTime: '', hashtags: '', videoUrl: '' });
      setVariations([]);
    } catch (error) {
      alert('Failed to schedule post');
    }
  };

  const platformList = [
    { name: 'facebook', icon: '📘', label: 'Facebook' },
    { name: 'instagram', icon: '📸', label: 'Instagram' },
    { name: 'twitter', icon: '🐦', label: 'Twitter/X' },
    { name: 'linkedin', icon: '💼', label: 'LinkedIn' },
    { name: 'tiktok', icon: '🎵', label: 'TikTok' },
    { name: 'youtube', icon: '▶️', label: 'YouTube' }
  ];

  const platformIcons = { facebook: '📘', instagram: '📸', twitter: '🐦', linkedin: '💼', tiktok: '🎵', youtube: '▶️' };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Create Post</h1>
      <p style={styles.subtitle}>Post to all your social media platforms at once</p>

      <div style={styles.grid}>
        <div style={styles.mainColumn}>
          <div style={styles.form}>

            {clients.length > 0 && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Select Client (optional)</label>
                <select
                  value={formData.clientId}
                  onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                  style={styles.select}
                >
                  <option value="">-- Personal / No client --</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.industry})
                    </option>
                  ))}
                </select>
              </div>
            )}

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
                <button type="button" onClick={generateCaption} disabled={aiLoading} style={styles.aiButton}>
                  🤖 {aiLoading ? 'Generating...' : 'Generate with AI'}
                </button>
                <button type="button" onClick={generateVariations} disabled={aiLoading || !formData.content} style={styles.aiButton}>
                  ✨ Get Variations
                </button>
              </div>
            </div>

            {variations.length > 0 && (
              <div style={styles.variations}>
                <label style={styles.label}>AI Generated Variations:</label>
                {variations.map((variation, index) => (
                  <div key={index} style={styles.variation} onClick={() => setFormData({ ...formData, content: variation })}>
                    <span style={styles.variationNumber}>{index + 1}</span>
                    <p style={styles.variationText}>{variation}</p>
                  </div>
                ))}
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>Hashtags</label>
              <div style={styles.hashtagWrapper}>
                <input
                  type="text"
                  value={formData.hashtags}
                  onChange={e => setFormData({ ...formData, hashtags: e.target.value })}
                  style={{ ...styles.input, flex: 1 }}
                  placeholder="#marketing #socialmedia"
                />
                <button type="button" onClick={generateHashtags} disabled={aiLoading || !formData.content} style={styles.hashtagButton}>
                  # Generate
                </button>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>🖼️ Image — Facebook, Instagram (optional)</label>
              {imagePreview ? (
                <div style={styles.imagePreviewWrapper}>
                  <img src={imagePreview} alt="Preview" style={styles.imagePreview} />
                  <button type="button" onClick={removeImage} style={styles.removeImageBtn}>✕ Remove</button>
                </div>
              ) : (
                <label style={styles.uploadArea}>
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  <span style={{ fontSize: '32px' }}>🖼️</span>
                  <span style={{ fontSize: '14px', color: '#718096', marginTop: '8px' }}>Click to upload image</span>
                </label>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>🎬 Video — Instagram Reels, TikTok, YouTube, Facebook (optional)</label>
              {videoPreview ? (
                <div style={styles.imagePreviewWrapper}>
                  <video src={videoPreview} controls style={{ maxWidth: '100%', borderRadius: '8px', maxHeight: '200px' }} />
                  <button type="button" onClick={removeVideo} style={styles.removeImageBtn}>✕ Remove</button>
                </div>
              ) : (
                <label style={styles.uploadArea}>
                  <input type="file" accept="video/mp4,video/*" onChange={handleVideoChange} style={{ display: 'none' }} />
                  <span style={{ fontSize: '32px' }}>🎬</span>
                  <span style={{ fontSize: '14px', color: '#718096', marginTop: '8px' }}>
                    {videoFile ? `✅ ${videoFile.name}` : 'Click to upload video'}
                  </span>
                </label>
              )}
              <p style={styles.hint}>Used for Instagram Reels, TikTok, YouTube, and Facebook video posts</p>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Select Platforms *</label>
              <div style={styles.platformGrid}>
                {platformList.map(platform => {
                  const isConnected = connectedPlatforms.includes(platform.name);
                  const isSelected = formData.platforms.includes(platform.name);
                  return (
                    <button
                      key={platform.name}
                      type="button"
                      onClick={() => handlePlatformToggle(platform.name)}
                      style={{
                        ...styles.platformCard,
                        ...(isSelected ? styles.platformCardActive : {}),
                        ...(isConnected ? {} : styles.platformCardDisabled)
                      }}
                    >
                      <span style={styles.platformIcon}>{platform.icon}</span>
                      <span style={{ fontSize: '12px' }}>{platform.label}</span>
                      {!isConnected && <span style={styles.notConnectedBadge}>Not connected</span>}
                    </button>
                  );
                })}
              </div>
            </div>

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

            <div style={styles.submitButtons}>
              <button type="button" onClick={handleSchedule} style={styles.scheduleButton}>
                📅 Schedule Post
              </button>
              <button type="button" onClick={postToAllPlatforms} disabled={posting} style={styles.publishButton}>
                {posting ? '⏳ Posting...' : '📤 Publish Now'}
              </button>
            </div>

            {postResults.length > 0 && (
              <div style={styles.resultsSection}>
                <h4 style={styles.resultsTitle}>Post Results:</h4>
                {postResults.map((result, i) => (
                  <div key={i} style={{ ...styles.resultItem, borderColor: result.success ? '#48bb78' : '#fc8181' }}>
                    <span>{platformIcons[result.platform]} {result.platform}</span>
                    <span style={{ color: result.success ? '#48bb78' : '#e53e3e', fontWeight: '600' }}>
                      {result.success ? '✅ Posted' : `❌ ${result.error}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={styles.sidebar}>
          <div style={styles.previewCard}>
            <h3 style={styles.previewTitle}>Post Preview</h3>
            {formData.clientId && (
              <div style={styles.clientBadge}>
                {clients.find(c => c.id === formData.clientId)?.name}
              </div>
            )}
            {imagePreview && (
              <img src={imagePreview} alt="Preview" style={{ width: '100%', borderRadius: '8px', marginBottom: '15px' }} />
            )}
            {videoPreview && (
              <video src={videoPreview} controls style={{ width: '100%', borderRadius: '8px', marginBottom: '15px' }} />
            )}
            <div style={styles.previewContent}>
              {formData.content
                ? <p style={{ margin: 0, lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{formData.content}</p>
                : <p style={styles.placeholder}>Your post content will appear here...</p>
              }
            </div>
            {formData.hashtags && (
              <div style={styles.hashtagPreview}>{formData.hashtags}</div>
            )}
            {formData.platforms.length > 0 && (
              <div style={styles.platformPreview}>
                <p style={styles.previewLabel}>Publishing to:</p>
                <div style={styles.platformIcons}>
                  {formData.platforms.map(p => (
                    <span key={p} style={styles.platformIconSmall}>{platformIcons[p]}</span>
                  ))}
                </div>
              </div>
            )}
            {formData.scheduledTime && (
              <div style={styles.schedulePreview}>
                <p style={styles.previewLabel}>Scheduled for:</p>
                <p style={styles.scheduleTime}>{new Date(formData.scheduledTime).toLocaleString()}</p>
              </div>
            )}
          </div>

          <div style={styles.tipsCard}>
            <h4 style={styles.tipsTitle}>🔗 Connected Platforms</h4>
            {platformList.map(p => (
              <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                <span>{p.icon} {p.label}</span>
                <span style={{ color: connectedPlatforms.includes(p.name) ? '#48bb78' : '#fc8181', fontWeight: '600' }}>
                  {connectedPlatforms.includes(p.name) ? '✓ Connected' : '✗ Not connected'}
                </span>
              </div>
            ))}
          </div>

          <div style={{ ...styles.tipsCard, backgroundColor: '#f0f4ff' }}>
            <h4 style={{ ...styles.tipsTitle, color: '#667eea' }}>💡 Tips</h4>
            <ul style={styles.tipsList}>
              <li>Upload image for Facebook & Instagram photo posts</li>
              <li>Upload video for Instagram Reels, TikTok, YouTube & Facebook</li>
              <li>Use "Generate with AI" for instant captions</li>
              <li>Try "Get Variations" for different styles</li>
              <li>Generate hashtags based on your content</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1400px' },
  title: { fontSize: '32px', fontWeight: '700', color: '#2d3748', margin: '0 0 10px 0' },
  subtitle: { fontSize: '16px', color: '#718096', margin: '0 0 30px 0' },
  grid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' },
  mainColumn: { backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  form: { display: 'flex', flexDirection: 'column', gap: '25px' },
  formGroup: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '14px', fontWeight: '600', color: '#2d3748', marginBottom: '8px' },
  select: { padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' },
  textarea: { padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit' },
  input: { padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' },
  aiButtons: { display: 'flex', gap: '10px', marginTop: '10px' },
  aiButton: { padding: '10px 20px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  variations: { marginTop: '15px' },
  variation: { padding: '15px', backgroundColor: '#f7fafc', borderRadius: '8px', marginTop: '10px', cursor: 'pointer', border: '2px solid transparent', display: 'flex', gap: '12px' },
  variationNumber: { width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#667eea', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 },
  variationText: { flex: 1, margin: 0, fontSize: '14px', lineHeight: '1.6' },
  hashtagWrapper: { display: 'flex', gap: '10px' },
  hashtagButton: { padding: '12px 20px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', whiteSpace: 'nowrap' },
  uploadArea: { border: '2px dashed #e2e8f0', borderRadius: '8px', padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', backgroundColor: '#f7fafc' },
  imagePreviewWrapper: { position: 'relative', display: 'inline-block', width: '100%' },
  imagePreview: { maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', objectFit: 'cover' },
  removeImageBtn: { position: 'absolute', top: '8px', right: '8px', padding: '4px 10px', backgroundColor: '#e53e3e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
  platformGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' },
  platformCard: { padding: '15px', border: '2px solid #e2e8f0', borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  platformCardActive: { borderColor: '#667eea', backgroundColor: '#f7f7ff' },
  platformCardDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  platformIcon: { fontSize: '28px' },
  notConnectedBadge: { fontSize: '9px', backgroundColor: '#fed7d7', color: '#c53030', padding: '2px 6px', borderRadius: '4px' },
  hint: { fontSize: '12px', color: '#718096', margin: '5px 0 0 0' },
  submitButtons: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' },
  scheduleButton: { padding: '14px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '600' },
  publishButton: { padding: '14px', backgroundColor: '#48bb78', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '600' },
  resultsSection: { marginTop: '10px', padding: '15px', backgroundColor: '#f7fafc', borderRadius: '8px' },
  resultsTitle: { margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' },
  resultItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid', borderRadius: '6px', marginBottom: '8px', backgroundColor: 'white', fontSize: '14px' },
  sidebar: { display: 'flex', flexDirection: 'column', gap: '20px' },
  previewCard: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  previewTitle: { fontSize: '18px', fontWeight: '600', marginBottom: '15px' },
  clientBadge: { display: 'inline-block', padding: '6px 12px', backgroundColor: '#667eea', color: 'white', borderRadius: '6px', fontSize: '12px', fontWeight: '500', marginBottom: '15px' },
  previewContent: { padding: '15px', backgroundColor: '#f7fafc', borderRadius: '8px', minHeight: '120px', marginBottom: '15px', lineHeight: '1.6' },
  placeholder: { color: '#a0aec0', fontStyle: 'italic', margin: 0 },
  hashtagPreview: { padding: '10px', backgroundColor: '#f0f4ff', borderRadius: '6px', color: '#667eea', fontSize: '14px', marginBottom: '15px' },
  platformPreview: { marginBottom: '15px' },
  previewLabel: { fontSize: '12px', color: '#718096', marginBottom: '8px' },
  platformIcons: { display: 'flex', gap: '8px' },
  platformIconSmall: { fontSize: '24px' },
  schedulePreview: {},
  scheduleTime: { fontSize: '14px', fontWeight: '600', color: '#2d3748' },
  tipsCard: { backgroundColor: '#f0fff4', padding: '20px', borderRadius: '12px' },
  tipsTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#48bb78' },
  tipsList: { margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.8', color: '#4a5568' },
};

export default CreatePost;
