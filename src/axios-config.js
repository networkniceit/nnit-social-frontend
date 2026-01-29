import axios from 'axios';

const API_URL = 'https://nnit-social-backend-production-6ad7.up.railway.app';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default axiosInstance;
