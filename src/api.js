const API_URL = import.meta.env.VITE_API_URL || 'https://nnit-social-backend-production-6ad7.up.railway.app';

export const apiClient = {
  get: (path) => fetch(${API_URL}).then(r => r.json()),
  post: (path, data) => fetch(${API_URL}, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json())
};
