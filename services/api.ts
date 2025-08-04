// services/api.ts
import Constants from 'expo-constants';
import axios from 'axios';

const apiUrl = Constants.expoConfig?.extra?.apiUrl;
console.log('API URL:', apiUrl);
const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
