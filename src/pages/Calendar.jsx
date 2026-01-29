import React, { useState, useEffect } from 'react';
import axios from '../axios-config';

function Calendar() {
  const [selectedClient, setSelectedClient] = useState('');
  const [clients, setClients] = useState([]);
  const [posts, setPosts] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchPosts();
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

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`/api/posts/scheduled/${selectedClient}`);
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getPostsForDate = (date) => {
    return posts.filter(post => {
      const postDate = new Date(post.scheduledTime);
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
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} style={styles.emptyDay}></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayPosts = getPostsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <div
          key={day}
          style={{
            ...styles.calendarDay,
            ...(isToday ? styles.today : {})
          }}
        >
          <div style={styles.dayNumber}>{day}</div>
          {dayPosts.length > 0 && (
            <div style={styles.postIndicator}>
              {dayPosts.length} post{dayPosts.length > 1 ? 's' : ''}
            </div>
          )}
          {dayPosts.map(post => (
            <div key={post.id} style={styles.postBadge}>
              {post.platforms.map(p => (
                <span key={p}>
                  {p === 'facebook' && '📘'}
                  {p === 'instagram' && '📸'}
                  {p === 'twitter' && '🐦'}
                  {p === 'linkedin' && '💼'}
                  {p === 'tiktok' && '🎵'}
                </span>
              ))}
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

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Content Calendar</h1>
      <p style={styles.subtitle}>View and manage scheduled posts</p>

      {/* Client Selector */}
      <div style={styles.controls}>
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

        {selectedClient && (
          <div style={styles.stats}>
            <span style={styles.statBadge}>
              📝 {posts.length} scheduled posts
            </span>
          </div>
        )}
      </div>

      {selectedClient ? (
        <div style={styles.calendarContainer}>
          {/* Calendar Header */}
          <div style={styles.calendarHeader}>
            <button onClick={() => changeMonth(-1)} style={styles.navButton}>
              ← Previous
            </button>
            <h2 style={styles.monthTitle}>
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={() => changeMonth(1)} style={styles.navButton}>
              Next →
            </button>
          </div>

          {/* Day Headers */}
          <div style={styles.calendar}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} style={styles.dayHeader}>
                {day}
              </div>
            ))}
            {renderCalendar()}
          </div>
        </div>
      ) : (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>Select a client to view their content calendar</p>
        </div>
      )}
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
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  select: {
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    minWidth: '250px',
  },
  stats: {
    display: 'flex',
    gap: '10px',
  },
  statBadge: {
    padding: '8px 16px',
    backgroundColor: '#667eea',
    color: 'white',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
  },
  calendarContainer: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  calendarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  navButton: {
    padding: '10px 20px',
    backgroundColor: '#f7fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  monthTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#2d3748',
  },
  calendar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '10px',
  },
  dayHeader: {
    padding: '10px',
    textAlign: 'center',
    fontWeight: '600',
    color: '#718096',
    fontSize: '14px',
  },
  calendarDay: {
    minHeight: '100px',
    padding: '10px',
    backgroundColor: '#f7fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    position: 'relative',
  },
  today: {
    backgroundColor: '#f0f4ff',
    borderColor: '#667eea',
    borderWidth: '2px',
  },
  emptyDay: {
    minHeight: '100px',
  },
  dayNumber: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '8px',
  },
  postIndicator: {
    fontSize: '11px',
    color: '#667eea',
    fontWeight: '500',
    marginBottom: '8px',
  },
  postBadge: {
    display: 'flex',
    gap: '4px',
    marginTop: '4px',
  },
  emptyState: {
    backgroundColor: 'white',
    padding: '60px',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  emptyText: {
    fontSize: '16px',
    color: '#718096',
  },
};

export default Calendar;
