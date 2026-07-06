import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('erp_token');
    if (!token) {
      setLoading(false);
      return;
    }
    apiClient.get('/auth/me')
      .then(({ data }) => {
        setUser(data.user);
        setPermissions(data.user.permissions || []);
      })
      .catch(() => {
        localStorage.removeItem('erp_token');
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(username, password) {
    const { data } = await apiClient.post('/auth/login', { username, password });
    localStorage.setItem('erp_token', data.token);
    localStorage.setItem('erp_user', JSON.stringify(data.user));
    // نجلب البيانات الكاملة مع الصلاحيات
    const me = await apiClient.get('/auth/me');
    setUser(me.data.user);
    setPermissions(me.data.user.permissions || []);
    return me.data.user;
  }

  function logout() {
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
    setUser(null);
    setPermissions([]);
  }

  function can(permissionCode) {
    return permissions.includes(permissionCode);
  }

  return (
    <AuthContext.Provider value={{ user, permissions, loading, login, logout, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
