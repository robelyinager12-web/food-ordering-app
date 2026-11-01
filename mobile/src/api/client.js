import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// CHANGE THIS to your computer's IPv4 address
// (Android emulator can use http://10.0.2.2:5000/api)
export const API_URL = 'http://192.168.1.5:5000/api';

const client = axios.create({ baseURL: API_URL, timeout: 10000 });

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const errorMessage = (err) =>
  err.response?.data?.message || 'Network error. Check your connection and server.';

export default client;
