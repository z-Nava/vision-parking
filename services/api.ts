// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://vpa.disse.space/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
