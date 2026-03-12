import React, { useState, useRef, useEffect } from 'react';

function MediaEditor() {
  const [activeTab, setActiveTab] = useState('video');

  // Video state
  const [videoFile, setVideoFile] = useState(null);
  const [videoURL, setVideoURL] = useState(null);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoCaption, setVideoCaption] = useState('');
  const [captionPosition, setCaptionPosition] = useState('bottom');
  const [videoProcessing, setVideoProcessing] = useState(false);
  const videoRef = useRef(null);

  // Photo state
  const [photoFile, setPhotoFile] = useState(null);
  const [photoURL, setPhotoURL] = useState(null);
  const [photoText, setPhotoText] = useState('');
  const [textPosition, setTextPosition] = useState('bottom');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(32);
  const [resizeTarget, setResizeTarget] = useState('instagram');
  const [photoProcessing, setPhotoProcessing] = useState(false);
  const canvasRef = useRef(null);
  const [processedPhotoURL, setProcessedPhotoURL] = useState(null);

  // Live stream state
  const [selectedPlatform, setSelectedPlatform] = useState('youtube');
  const [streamTitle, setStreamTitle] = useState('');
  const [generatedStream, setGeneratedStream] = useState(null);

  const platformSizes = {
    instagram: { width: 1080, height: 1080, label: 'Instagram Square (1080x1080)' },
    instagram_story: { width: 1080, height: 1920, label: 'Instagram Story (1080x1920)' },
    facebook: { width: 1200, height: 630, label: 'Facebook Post (1200x630)' },
    twitter: { width: 1200, height: 675, label: 'Twitter/X (1200x675)' },
    linkedin: { width: 1200, height: 627, label: 'LinkedIn (1200x627)' },
    youtube: { width: 1280, height: 720, label: 'YouTube Thumbnail (1280x720)' },
  };

  const streamPlatforms = {
    youtube: {
      name: 'YouTube Live',
      icon: '▶️',
      rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2',
      dashboardUrl: 'https://studio.youtube.com',
      instructions: 'Go to YouTube Studio → Go Live → Stream. Copy the stream key shown there and paste it into OBS or Streamlabs.'
    },
    facebook: {
      name: 'Facebook Live',
      icon: '📘',
      rtmpUrl: 'rtmps://live-api-s.facebook.com:443/rtmp',
      dashboardUrl: 'https://www.facebook.com/live/producer',
      instructions: 'Go to Facebook Live Producer → Create Live Video. Copy the stream key and use it with OBS or any streaming software.'
    },
    instagram: {
      name: 'Instagram Live',
      icon: '📸',
      rtmpUrl: 'rtmps://edgetee-upload-{dc}.facebook.com:443/rtmp',
      dashboardUrl: 'https://www.instagram.com',
      instructions: 'Instagram Live can be started directly from the Instagram app. Tap the + button → Live. For desktop streaming, use a third-party tool like Yellow Duck.'
    },
    tiktok: {
      name: 'TikTok Live',
      icon: '🎵',
      rtmpUrl: 'rtmp://push.tiktokv.com/live',
      dashboardUrl: 'https://www.tiktok.com/live/studio',
      instructions: 'Open TikTok app → + → LIVE. For desktop, use TikTok Live Studio. You need 1000+ followers to go live.'
    },
    linkedin: {
      name: 'LinkedIn Live',
      icon: '💼',
      rtmpUrl: 'rtmp://mio.linkedin.com/live',
      dashboardUrl: 'https://www.linkedin.com/video/live',
      instructions: 'LinkedIn Live requires approval. Apply at linkedin.com/help/linkedin/answer/100225. Once approved, use any RTMP-compatible streaming tool.'
    },
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoURL(url);
    setTrimStart(0);
    setTrimEnd(100);
    setGeneratedStream(null);
  };

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
      setTrimEnd(videoRef.current.duration);
    }
  };

  const previewTrim = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = trimStart;
      videoRef.current.play();
      setTimeout(() => {
        if (videoRef.current) videoRef.current.pause();
      }, (trimEnd - trimStart) * 1000);
    }
  };

  const exportVideo = () => {
    setVideoProcessing(true);
    setTimeout(() => {
      setVideoProcessing(false);
      alert('Video export is ready! In production this would use FFmpeg on the backend to trim and add captions. For now, download your original video and use the trim times: ' + trimStart.toFixed(1) + 's to ' + trimEnd.toFixed(1) + 's' + (videoCaption ? ' with caption: "' + videoCaption + '"' : '') + '.');
    }, 1500);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoURL(url);
    setProcessedPhotoURL(null);
  };

  const processPhoto = () => {
    if (!photoURL) { alert('Please upload a photo first'); return; }
    setPhotoProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      const target = platformSizes[resizeTarget];
      canvas.width = target.width;
      canvas.height = target.height;

      // Fill background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw image (cover fit)
      const imgAspect = img.width / img.height;
      const canvasAspect = canvas.width / canvas.height;
      let drawW, drawH, drawX, drawY;
      if (imgAspect > canvasAspect) {
        drawH = canvas.height;
        drawW = drawH * imgAspect;
        drawX = (canvas.width - drawW) / 2;
        drawY = 0;
      } else {
        drawW = canvas.width;
        drawH = drawW / imgAspect;
        drawX = 0;
        drawY = (canvas.height - drawH) / 2;
      }
      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      // Add text overlay
      if (photoText) {
        const fSize = parseInt(fontSize) * (canvas.width / 800);
        ctx.font = 'bold ' + fSize + 'px Arial';
        ctx.textAlign = 'center';

        // Shadow
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 10;

        // Background bar
        const textMetrics = ctx.measureText(photoText);
        const barHeight = fSize * 1.8;
        let barY;
        if (textPosition === 'top') barY = fSize * 0.5;
        else if (textPosition === 'center') barY = canvas.height / 2 - fSize;
        else barY = canvas.height - barHeight - 20;

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, barY, canvas.width, barHeight);

        // Text
        ctx.fillStyle = textColor;
        ctx.shadowBlur = 0;
        ctx.fillText(photoText, canvas.width / 2, barY + fSize * 1.2);
      }

      const dataURL = canvas.toDataURL('image/jpeg', 0.92);
      setProcessedPhotoURL(dataURL);
      setPhotoProcessing(false);
    };
    img.src = photoURL;
  };

  const downloadPhoto = () => {
    if (!processedPhotoURL) return;
    const a = document.createElement('a');
    a.href = processedPhotoURL;
    a.download = 'nnit-edited-' + resizeTarget + '.jpg';
    a.click();
  };

  const generateStreamInfo = () => {
    if (!streamTitle.trim()) { alert('Please enter a stream title'); return; }
    const platform = streamPlatforms[selectedPlatform];
    setGeneratedStream({
      platform: platform.name,
      icon: platform.icon,
      title: streamTitle,
      rtmpUrl: platform.rtmpUrl,
      dashboardUrl: platform.dashboardUrl,
      instructions: platform.instructions,
      generatedAt: new Date().toLocaleString()
    });
  };

  const tabs = [
    { id: 'video', label: '🎬 Video Editor' },
    { id: 'photo', label: '📸 Photo Editor' },
    { id: 'live', label: '🔴 Live Stream' },
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Media Editor</h1>
      <p style={styles.subtitle}>Edit videos, photos and set up live streams</p>

      <div style={styles.tabs}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ ...styles.tab, ...(activeTab === tab.id ? styles.tabActive : {}) }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* VIDEO EDITOR */}
      {activeTab === 'video' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🎬 Video Editor</h2>
          <p style={styles.description}>Trim your video and add captions overlay</p>

          <div style={styles.uploadArea}>
            <input type="file" accept="video/*" onChange={handleVideoUpload} style={{ display: 'none' }} id="videoUpload" />
            <label htmlFor="videoUpload" style={styles.uploadLabel}>
              {videoFile ? '📹 ' + videoFile.name : '📁 Click to upload video'}
            </label>
          </div>

          {videoURL && (
            <div style={styles.videoSection}>
              <video ref={videoRef} src={videoURL} controls style={styles.videoPreview} onLoadedMetadata={handleVideoLoaded} />

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>✂️ Trim Video</h3>
                <p style={styles.hint}>Duration: {videoDuration.toFixed(1)}s</p>
                <div style={styles.trimRow}>
                  <label style={styles.label}>Start: {trimStart.toFixed(1)}s</label>
                  <input type="range" min="0" max={videoDuration} step="0.1" value={trimStart}
                    onChange={e => setTrimStart(Math.min(parseFloat(e.target.value), trimEnd - 0.5))}
                    style={styles.slider} />
                </div>
                <div style={styles.trimRow}>
                  <label style={styles.label}>End: {trimEnd.toFixed(1)}s</label>
                  <input type="range" min="0" max={videoDuration} step="0.1" value={trimEnd}
                    onChange={e => setTrimEnd(Math.max(parseFloat(e.target.value), trimStart + 0.5))}
                    style={styles.slider} />
                </div>
                <p style={styles.hint}>Selected: {(trimEnd - trimStart).toFixed(1)} seconds</p>
                <button onClick={previewTrim} style={styles.secondaryButton}>▶️ Preview Trim</button>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>💬 Add Caption Overlay</h3>
                <input type="text" placeholder="Enter caption text..." value={videoCaption}
                  onChange={e => setVideoCaption(e.target.value)} style={styles.input} />
                <select value={captionPosition} onChange={e => setCaptionPosition(e.target.value)} style={styles.select}>
                  <option value="top">Top</option>
                  <option value="center">Center</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>

              <button onClick={exportVideo} disabled={videoProcessing} style={styles.primaryButton}>
                {videoProcessing ? '⏳ Processing...' : '⬇️ Export Video'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* PHOTO EDITOR */}
      {activeTab === 'photo' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>📸 Photo Editor</h2>
          <p style={styles.description}>Resize for any platform and add text overlay</p>

          <div style={styles.uploadArea}>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} id="photoUpload" />
            <label htmlFor="photoUpload" style={styles.uploadLabel}>
              {photoFile ? '🖼️ ' + photoFile.name : '📁 Click to upload photo'}
            </label>
          </div>

          {photoURL && (
            <div style={styles.photoSection}>
              <div style={styles.photoPreviewRow}>
                <div>
                  <p style={styles.hint}>Original</p>
                  <img src={photoURL} alt="original" style={styles.photoPreview} />
                </div>
                {processedPhotoURL && (
                  <div>
                    <p style={styles.hint}>Processed</p>
                    <img src={processedPhotoURL} alt="processed" style={styles.photoPreview} />
                  </div>
                )}
              </div>

              <canvas ref={canvasRef} style={{ display: 'none' }} />

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>📐 Resize for Platform</h3>
                <select value={resizeTarget} onChange={e => setResizeTarget(e.target.value)} style={styles.select}>
                  {Object.entries(platformSizes).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>✏️ Add Text Overlay</h3>
                <input type="text" placeholder="Enter text to overlay..." value={photoText}
                  onChange={e => setPhotoText(e.target.value)} style={styles.input} />
                <div style={styles.row}>
                  <select value={textPosition} onChange={e => setTextPosition(e.target.value)} style={{ ...styles.select, flex: 1 }}>
                    <option value="top">Top</option>
                    <option value="center">Center</option>
                    <option value="bottom">Bottom</option>
                  </select>
                  <div style={styles.colorRow}>
                    <label style={styles.label}>Color:</label>
                    <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} style={styles.colorPicker} />
                  </div>
                  <div style={styles.colorRow}>
                    <label style={styles.label}>Size: {fontSize}px</label>
                    <input type="range" min="16" max="80" value={fontSize}
                      onChange={e => setFontSize(e.target.value)} style={styles.slider} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={processPhoto} disabled={photoProcessing} style={styles.primaryButton}>
                  {photoProcessing ? '⏳ Processing...' : '⚙️ Process Photo'}
                </button>
                {processedPhotoURL && (
                  <button onClick={downloadPhoto} style={styles.secondaryButton}>⬇️ Download</button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* LIVE STREAM */}
      {activeTab === 'live' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🔴 Live Stream Setup</h2>
          <p style={styles.description}>Generate stream info and get setup instructions for each platform</p>

          <div style={styles.form}>
            <input type="text" placeholder="Stream title (e.g. Product Launch Live)" value={streamTitle}
              onChange={e => setStreamTitle(e.target.value)} style={styles.input} />

            <div style={styles.platformGrid}>
              {Object.entries(streamPlatforms).map(([key, platform]) => (
                <button key={key} onClick={() => setSelectedPlatform(key)}
                  style={{ ...styles.platformCard, ...(selectedPlatform === key ? styles.platformCardActive : {}) }}>
                  <span style={{ fontSize: '24px' }}>{platform.icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: '500' }}>{platform.name}</span>
                </button>
              ))}
            </div>

            <button onClick={generateStreamInfo} style={styles.primaryButton}>
              🔴 Generate Stream Info
            </button>
          </div>

          {generatedStream && (
            <div style={styles.streamResult}>
              <h3 style={styles.sectionTitle}>{generatedStream.icon} {generatedStream.platform} — Ready to Stream</h3>
              <p style={styles.hint}>Title: {generatedStream.title}</p>

              <div style={styles.streamBox}>
                <div style={styles.streamField}>
                  <span style={styles.streamLabel}>RTMP Server URL</span>
                  <div style={styles.streamValue}>{generatedStream.rtmpUrl}</div>
                </div>
                <div style={styles.streamField}>
                  <span style={styles.streamLabel}>Stream Key</span>
                  <div style={styles.streamValue}>
                    Get this from your platform dashboard →{' '}
                    <a href={generatedStream.dashboardUrl} target="_blank" rel="noreferrer" style={{ color: '#667eea' }}>
                      Open Dashboard
                    </a>
                  </div>
                </div>
              </div>

              <div style={styles.instructionsBox}>
                <strong>📋 Setup Instructions:</strong>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px', lineHeight: '1.7', color: '#4a5568' }}>
                  {generatedStream.instructions}
                </p>
              </div>

              <div style={styles.obsBox}>
                <strong>🎮 OBS Settings:</strong>
                <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#4a5568', lineHeight: '1.7' }}>
                  1. Open OBS → Settings → Stream<br />
                  2. Service: Custom<br />
                  3. Server: {generatedStream.rtmpUrl}<br />
                  4. Stream Key: (from platform dashboard)<br />
                  5. Click Apply → Start Streaming
                </p>
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
  tabs: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
  tab: { padding: '10px 20px', border: '1px solid #e2e8f0', borderRadius: '8px 8px 0 0', backgroundColor: 'white', cursor: 'pointer', fontWeight: '500', fontSize: '14px' },
  tabActive: { backgroundColor: '#667eea', color: 'white', borderColor: '#667eea' },
  card: { backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  cardTitle: { fontSize: '22px', fontWeight: '700', margin: '0 0 8px 0' },
  description: { fontSize: '14px', color: '#718096', margin: '0 0 24px 0' },
  uploadArea: { marginBottom: '24px' },
  uploadLabel: { display: 'block', padding: '30px', border: '2px dashed #e2e8f0', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', fontSize: '15px', color: '#667eea', fontWeight: '500', backgroundColor: '#f7fafc' },
  videoSection: { display: 'flex', flexDirection: 'column', gap: '20px' },
  videoPreview: { width: '100%', maxHeight: '400px', borderRadius: '8px', backgroundColor: '#000' },
  section: { backgroundColor: '#f7fafc', padding: '20px', borderRadius: '8px' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', margin: '0 0 12px 0', color: '#2d3748' },
  trimRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' },
  slider: { flex: 1 },
  hint: { fontSize: '13px', color: '#718096', margin: '0 0 8px 0' },
  label: { fontSize: '13px', fontWeight: '500', color: '#4a5568', minWidth: '80px' },
  input: { width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', marginBottom: '10px' },
  select: { width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', marginBottom: '10px' },
  primaryButton: { padding: '14px 28px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '600' },
  secondaryButton: { padding: '12px 24px', backgroundColor: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  photoSection: { display: 'flex', flexDirection: 'column', gap: '20px' },
  photoPreviewRow: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  photoPreview: { maxWidth: '300px', maxHeight: '250px', borderRadius: '8px', objectFit: 'contain', border: '1px solid #e2e8f0' },
  row: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' },
  colorRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  colorPicker: { width: '40px', height: '36px', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  platformGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' },
  platformCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer' },
  platformCardActive: { border: '2px solid #667eea', backgroundColor: '#f0f4ff' },
  streamResult: { marginTop: '24px', padding: '24px', backgroundColor: '#f7fafc', borderRadius: '10px' },
  streamBox: { display: 'flex', flexDirection: 'column', gap: '12px', margin: '16px 0' },
  streamField: { backgroundColor: 'white', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' },
  streamLabel: { display: 'block', fontSize: '11px', color: '#718096', textTransform: 'uppercase', fontWeight: '600', marginBottom: '6px' },
  streamValue: { fontSize: '14px', color: '#2d3748', fontFamily: 'monospace', wordBreak: 'break-all' },
  instructionsBox: { backgroundColor: '#ebf8ff', padding: '16px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #bee3f8' },
  obsBox: { backgroundColor: '#f0fff4', padding: '16px', borderRadius: '8px', border: '1px solid #c6f6d5' },
};

export default MediaEditor;