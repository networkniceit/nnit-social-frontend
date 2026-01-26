import React, { useState } from 'react';
import axios from 'axios';

function AIAssistant() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [activeTab, setActiveTab] = useState('ideas');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const [formData, setFormData] = useState({
    topic: '',
    industry: '',
    audience: '',
    comment: '',
    postContent: '',
    sentiment: 'neutral'
  });

  React.useEffect(() => {
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

  const generateContentIdeas = async () => {
    setLoading(true);
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
    try {
      const response = await axios.get(`/api/insights/${selectedClient}/best-times`);
      setResults({ bestTimes: response.data.recommendations });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to get best times');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>AI Assistant</h1>
      <p style={styles.subtitle}>Let AI help you create better content</p>

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

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('ideas')}
          style={{ ...styles.tab, ...(activeTab === 'ideas' ? styles.tabActive : {}) }}
        >
          💡 Content Ideas
        </button>
        <button
          onClick={() => setActiveTab('replies')}
          style={{ ...styles.tab, ...(activeTab === 'replies' ? styles.tabActive : {}) }}
        >
          💬 Comment Replies
        </button>
        <button
          onClick={() => setActiveTab('timing')}
          style={{ ...styles.tab, ...(activeTab === 'timing' ? styles.tabActive : {}) }}
        >
          ⏰ Best Times
        </button>
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
                {results.ideas.map((idea, index) => (
                  <li key={index} style={styles.ideaItem}>{idea}</li>
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
              <div style={styles.replyBox}>
                {results.reply}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Best Times */}
      {activeTab === 'timing' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Best Times to Post</h2>
          <p style={styles.description}>
            AI analyzes your industry and audience to suggest optimal posting times
          </p>
          <button onClick={generateBestTimes} disabled={loading || !selectedClient} style={styles.button}>
            {loading ? '⏳ Analyzing...' : '⏰ Get Best Times'}
          </button>

          {results?.bestTimes && (
            <div style={styles.results}>
              <h3 style={styles.resultsTitle}>Recommended Posting Times:</h3>
              <div style={styles.timesGrid}>
                {results.bestTimes.map((time, index) => (
                  <div key={index} style={styles.timeCard}>
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
    </div>
  );
}

const styles = {
  container: { maxWidth: '1400px' },
  title: { fontSize: '32px', fontWeight: '700', color: '#2d3748', margin: '0 0 10px 0' },
  subtitle: { fontSize: '16px', color: '#718096', margin: '0 0 30px 0' },
  select: { padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', marginBottom: '30px', minWidth: '300px' },
  tabs: { display: 'flex', gap: '10px', marginBottom: '20px' },
  tab: { padding: '12px 24px', border: '1px solid #e2e8f0', borderRadius: '8px 8px 0 0', backgroundColor: 'white', cursor: 'pointer', fontWeight: '500', fontSize: '14px' },
  tabActive: { backgroundColor: '#667eea', color: 'white', borderColor: '#667eea' },
  card: { backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  cardTitle: { fontSize: '20px', fontWeight: '600', marginBottom: '20px' },
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
  timesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' },
  timeCard: { padding: '20px', backgroundColor: 'white', borderRadius: '8px', textAlign: 'center' },
  timeDay: { fontSize: '18px', fontWeight: '600', color: '#667eea', margin: '0 0 8px 0' },
  timeHour: { fontSize: '24px', fontWeight: '700', color: '#2d3748', margin: '0 0 12px 0' },
  timeReason: { fontSize: '13px', color: '#718096', margin: 0 },
};

export default AIAssistant;