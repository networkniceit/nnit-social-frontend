import React, { useState } from 'react';
import axios from '../axios-config';

function AIAssistant() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [activeTab, setActiveTab] = useState('ideas');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [speaking, setSpeaking] = useState(false);

  const [formData, setFormData] = useState({
    topic: '',
    industry: '',
    audience: '',
    comment: '',
    postContent: '',
    sentiment: 'neutral',
    voiceText: '',
    voiceStyle: 'professional',
    videoTopic: '',
    videoPlatform: 'instagram',
    videoDuration: '30',
    photoTopic: '',
    photoStyle: 'modern',
    photoCount: '4'
  });

  React.useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get('/api/clients');
      setClients(response.data.clients || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const generateContentIdeas = async () => {
    setLoading(true);
    setResults(null);
    try {
      const response = await axios.post('/api/ai/content-ideas', {
        industry: formData.industry || 'general',
        audience: formData.audience || 'general audience',
        count: 10,
        clientId: selectedClient
      });
      setResults({ ideas: response.data.ideas });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate ideas');
    }
    setLoading(false);
  };

  const generateReply = async () => {
    setLoading(true);
    setResults(null);
    try {
      const response = await axios.post('/api/ai/generate-reply', {
        comment: formData.comment,
        postContent: formData.postContent,
        sentiment: formData.sentiment,
        clientId: selectedClient
      });
      setResults({ reply: response.data.reply });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate reply');
    }
    setLoading(false);
  };

  const generateBestTimes = async () => {
    if (!selectedClient) {
      alert('Please select a client first');
      return;
    }
    setLoading(true);
    setResults(null);
    try {
      const response = await axios.get(`/api/insights/${selectedClient}/best-times`);
      setResults({ bestTimes: response.data.recommendations });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to get best times');
    }
    setLoading(false);
  };

  // Voice - uses browser Web Speech API (free, no backend)
  const generateVoice = () => {
    const text = formData.voiceText.trim();
    if (!text) { alert('Please enter text to speak'); return; }
    if (!window.speechSynthesis) { alert('Your browser does not support text-to-speech'); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    if (formData.voiceStyle === 'professional') {
      const eng = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('google'));
      if (eng) utterance.voice = eng;
      utterance.rate = 0.95; utterance.pitch = 1.0;
    } else if (formData.voiceStyle === 'energetic') {
      utterance.rate = 1.2; utterance.pitch = 1.2;
    } else {
      utterance.rate = 0.85; utterance.pitch = 0.9;
    }
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setResults({ voice: { text, style: formData.voiceStyle } });
  };

  const stopVoice = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  // Video Script - uses Groq via backend
  const generateVideoScript = async () => {
    if (!formData.videoTopic) { alert('Please enter a video topic'); return; }
    setLoading(true);
    setResults(null);
    try {
      const response = await axios.post('/api/ai/video-script', {
        topic: formData.videoTopic,
        platform: formData.videoPlatform,
        duration: formData.videoDuration
      });
      setResults({ videoScript: response.data.script });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate video script');
    }
    setLoading(false);
  };

  // Photo Prompts - uses Groq via backend
  const generatePhotoPrompts = async () => {
    if (!formData.photoTopic) { alert('Please enter a photo topic'); return; }
    setLoading(true);
    setResults(null);
    try {
      const response = await axios.post('/api/ai/photo-prompts', {
        topic: formData.photoTopic,
        style: formData.photoStyle,
        count: formData.photoCount
      });
      setResults({ photoPrompts: response.data.prompts });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate photo prompts');
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'ideas', label: '💡 Content Ideas' },
    { id: 'replies', label: '💬 Comment Replies' },
    { id: 'timing', label: '⏰ Best Times' },
    { id: 'voice', label: '🎙️ Voice' },
    { id: 'video', label: '🎬 Video Script' },
    { id: 'photo', label: '📸 Photo Prompts' },
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>AI Assistant</h1>
      <p style={styles.subtitle}>Let AI help you create better content</p>

      <select
        value={selectedClient}
        onChange={e => setSelectedClient(e.target.value)}
        style={styles.select}
      >
        <option value="">-- Select a client (optional) --</option>
        {clients.map(client => (
          <option key={client.id} value={client.id}>{client.name}</option>
        ))}
      </select>

      {/* Tabs */}
      <div style={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setResults(null); }}
            style={{ ...styles.tab, ...(activeTab === tab.id ? styles.tabActive : {}) }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Ideas */}
      {activeTab === 'ideas' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Generate Content Ideas</h2>
          <div style={styles.form}>
            <input
              type="text"
              placeholder="Industry (e.g., fitness, tech, food)"
              value={formData.industry}
              onChange={e => setFormData({ ...formData, industry: e.target.value })}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Target audience (e.g., millennials, business owners)"
              value={formData.audience}
              onChange={e => setFormData({ ...formData, audience: e.target.value })}
              style={styles.input}
            />
            <button onClick={generateContentIdeas} disabled={loading} style={styles.button}>
              {loading ? '⏳ Generating...' : '✨ Generate Ideas'}
            </button>
          </div>
          {results?.ideas && (
            <div style={styles.results}>
              <h3 style={styles.resultsTitle}>Content Ideas:</h3>
              <ul style={styles.ideasList}>
                {results.ideas.map((idea, i) => (
                  <li key={i} style={styles.ideaItem}>{idea}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Comment Replies */}
      {activeTab === 'replies' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Generate Comment Reply</h2>
          <div style={styles.form}>
            <textarea
              placeholder="Original post content"
              value={formData.postContent}
              onChange={e => setFormData({ ...formData, postContent: e.target.value })}
              style={styles.textarea}
              rows="3"
            />
            <textarea
              placeholder="Comment to reply to"
              value={formData.comment}
              onChange={e => setFormData({ ...formData, comment: e.target.value })}
              style={styles.textarea}
              rows="2"
            />
            <select
              value={formData.sentiment}
              onChange={e => setFormData({ ...formData, sentiment: e.target.value })}
              style={styles.select}
            >
              <option value="positive">Positive comment</option>
              <option value="neutral">Neutral comment</option>
              <option value="negative">Negative comment</option>
            </select>
            <button onClick={generateReply} disabled={loading} style={styles.button}>
              {loading ? '⏳ Generating...' : '💬 Generate Reply'}
            </button>
          </div>
          {results?.reply && (
            <div style={styles.results}>
              <h3 style={styles.resultsTitle}>Suggested Reply:</h3>
              <div style={styles.replyBox}>{results.reply}</div>
            </div>
          )}
        </div>
      )}

      {/* Best Times */}
      {activeTab === 'timing' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Best Times to Post</h2>
          <p style={styles.description}>AI analyzes your industry and audience to suggest optimal posting times</p>
          <button onClick={generateBestTimes} disabled={loading || !selectedClient} style={styles.button}>
            {loading ? '⏳ Analyzing...' : '⏰ Get Best Times'}
          </button>
          {!selectedClient && <p style={{ color: '#e53e3e', fontSize: '13px', marginTop: '8px' }}>Please select a client above first</p>}
          {results?.bestTimes && (
            <div style={styles.results}>
              <h3 style={styles.resultsTitle}>Recommended Posting Times:</h3>
              <div style={styles.timesGrid}>
                {results.bestTimes.map((time, i) => (
                  <div key={i} style={styles.timeCard}>
                    <h4 style={styles.timeDay}>{time.day}</h4>
                    <p style={styles.timeHour}>{time.time}</p>
                    <p style={styles.timeReason}>{time.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Voice */}
      {activeTab === 'voice' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🎙️ Voice Generator</h2>
          <p style={styles.description}>Convert your social media captions or scripts into spoken audio using your browser's built-in voice engine.</p>
          <div style={styles.form}>
            <textarea
              placeholder="Enter your caption, script, or announcement to speak..."
              value={formData.voiceText}
              onChange={e => setFormData({ ...formData, voiceText: e.target.value })}
              style={styles.textarea}
              rows="5"
            />
            <select
              value={formData.voiceStyle}
              onChange={e => setFormData({ ...formData, voiceStyle: e.target.value })}
              style={styles.select}
            >
              <option value="professional">Professional (clear, steady)</option>
              <option value="energetic">Energetic (fast, upbeat)</option>
              <option value="calm">Calm (slow, relaxed)</option>
            </select>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={generateVoice} disabled={speaking} style={styles.button}>
                {speaking ? '🔊 Speaking...' : '▶️ Play Voice'}
              </button>
              {speaking && (
                <button onClick={stopVoice} style={{ ...styles.button, background: '#e53e3e' }}>
                  ⏹️ Stop
                </button>
              )}
            </div>
          </div>
          {results?.voice && (
            <div style={styles.results}>
              <h3 style={styles.resultsTitle}>✅ Playing voice preview</h3>
              <p style={{ fontSize: '14px', color: '#718096' }}>Style: <strong>{results.voice.style}</strong></p>
              <div style={styles.replyBox}>{results.voice.text}</div>
              <p style={{ fontSize: '12px', color: '#a0aec0', marginTop: '10px' }}>
                💡 Tip: Use your device's screen recorder to capture the audio for your video content.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Video Script */}
      {activeTab === 'video' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🎬 Video Script Generator</h2>
          <p style={styles.description}>Generate a ready-to-film video script optimized for your platform and duration.</p>
          <div style={styles.form}>
            <input
              type="text"
              placeholder="Video topic (e.g., 5 tips for better sleep, product demo)"
              value={formData.videoTopic}
              onChange={e => setFormData({ ...formData, videoTopic: e.target.value })}
              style={styles.input}
            />
            <select
              value={formData.videoPlatform}
              onChange={e => setFormData({ ...formData, videoPlatform: e.target.value })}
              style={styles.select}
            >
              <option value="instagram">Instagram Reels</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube Shorts</option>
              <option value="facebook">Facebook Video</option>
              <option value="linkedin">LinkedIn Video</option>
            </select>
            <select
              value={formData.videoDuration}
              onChange={e => setFormData({ ...formData, videoDuration: e.target.value })}
              style={styles.select}
            >
              <option value="15">15 seconds</option>
              <option value="30">30 seconds</option>
              <option value="60">60 seconds</option>
              <option value="90">90 seconds</option>
              <option value="180">3 minutes</option>
            </select>
            <button onClick={generateVideoScript} disabled={loading} style={styles.button}>
              {loading ? '⏳ Writing Script...' : '🎬 Generate Script'}
            </button>
          </div>
          {results?.videoScript && (
            <div style={styles.results}>
              <h3 style={styles.resultsTitle}>📋 Your Video Script:</h3>
              {results.videoScript.hook && (
                <div style={styles.scriptSection}>
                  <span style={styles.scriptLabel}>🎯 HOOK</span>
                  <p style={styles.scriptText}>{results.videoScript.hook}</p>
                </div>
              )}
              {results.videoScript.sections && results.videoScript.sections.map((section, i) => (
                <div key={i} style={styles.scriptSection}>
                  <span style={styles.scriptLabel}>{section.title || `SECTION ${i + 1}`}</span>
                  <p style={styles.scriptText}>{section.content}</p>
                  {section.visual && <p style={styles.scriptVisual}>🎥 Visual: {section.visual}</p>}
                </div>
              ))}
              {results.videoScript.cta && (
                <div style={{ ...styles.scriptSection, borderColor: '#667eea' }}>
                  <span style={{ ...styles.scriptLabel, background: '#667eea' }}>📣 CALL TO ACTION</span>
                  <p style={styles.scriptText}>{results.videoScript.cta}</p>
                </div>
              )}
              {results.videoScript.raw && (
                <div style={styles.replyBox}>{results.videoScript.raw}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Photo Prompts */}
      {activeTab === 'photo' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📸 Photo Content Prompts</h2>
          <p style={styles.description}>Generate creative photo ideas and detailed prompts you can use to shoot or generate images for your social media.</p>
          <div style={styles.form}>
            <input
              type="text"
              placeholder="Photo topic (e.g., healthy breakfast, office setup, product showcase)"
              value={formData.photoTopic}
              onChange={e => setFormData({ ...formData, photoTopic: e.target.value })}
              style={styles.input}
            />
            <select
              value={formData.photoStyle}
              onChange={e => setFormData({ ...formData, photoStyle: e.target.value })}
              style={styles.select}
            >
              <option value="modern">Modern & Clean</option>
              <option value="lifestyle">Lifestyle & Candid</option>
              <option value="product">Product Photography</option>
              <option value="dark">Dark & Moody</option>
              <option value="bright">Bright & Airy</option>
              <option value="minimalist">Minimalist</option>
            </select>
            <select
              value={formData.photoCount}
              onChange={e => setFormData({ ...formData, photoCount: e.target.value })}
              style={styles.select}
            >
              <option value="4">4 prompts</option>
              <option value="6">6 prompts</option>
              <option value="8">8 prompts</option>
            </select>
            <button onClick={generatePhotoPrompts} disabled={loading} style={styles.button}>
              {loading ? '⏳ Generating...' : '📸 Generate Photo Ideas'}
            </button>
          </div>
          {results?.photoPrompts && (
            <div style={styles.results}>
              <h3 style={styles.resultsTitle}>📸 Photo Ideas & Prompts:</h3>
              <div style={styles.photoGrid}>
                {results.photoPrompts.map((prompt, i) => (
                  <div key={i} style={styles.photoCard}>
                    <div style={styles.photoNumber}>{i + 1}</div>
                    {typeof prompt === 'object' ? (
                      <>
                        <p style={styles.photoTitle}>{prompt.title}</p>
                        <p style={styles.photoDesc}>{prompt.description}</p>
                        {prompt.caption && <p style={styles.photoCaption}>💬 Caption: {prompt.caption}</p>}
                      </>
                    ) : (
                      <p style={styles.photoDesc}>{prompt}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '1400px' },
  title: { fontSize: '32px', fontWeight: '700', color: '#2d3748', margin: '0 0 10px 0' },
  subtitle: { fontSize: '16px', color: '#718096', margin: '0 0 30px 0' },
  select: { padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', marginBottom: '10px', minWidth: '300px' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
  tab: { padding: '10px 18px', border: '1px solid #e2e8f0', borderRadius: '8px 8px 0 0', backgroundColor: 'white', cursor: 'pointer', fontWeight: '500', fontSize: '13px' },
  tabActive: { backgroundColor: '#667eea', color: 'white', borderColor: '#667eea' },
  card: { backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  cardTitle: { fontSize: '20px', fontWeight: '600', marginBottom: '10px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' },
  input: { padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' },
  textarea: { padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit' },
  button: { padding: '14px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '600' },
  results: { marginTop: '30px', padding: '20px', backgroundColor: '#f7fafc', borderRadius: '8px' },
  resultsTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#2d3748' },
  ideasList: { margin: 0, paddingLeft: '20px', lineHeight: '2' },
  ideaItem: { marginBottom: '8px', fontSize: '14px' },
  replyBox: { padding: '15px', backgroundColor: 'white', borderRadius: '6px', fontSize: '14px', lineHeight: '1.6' },
  description: { fontSize: '14px', color: '#718096', marginBottom: '20px' },
  timesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' },
  timeCard: { padding: '20px', backgroundColor: 'white', borderRadius: '8px', textAlign: 'center' },
  timeDay: { fontSize: '18px', fontWeight: '600', color: '#667eea', margin: '0 0 8px 0' },
  timeHour: { fontSize: '24px', fontWeight: '700', color: '#2d3748', margin: '0 0 12px 0' },
  timeReason: { fontSize: '13px', color: '#718096', margin: 0 },
  scriptSection: { background: 'white', borderRadius: '8px', padding: '15px', marginBottom: '12px', borderLeft: '4px solid #48bb78' },
  scriptLabel: { display: 'inline-block', background: '#48bb78', color: 'white', padding: '2px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', marginBottom: '8px' },
  scriptText: { fontSize: '14px', lineHeight: '1.7', margin: 0, color: '#2d3748' },
  scriptVisual: { fontSize: '12px', color: '#718096', marginTop: '6px', fontStyle: 'italic' },
  photoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '15px' },
  photoCard: { background: 'white', borderRadius: '10px', padding: '20px', position: 'relative', paddingTop: '40px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  photoNumber: { position: 'absolute', top: '12px', left: '12px', background: '#667eea', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700' },
  photoTitle: { fontSize: '15px', fontWeight: '600', color: '#2d3748', marginBottom: '8px' },
  photoDesc: { fontSize: '13px', color: '#4a5568', lineHeight: '1.6', marginBottom: '8px' },
  photoCaption: { fontSize: '12px', color: '#718096', fontStyle: 'italic', borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '8px' },
};

export default AIAssistant;
