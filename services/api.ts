// services/api.ts
import Constants from 'expo-constants';
import axios from 'axios';

//const apiUrl = Constants.expoConfig.extra.apiUrl;
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
