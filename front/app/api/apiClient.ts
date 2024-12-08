import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://10.0.2.2:3000',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default apiClient;