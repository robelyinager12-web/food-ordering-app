import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // restore the session when the app opens
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const { data } = await client.get('/auth/me');
          setUser(data);
        }
      } catch (err) {
        if (err.response?.status === 401) await AsyncStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveSession = async ({ user, token }) => {
    await AsyncStorage.setItem('token', token);
    setUser(user);
  };

  const login = async (email, password) => {
    const { data } = await client.post('/auth/login', { email, password });
    await saveSession(data);
  };

  const register = async (form) => {
    const { data } = await client.post('/auth/register', form);
    await saveSession(data);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
