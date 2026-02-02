import React from 'react';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Link to="/" style={{ color: '#4f46e5', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}>
        ← Back to NNIT Social Automation
      </Link>
      
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>Privacy Policy</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Last Updated: February 1, 2026</p>

      <div style={{ lineHeight: '1.8', color: '#333' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginTop: '30px', marginBottom: '15px' }}>1. Introduction</h2>
        <p>NNIT - Network Nice IT Tec ("we," "our," or "us") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use NNIT Social Automation.</p>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginTop: '30px', marginBottom: '15px' }}>2. Information We Collect</h2>
        
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginTop: '20px', marginBottom: '10px' }}>2.1 Information You Provide</h3>
        <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
          <li><strong>Account Information:</strong> Name, email address, company name, password</li>
          <li><strong>Social Media Credentials:</strong> Access tokens for connected platforms</li>
          <li><strong>Content:</strong> Posts, captions, images, videos you create</li>
          <li><strong>Payment Information:</strong> Billing details processed securely</li>
        </ul>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginTop: '20px', marginBottom: '10px' }}>2.2 Automatically Collected Information</h3>
        <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
          <li><strong>Usage Data:</strong> Pages visited, features used</li>
          <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
          <li><strong>Analytics:</strong> Engagement metrics, post performance</li>
        </ul>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginTop: '30px', marginBottom: '15px' }}>3. How We Use Your Information</h2>
        <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
          <li>Provide and maintain the Service</li>
          <li>Generate AI-powered content suggestions</li>
          <li>Schedule and publish posts</li>
          <li>Provide analytics and insights</li>
          <li>Process payments</li>
          <li>Send service notifications</li>
          <li>Improve our Service</li>
          <li>Prevent fraud</li>
        </ul>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginTop: '30px', marginBottom: '15px' }}>4. Information Sharing</h2>
        <p>We do not sell your personal information. We may share with:</p>
        <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
          <li><strong>Social Media Platforms:</strong> When you authorize posting</li>
          <li><strong>AI Providers:</strong> For content generation (Groq API)</li>
          <li><strong>Payment Processors:</strong> For transactions</li>
          <li><strong>Cloud Providers:</strong> For hosting (Railway, Vercel)</li>
          <li><strong>Legal Authorities:</strong> When required by law</li>
        </ul>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginTop: '30px', marginBottom: '15px' }}>5. Data Security</h2>
        <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
          <li>Encrypted data transmission (HTTPS/SSL)</li>
          <li>Secure storage of access tokens</li>
          <li>Regular security audits</li>
          <li>Access controls and authentication</li>
        </ul>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginTop: '30px', marginBottom: '15px' }}>6. Your Rights</h2>
        <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
          <li><strong>Access:</strong> Request a copy of your data</li>
          <li><strong>Correction:</strong> Update inaccurate information</li>
          <li><strong>Deletion:</strong> Request deletion of your account</li>
          <li><strong>Portability:</strong> Export your data</li>
          <li><strong>Opt-Out:</strong> Unsubscribe from marketing</li>
          <li><strong>Revoke Access:</strong> Disconnect social accounts</li>
        </ul>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginTop: '30px', marginBottom: '15px' }}>7. GDPR Compliance</h2>
        <p>European users have additional rights including right to object, restrict processing, and lodge complaints with supervisory authorities.</p>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginTop: '30px', marginBottom: '15px' }}>8. Contact Us</h2>
        <p style={{ marginTop: '10px' }}>
          <strong>NNIT - Network Nice IT Tec</strong><br/>
          Email: networkniceit@gmail.com<br/>
          Owner: Solomon Omomeje Ayodele<br/>
          Location: Germany
        </p>
      </div>

      <div style={{ marginTop: '50px', padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
        <p style={{ margin: 0, color: '#666' }}>
          © 2026 NNIT Enterprise - Network Nice IT Tec. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Privacy;