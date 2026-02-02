import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';

// Pages
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import CreatePost from './pages/CreatePost';
import Calendar from './pages/Calendar';
import Analytics from './pages/Analytics';
import AIAssistant from './pages/AIAssistant';
import Settings from './pages/Settings';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import { API_URL } from './config';

function App() {
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/stats`);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <BrowserRouter>
      <div style={styles.container}>
        <aside style={styles.sidebar}>
          <div style={styles.logo}>
            <h1 style={styles.logoText}>🚀 NNIT Social</h1>
            <p style={styles.logoSubtext}>Automation Suite</p>
          </div>

          <nav style={styles.nav}>
            <NavLink to="/" icon="📊" text="Dashboard" />
            <NavLink to="/clients" icon="👥" text="Clients" />
            <NavLink to="/create-post" icon="✏️" text="Create Post" />
            <NavLink to="/calendar" icon="📅" text="Calendar" />
            <NavLink to="/analytics" icon="📈" text="Analytics" />
            <NavLink to="/ai-assistant" icon="🤖" text="AI Assistant" />
            <NavLink to="/settings" icon="⚙️" text="Settings" />
          </nav>

          <div style={styles.sidebarFooter}>
            <p style={styles.footerText}>© 2026 NNIT Enterprise</p>
            <p style={styles.footerText}>networkniceit@gmail.com</p>
          </div>
        </aside>

        <main style={styles.main}>
          <Routes>
            <Route path="/" element={<Dashboard stats={stats} />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

function NavLink({ to, icon, text }) {
  return (
    <Link to={to} style={styles.navLink}>
      <span style={styles.navIcon}>{icon}</span>
      <span>{text}</span>
    </Link>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
  },
  sidebar: {
    width: '260px',
    background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
  },
  logo: {
    marginBottom: '40px',
    textAlign: 'center',
  },
  logoText: {
    fontSize: '24px',
    margin: '0',
    fontWeight: '700',
  },
  logoSubtext: {
    fontSize: '12px',
    margin: '5px 0 0 0',
    opacity: '0.8',
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '8px',
    color: 'white',
    textDecoration: 'none',
    transition: 'all 0.3s',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  navIcon: {
    fontSize: '20px',
    marginRight: '12px',
  },
  sidebarFooter: {
    marginTop: 'auto',
    paddingTop: '20px',
    borderTop: '1px solid rgba(255,255,255,0.2)',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '11px',
    margin: '5px 0',
    opacity: '0.7',
  },
  main: {
    flex: 1,
    padding: '30px',
    overflow: 'auto',
  },
};

export default App;