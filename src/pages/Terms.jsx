import React from 'react';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Link to="/" style={{ color: '#4f46e5', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}>
        ← Back to NNIT Social Automation
      </Link>
      
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>Terms of Service</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Last Updated: February 1, 2026</p>

      <div style={{ lineHeight: '1.8', color: '#333' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginTop: '30px', marginBottom: '15px' }}>1. Agreement to Terms</h2>
        <p>By accessing or using NNIT Social Automation ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.</p>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginTop: '30px', marginBottom: '15px' }}>2. Description of Service</h2>
        <p>NNIT Social Automation is an AI-powered social media management platform that enables users to:</p>
        <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
          <li>Create and schedule social media posts</li>
          <li>Generate AI-powered captions and hashtags</li>
          <li>Manage multiple social media accounts</li>
          <li>Track analytics and engagement metrics</li>
          <li>Connect to platforms including Facebook, Instagram, Twitter/X, LinkedIn, and TikTok</li>
        </ul>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginTop: '30px', marginBottom: '15px' }}>3. User Accounts</h2>
        <p>You are responsible for:</p>
        <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
          <li>Maintaining the confidentiality of your account credentials</li>
          <li>All activities that occur under your account</li>
          <li>Ensuring your social media accounts comply with each platform's terms of service</li>
          <li>The content you create and publish through our Service</li>
        </ul>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginTop: '30px', marginBottom: '15px' }}>4. Acceptable Use</h2>
        <p>You agree NOT to use the Service to:</p>
        <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
          <li>Post illegal, harmful, or offensive content</li>
          <li>Violate any social media platform's terms of service</li>
          <li>Spam, harass, or abuse other users</li>
          <li>Distribute malware or viruses</li>
          <li>Infringe on intellectual property rights</li>
          <li>Impersonate others or misrepresent your identity</li>
        </ul>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginTop: '30px', marginBottom: '15px' }}>5. Content and Intellectual Property</h2>
        <p>You retain ownership of all content you create. By using our Service, you grant NNIT a license to process, store, and display your content solely for the purpose of providing the Service.</p>
        <p style={{ marginTop: '10px' }}>All AI-generated content suggestions are provided as-is. You are responsible for reviewing and approving all content before publication.</p>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginTop: '30px', marginBottom: '15px' }}>6. Third-Party Integrations</h2>
        <p>Our Service integrates with third-party platforms (Facebook, Instagram, Twitter/X, LinkedIn, TikTok). Your use of these integrations is subject to their respective terms of service and privacy policies.</p>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginTop: '30px', marginBottom: '15px' }}>7. Payment and Subscriptions</h2>
        <p>Subscription fees are billed in advance on a monthly or annual basis. Refunds are provided at our discretion. You may cancel your subscription at any time, effective at the end of your current billing period.</p>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginTop: '30px', marginBottom: '15px' }}>8. Disclaimer of Warranties</h2>
        <p>The Service is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free service. We are not responsible for content published through the Service or actions taken by third-party platforms.</p>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginTop: '30px', marginBottom: '15px' }}>9. Limitation of Liability</h2>
        <p>NNIT shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service.</p>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginTop: '30px', marginBottom: '15px' }}>10. Termination</h2>
        <p>We reserve the right to suspend or terminate your account at any time for violation of these Terms or for any other reason at our sole discretion.</p>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginTop: '30px', marginBottom: '15px' }}>11. Changes to Terms</h2>
        <p>We may modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the modified Terms.</p>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginTop: '30px', marginBottom: '15px' }}>12. Contact Information</h2>
        <p>For questions about these Terms, contact us at:</p>
        <p style={{ marginTop: '10px' }}>
          <strong>NNIT - Network Nice IT Tec</strong><br/>
          Email: networkniceit@gmail.com<br/>
          Owner: Solomon Omomeje Ayodele
        </p>

        <h2 style={{ fontSize: '24px', fontWeight: '600', marginTop: '30px', marginBottom: '15px' }}>13. Governing Law</h2>
        <p>These Terms are governed by the laws of Germany. Any disputes shall be resolved in the courts of Germany.</p>
      </div>

      <div style={{ marginTop: '50px', padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
        <p style={{ margin: 0, color: '#666' }}>
          © 2026 NNIT Enterprise - Network Nice IT Tec. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Terms;