import { createContext, useContext, useEffect, useState } from 'react';
import client from '../api/client.js';

const AuthContext = createContext(null);
const ALLOWED = ['restaurant', 'admin'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // restore the session on page load
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setLoading(false);
      return;
    }
    client
      .get('/auth/me')
      .then(({ data }) => {
        if (ALLOWED.includes(data.role)) setUser(data);
        else localStorage.removeItem('token');
      })
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const save = ({ user, token }) => {
    if (!ALLOWED.includes(user.role)) {
      throw new Error('This dashboard is for restaurant owners only.');
    }
    localStorage.setItem('token', token);
    setUser(user);
  };

  const login = async (email, password) => {
    const { data } = await client.post('/auth/login', { email, password });
    save(data);
  };

  const register = async (form) => {
    const { data } = await client.post('/auth/register', { ...form, accountType: 'restaurant' });
    save(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
