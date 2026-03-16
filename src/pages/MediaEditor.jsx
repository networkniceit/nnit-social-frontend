import React, { useState, useRef } from 'react';

const API_URL = 'https://nnit-social-backend-production-8ce8.up.railway.app';

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
  const [videoProgress, setVideoProgress] = useState('');
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

  // Audio/Voice state
  const [audioVideoFile, setAudioVideoFile] = useState(null);
  const [audioMode, setAudioMode] = useState('tts'); // tts | music | record | script
  const [ttsText, setTtsText] = useState('');
  const [ttsVoice, setTtsVoice] = useState('');
  const [ttsVoices, setTtsVoices] = useState([]);
  const [musicFile, setMusicFile] = useState(null);
  const [musicVolume, setMusicVolume] = useState(50);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [scriptTopic, setScriptTopic] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
  const [scriptLoading, setScriptLoading] = useState(false);
  const [audioProcessing, setAudioProcessing] = useState(false);
  const [audioProgress, setAudioProgress] = useState('');
  const mediaRecorderRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const chunksRef = useRef([]);

  const platformSizes = {
    instagram: { width: 1080, height: 1080, label: 'Instagram Square (1080x1080)' },
    instagram_story: { width: 1080, height: 1920, label: 'Instagram Story (1080x1920)' },
    facebook: { width: 1200, height: 630, label: 'Facebook Post (1200x630)' },
    twitter: { width: 1200, height: 675, label: 'Twitter/X (1200x675)' },
    linkedin: { width: 1200, height: 627, label: 'LinkedIn (1200x627)' },
    youtube: { width: 1280, height: 720, label: 'YouTube Thumbnail (1280x720)' },
  };

  const streamPlatforms = {
    youtube: { name: 'YouTube Live', icon: 'â–¶ï¸', rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2', dashboardUrl: 'https://studio.youtube.com', instructions: 'Go to YouTube Studio â†’ Go Live â†’ Stream. Copy the stream key and paste it into OBS or Streamlabs.' },
    facebook: { name: 'Facebook Live', icon: 'ðŸ“˜', rtmpUrl: 'rtmps://live-api-s.facebook.com:443/rtmp', dashboardUrl: 'https://www.facebook.com/live/producer', instructions: 'Go to Facebook Live Producer â†’ Create Live Video. Copy the stream key and use it with OBS.' },
    instagram: { name: 'Instagram Live', icon: 'ðŸ“¸', rtmpUrl: 'rtmps://edgetee-upload-{dc}.facebook.com:443/rtmp', dashboardUrl: 'https://www.instagram.com', instructions: 'Instagram Live from the app: tap + â†’ Live. For desktop use Yellow Duck.' },
    tiktok: { name: 'TikTok Live', icon: 'ðŸŽµ', rtmpUrl: 'rtmp://push.tiktokv.com/live', dashboardUrl: 'https://www.tiktok.com/live/studio', instructions: 'Open TikTok â†’ + â†’ LIVE. Need 1000+ followers. For desktop use TikTok Live Studio.' },
    linkedin: { name: 'LinkedIn Live', icon: 'ðŸ’¼', rtmpUrl: 'rtmp://mio.linkedin.com/live', dashboardUrl: 'https://www.linkedin.com/video/live', instructions: 'LinkedIn Live requires approval first. Once approved, use any RTMP tool with your stream key.' },
  };

  // Load TTS voices on mount
  React.useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        setTtsVoices(v);
        setTtsVoice(v[0].name);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVideoFile(file);
    setVideoURL(URL.createObjectURL(file));
    setTrimStart(0); setTrimEnd(100); setVideoProgress('');
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
      setTimeout(() => { if (videoRef.current) videoRef.current.pause(); }, (trimEnd - trimStart) * 1000);
    }
  };

  const exportVideo = async () => {
    if (!videoFile) { alert('Please upload a video first'); return; }
    setVideoProcessing(true);
    setVideoProgress('Uploading video to server...');
    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('startTime', trimStart.toString());
      formData.append('endTime', trimEnd.toString());
      formData.append('caption', videoCaption);
      formData.append('captionPosition', captionPosition);
      setVideoProgress('Processing with FFmpeg... this may take a moment');
      const response = await fetch(API_URL + '/api/media/trim', { method: 'POST', body: formData });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Server error' }));
        throw new Error(err.error || 'Server error ' + response.status);
      }
      setVideoProgress('Downloading processed video...');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'nnit-trimmed.mp4'; a.click();
      URL.revokeObjectURL(url);
      setVideoProgress('Done! Video downloaded.');
    } catch (err) {
      alert('Export failed: ' + err.message); setVideoProgress('');
    } finally { setVideoProcessing(false); }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file); setPhotoURL(URL.createObjectURL(file)); setProcessedPhotoURL(null);
  };

  const processPhoto = () => {
    if (!photoURL) { alert('Please upload a photo first'); return; }
    setPhotoProcessing(true);
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d'); const img = new Image();
    img.onload = () => {
      const target = platformSizes[resizeTarget];
      canvas.width = target.width; canvas.height = target.height;
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      const imgAspect = img.width / img.height; const canvasAspect = canvas.width / canvas.height;
      let drawW, drawH, drawX, drawY;
      if (imgAspect > canvasAspect) { drawH = canvas.height; drawW = drawH * imgAspect; drawX = (canvas.width - drawW) / 2; drawY = 0; }
      else { drawW = canvas.width; drawH = drawW / imgAspect; drawX = 0; drawY = (canvas.height - drawH) / 2; }
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      if (photoText) {
        const fSize = parseInt(fontSize) * (canvas.width / 800);
        ctx.font = 'bold ' + fSize + 'px Arial'; ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 10;
        const barHeight = fSize * 1.8;
        let barY = textPosition === 'top' ? fSize * 0.5 : textPosition === 'center' ? canvas.height / 2 - fSize : canvas.height - barHeight - 20;
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, barY, canvas.width, barHeight);
        ctx.fillStyle = textColor; ctx.shadowBlur = 0; ctx.fillText(photoText, canvas.width / 2, barY + fSize * 1.2);
      }
      setProcessedPhotoURL(canvas.toDataURL('image/jpeg', 0.92)); setPhotoProcessing(false);
    };
    img.src = photoURL;
  };

  const downloadPhoto = () => {
    if (!processedPhotoURL) return;
    const a = document.createElement('a'); a.href = processedPhotoURL; a.download = 'nnit-edited-' + resizeTarget + '.jpg'; a.click();
  };

  const generateStreamInfo = () => {
    if (!streamTitle.trim()) { alert('Please enter a stream title'); return; }
    const platform = streamPlatforms[selectedPlatform];
    setGeneratedStream({ ...platform, title: streamTitle, generatedAt: new Date().toLocaleString() });
  };

  // TTS preview
  const previewTTS = () => {
    if (!ttsText.trim()) { alert('Enter some text first'); return; }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(ttsText);
    const voice = ttsVoices.find(v => v.name === ttsVoice);
    if (voice) utt.voice = voice;
    window.speechSynthesis.speak(utt);
  };

  // Record voice
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch (err) { alert('Microphone access denied: ' + err.message); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    clearInterval(recordingTimerRef.current);
    setIsRecording(false);
  };

  // Generate AI script
  const generateScript = async () => {
    if (!scriptTopic.trim()) { alert('Enter a topic'); return; }
    setScriptLoading(true);
    try {
      const response = await fetch(API_URL + '/api/ai/video-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: scriptTopic, duration: '60 seconds', style: 'engaging' })
      });
      const data = await response.json();
      if (data.script) {
        const full = (data.script.hook || '') + '\n\n' + (data.script.sections || []).map(s => s.content).join('\n\n') + '\n\n' + (data.script.cta || '');
        setGeneratedScript(full.trim());
        setTtsText(full.trim());
      }
    } catch (err) { alert('Script generation failed: ' + err.message); }
    finally { setScriptLoading(false); }
  };

  // Merge audio into video
  const mergeAudioVideo = async () => {
    if (!audioVideoFile) { alert('Please upload a video first'); return; }
    setAudioProcessing(true);

    try {
      const formData = new FormData();
      formData.append('video', audioVideoFile);

      if (audioMode === 'tts') {
        if (!ttsText.trim()) { alert('Enter text for voiceover'); setAudioProcessing(false); return; }
        // Convert TTS to audio blob using Web Speech API
        setAudioProgress('Generating voiceover...');
        const audioBlob = await generateTTSBlob(ttsText, ttsVoice);
        formData.append('audio', audioBlob, 'voiceover.webm');
        formData.append('audioType', 'voiceover');
        formData.append('volume', '100');
      } else if (audioMode === 'music') {
        if (!musicFile) { alert('Please upload a music file'); setAudioProcessing(false); return; }
        formData.append('audio', musicFile);
        formData.append('audioType', 'music');
        formData.append('volume', musicVolume.toString());
      } else if (audioMode === 'record') {
        if (!recordedBlob) { alert('Please record your voice first'); setAudioProcessing(false); return; }
        formData.append('audio', recordedBlob, 'recording.webm');
        formData.append('audioType', 'voiceover');
        formData.append('volume', '100');
      } else if (audioMode === 'script') {
        if (!generatedScript.trim()) { alert('Please generate a script first'); setAudioProcessing(false); return; }
        setAudioProgress('Generating voiceover from script...');
        const audioBlob = await generateTTSBlob(generatedScript, ttsVoice);
        formData.append('audio', audioBlob, 'script-voice.webm');
        formData.append('audioType', 'voiceover');
        formData.append('volume', '100');
      }

      setAudioProgress('Merging audio with video on server...');
      const response = await fetch(API_URL + '/api/media/merge-audio', { method: 'POST', body: formData });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Server error' }));
        throw new Error(err.error || 'Server error ' + response.status);
      }
      setAudioProgress('Downloading merged video...');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'nnit-with-audio.mp4'; a.click();
      URL.revokeObjectURL(url);
      setAudioProgress('Done! Video with audio downloaded.');
    } catch (err) {
      alert('Merge failed: ' + err.message); setAudioProgress('');
    } finally { setAudioProcessing(false); }
  };

  // Convert TTS to audio blob using Web Speech + MediaRecorder
  const generateTTSBlob = (text, voiceName) => {
    return new Promise((resolve, reject) => {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const destination = audioCtx.createMediaStreamDestination();
      const recorder = new MediaRecorder(destination.stream);
      const chunks = [];
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = () => resolve(new Blob(chunks, { type: 'audio/webm' }));
      recorder.start();
      const utt = new SpeechSynthesisUtterance(text);
      const voice = ttsVoices.find(v => v.name === voiceName);
      if (voice) utt.voice = voice;
      utt.onend = () => { setTimeout(() => recorder.stop(), 500); };
      utt.onerror = reject;
      window.speechSynthesis.speak(utt);
    });
  };

  const tabs = [
    { id: 'video', label: 'ðŸŽ¬ Video Editor' },
    { id: 'audio', label: 'ðŸŽµ Audio & Voice' },
    { id: 'photo', label: 'ðŸ“¸ Photo Editor' },
    { id: 'live', label: 'ðŸ”´ Live Stream' },
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Media Editor</h1>
      <p style={styles.subtitle}>Edit videos, add voice/music, edit photos and set up live streams</p>
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
          <h2 style={styles.cardTitle}>ðŸŽ¬ Video Editor</h2>
          <p style={styles.description}>Trim your video and add captions overlay</p>
          <div style={styles.uploadArea}>
            <input type="file" accept="video/*" onChange={handleVideoUpload} style={{ display: 'none' }} id="videoUpload" />
            <label htmlFor="videoUpload" style={styles.uploadLabel}>{videoFile ? 'ðŸ“¹ ' + videoFile.name : 'ðŸ“ Click to upload video'}</label>
          </div>
          {videoURL && (
            <div style={styles.videoSection}>
              <video ref={videoRef} src={videoURL} controls style={styles.videoPreview} onLoadedMetadata={handleVideoLoaded} />
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>âœ‚ï¸ Trim Video</h3>
                <p style={styles.hint}>Duration: {videoDuration.toFixed(1)}s</p>
                <div style={styles.trimRow}>
                  <label style={styles.label}>Start: {trimStart.toFixed(1)}s</label>
                  <input type="range" min="0" max={videoDuration} step="0.1" value={trimStart}
                    onChange={e => setTrimStart(Math.min(parseFloat(e.target.value), trimEnd - 0.5))} style={styles.slider} />
                </div>
                <div style={styles.trimRow}>
                  <label style={styles.label}>End: {trimEnd.toFixed(1)}s</label>
                  <input type="range" min="0" max={videoDuration} step="0.1" value={trimEnd}
                    onChange={e => setTrimEnd(Math.max(parseFloat(e.target.value), trimStart + 0.5))} style={styles.slider} />
                </div>
                <p style={styles.hint}>Selected: {(trimEnd - trimStart).toFixed(1)} seconds</p>
                <button onClick={previewTrim} style={styles.secondaryButton}>â–¶ï¸ Preview Trim</button>
              </div>
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>ðŸ’¬ Add Caption Overlay</h3>
                <input type="text" placeholder="Enter caption text..." value={videoCaption}
                  onChange={e => setVideoCaption(e.target.value)} style={styles.input} />
                <select value={captionPosition} onChange={e => setCaptionPosition(e.target.value)} style={styles.select}>
                  <option value="top">Top</option><option value="center">Center</option><option value="bottom">Bottom</option>
                </select>
              </div>
              {videoProgress && <div style={styles.progressBox}>â³ {videoProgress}</div>}
              <button onClick={exportVideo} disabled={videoProcessing} style={styles.primaryButton}>
                {videoProcessing ? 'â³ Processing...' : 'â¬‡ï¸ Export Video'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* AUDIO & VOICE */}
      {activeTab === 'audio' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>ðŸŽµ Audio & Voice</h2>
          <p style={styles.description}>Add AI voiceover, background music, or recorded voice to your video</p>

          <div style={styles.uploadArea}>
            <input type="file" accept="video/*" onChange={e => setAudioVideoFile(e.target.files[0])} style={{ display: 'none' }} id="audioVideoUpload" />
            <label htmlFor="audioVideoUpload" style={styles.uploadLabel}>
              {audioVideoFile ? 'ðŸ“¹ ' + audioVideoFile.name : 'ðŸ“ Upload video to add audio to'}
            </label>
          </div>

          <div style={styles.audioModeGrid}>
            {[['tts','ðŸ—£ï¸','AI Voiceover'],['music','ðŸŽµ','Background Music'],['record','ðŸŽ¤','Record Voice'],['script','ðŸ¤–','AI Script']].map(([mode, icon, label]) => (
              <button key={mode} onClick={() => setAudioMode(mode)}
                style={{ ...styles.platformCard, ...(audioMode === mode ? styles.platformCardActive : {}) }}>
                <span style={{ fontSize: '28px' }}>{icon}</span>
                <span style={{ fontSize: '13px', fontWeight: '600' }}>{label}</span>
              </button>
            ))}
          </div>

          {/* TTS */}
          {audioMode === 'tts' && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>ðŸ—£ï¸ AI Voiceover (Text to Speech)</h3>
              <textarea placeholder="Type the text you want spoken over the video..." value={ttsText}
                onChange={e => setTtsText(e.target.value)} style={{ ...styles.input, height: '100px', resize: 'vertical' }} />
              {ttsVoices.length > 0 && (
                <select value={ttsVoice} onChange={e => setTtsVoice(e.target.value)} style={styles.select}>
                  {ttsVoices.map(v => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
                </select>
              )}
              <button onClick={previewTTS} style={styles.secondaryButton}>â–¶ï¸ Preview Voice</button>
            </div>
          )}

          {/* MUSIC */}
          {audioMode === 'music' && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>ðŸŽµ Background Music</h3>
              <input type="file" accept="audio/*" onChange={e => setMusicFile(e.target.files[0])} style={{ display: 'none' }} id="musicUpload" />
              <label htmlFor="musicUpload" style={styles.uploadLabel}>
                {musicFile ? 'ðŸŽµ ' + musicFile.name : 'ðŸ“ Upload music file (MP3, WAV, etc.)'}
              </label>
              <div style={{ marginTop: '12px' }}>
                <label style={styles.label}>Music Volume: {musicVolume}%</label>
                <input type="range" min="10" max="100" value={musicVolume}
                  onChange={e => setMusicVolume(e.target.value)} style={styles.slider} />
              </div>
            </div>
          )}

          {/* RECORD */}
          {audioMode === 'record' && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>ðŸŽ¤ Record Your Voice</h3>
              <p style={styles.hint}>Allow microphone access when prompted</p>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                {!isRecording ? (
                  <button onClick={startRecording} style={{ ...styles.primaryButton, backgroundColor: '#e53e3e' }}>
                    ðŸ”´ Start Recording
                  </button>
                ) : (
                  <button onClick={stopRecording} style={{ ...styles.secondaryButton, border: '2px solid #e53e3e', color: '#e53e3e' }}>
                    â¹ï¸ Stop Recording ({recordingTime}s)
                  </button>
                )}
              </div>
              {recordedBlob && (
                <div>
                  <p style={styles.hint}>Recording ready! Preview:</p>
                  <audio controls src={URL.createObjectURL(recordedBlob)} style={{ width: '100%' }} />
                </div>
              )}
            </div>
          )}

          {/* AI SCRIPT */}
          {audioMode === 'script' && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>ðŸ¤– AI Script Generator</h3>
              <input type="text" placeholder="Topic (e.g. 'How to grow on Instagram')" value={scriptTopic}
                onChange={e => setScriptTopic(e.target.value)} style={styles.input} />
              <button onClick={generateScript} disabled={scriptLoading} style={styles.secondaryButton}>
                {scriptLoading ? 'â³ Generating...' : 'ðŸ¤– Generate Script'}
              </button>
              {generatedScript && (
                <div style={{ marginTop: '12px' }}>
                  <textarea value={generatedScript} onChange={e => setGeneratedScript(e.target.value)}
                    style={{ ...styles.input, height: '150px', resize: 'vertical', marginTop: '8px' }} />
                  <p style={styles.hint}>Script will be read as voiceover. You can edit it above.</p>
                  {ttsVoices.length > 0 && (
                    <select value={ttsVoice} onChange={e => setTtsVoice(e.target.value)} style={styles.select}>
                      {ttsVoices.map(v => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
                    </select>
                  )}
                  <button onClick={() => { setTtsText(generatedScript); previewTTS(); }} style={styles.secondaryButton}>â–¶ï¸ Preview Voice</button>
                </div>
              )}
            </div>
          )}

          {audioProgress && <div style={{ ...styles.progressBox, marginTop: '16px' }}>â³ {audioProgress}</div>}

          <button onClick={mergeAudioVideo} disabled={audioProcessing || !audioVideoFile} style={{ ...styles.primaryButton, marginTop: '16px' }}>
            {audioProcessing ? 'â³ Processing...' : 'ðŸŽ¬ Merge Audio into Video'}
          </button>
        </div>
      )}

      {/* PHOTO EDITOR */}
      {activeTab === 'photo' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>ðŸ“¸ Photo Editor</h2>
          <p style={styles.description}>Resize for any platform and add text overlay</p>
          <div style={styles.uploadArea}>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} id="photoUpload" />
            <label htmlFor="photoUpload" style={styles.uploadLabel}>{photoFile ? 'ðŸ–¼ï¸ ' + photoFile.name : 'ðŸ“ Click to upload photo'}</label>
          </div>
          {photoURL && (
            <div style={styles.photoSection}>
              <div style={styles.photoPreviewRow}>
                <div><p style={styles.hint}>Original</p><img src={photoURL} alt="original" style={styles.photoPreview} /></div>
                {processedPhotoURL && <div><p style={styles.hint}>Processed</p><img src={processedPhotoURL} alt="processed" style={styles.photoPreview} /></div>}
              </div>
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>ðŸ“ Resize for Platform</h3>
                <select value={resizeTarget} onChange={e => setResizeTarget(e.target.value)} style={styles.select}>
                  {Object.entries(platformSizes).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
                </select>
              </div>
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>âœï¸ Add Text Overlay</h3>
                <input type="text" placeholder="Enter text to overlay..." value={photoText}
                  onChange={e => setPhotoText(e.target.value)} style={styles.input} />
                <div style={styles.row}>
                  <select value={textPosition} onChange={e => setTextPosition(e.target.value)} style={{ ...styles.select, flex: 1 }}>
                    <option value="top">Top</option><option value="center">Center</option><option value="bottom">Bottom</option>
                  </select>
                  <div style={styles.colorRow}>
                    <label style={styles.label}>Color:</label>
                    <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} style={styles.colorPicker} />
                  </div>
                  <div style={styles.colorRow}>
                    <label style={styles.label}>Size: {fontSize}px</label>
                    <input type="range" min="16" max="80" value={fontSize} onChange={e => setFontSize(e.target.value)} style={styles.slider} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={processPhoto} disabled={photoProcessing} style={styles.primaryButton}>
                  {photoProcessing ? 'â³ Processing...' : 'âš™ï¸ Process Photo'}
                </button>
                {processedPhotoURL && <button onClick={downloadPhoto} style={styles.secondaryButton}>â¬‡ï¸ Download</button>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* LIVE STREAM */}
      {activeTab === 'live' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>ðŸ”´ Live Stream Setup</h2>
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
            <button onClick={generateStreamInfo} style={styles.primaryButton}>ðŸ”´ Generate Stream Info</button>
          </div>
          {generatedStream && (
            <div style={styles.streamResult}>
              <h3 style={styles.sectionTitle}>{generatedStream.icon} {generatedStream.name} â€” Ready to Stream</h3>
              <p style={styles.hint}>Title: {generatedStream.title}</p>
              <div style={styles.streamBox}>
                <div style={styles.streamField}>
                  <span style={styles.streamLabel}>RTMP Server URL</span>
                  <div style={styles.streamValue}>{generatedStream.rtmpUrl}</div>
                </div>
                <div style={styles.streamField}>
                  <span style={styles.streamLabel}>Stream Key</span>
                  <div style={styles.streamValue}>Get from your platform dashboard â†’{' '}
                    <a href={generatedStream.dashboardUrl} target="_blank" rel="noreferrer" style={{ color: '#667eea' }}>Open Dashboard</a>
                  </div>
                </div>
              </div>
              <div style={styles.instructionsBox}>
                <strong>ðŸ“‹ Setup Instructions:</strong>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px', lineHeight: '1.7', color: '#4a5568' }}>{generatedStream.instructions}</p>
              </div>
              <div style={styles.obsBox}>
                <strong>ðŸŽ® OBS Settings:</strong>
                <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#4a5568', lineHeight: '1.7' }}>
                  1. Open OBS â†’ Settings â†’ Stream<br />2. Service: Custom<br />
                  3. Server: {generatedStream.rtmpUrl}<br />4. Stream Key: (from platform dashboard)<br />5. Click Apply â†’ Start Streaming
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
  progressBox: { padding: '12px 16px', backgroundColor: '#ebf8ff', borderRadius: '8px', fontSize: '14px', color: '#2b6cb0', border: '1px solid #bee3f8' },
  audioModeGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' },
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
