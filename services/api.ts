// services/api.ts
import Constants from 'expo-constants';
import axios from 'axios';

//const apiUrl = Constants.expoConfig.extra.apiUrl;
const api = axios.create({
  //baseURL: 'http://localhost:3000/api',
  //baseURL: 'http://10.0.2.2:3000/api',
  baseURL: 'https://ksngcksz-3000.usw3.devtunnels.ms/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
