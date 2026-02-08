if (response.accessToken) {
  try {
    const res = await fetch('http://localhost:5000/auth/facebook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: response.accessToken })
    });

    const data = await res.json();
    console.log('Backend verification response:', data);

    // Save JWT for future requests
    localStorage.setItem('nnitToken', data.token);
  } catch (err) {
    console.error('Error sending token to backend:', err);
  }
}
