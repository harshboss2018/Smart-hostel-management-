import React, { createContext, useContext, useMemo, useState } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

const decodeTokenRole = (token) => {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.role;
  } catch {
    return null;
  }
};

const getInitialUser = () => {
  const savedUser = localStorage.getItem('user');
  const token = localStorage.getItem('token');

  if (!savedUser || !token) {
    return null;
  }

  try {
    const parsedUser = JSON.parse(savedUser);
    return decodeTokenRole(token) === parsedUser.role ? parsedUser : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getInitialUser);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const persistTheme = (nextTheme) => {
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const login = async (identifier, password, role) => {
    try {
      const { data } = await API.post('/auth/login', { identifier, password, role });
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Connection to API failed.',
      };
    }
  };

  const updateProfile = async (updatedData) => {
    try {
      const { data } = await API.patch('/users/profile', updatedData);
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      return { success: true, user: data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Update failed',
      };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const { data } = await API.patch('/users/password', { currentPassword, newPassword });
      return { success: true, message: data?.message || 'Password updated.' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password update failed',
      };
    }
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      theme,
      updateProfile,
      changePassword,
      toggleTheme: () => persistTheme(theme === 'dark' ? 'light' : 'dark'),
    }),
    [theme, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
