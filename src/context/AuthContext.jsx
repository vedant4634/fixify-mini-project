import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('fixify_current_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('fixify_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('fixify_current_user');
    }
  }, [user]);

  // Validate stored session with backend on initial load
  useEffect(() => {
    async function verifySession() {
      const token = localStorage.getItem('fixify_token');
      if (token && !token.startsWith('demo_')) {
        try {
          const res = await api.auth.getMe();
          if (res && res.user) {
            setUser(res.user);
          }
        } catch {
          // Token expired or invalid
          console.warn('[Fixify Auth] Stored session expired or invalid. Clearing token.');
          localStorage.removeItem('fixify_token');
          localStorage.removeItem('fixify_current_user');
          setUser(null);
        }
      }
    }
    verifySession();
  }, []);

  // Customer Login - Direct Backend Authentication with MySQL mpfixfy
  const loginCustomer = async (emailOrPhone, password, remember = true) => {
    setLoading(true);
    try {
      const res = await api.auth.login(emailOrPhone, password);
      if (res && res.token && res.user) {
        setUser(res.user);
        if (remember) {
          localStorage.setItem('fixify_token', res.token);
        }
        return { success: true, user: res.user };
      }
      throw new Error(res.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  // Customer Signup - Inserts actual record into mpfixfy.users
  const signupCustomer = async (formData) => {
    setLoading(true);
    try {
      const res = await api.auth.signup(formData);
      if (res && res.token && res.user) {
        setUser(res.user);
        localStorage.setItem('fixify_token', res.token);
        return { success: true, user: res.user };
      }
      throw new Error(res.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // Technician Login - Direct Backend Authentication
  const loginTechnician = async (emailOrPhone, password) => {
    setLoading(true);
    try {
      // First attempt database user login
      try {
        const res = await api.auth.login(emailOrPhone, password);
        if (res && res.token && res.user) {
          const techUser = { ...res.user, role: 'technician' };
          setUser(techUser);
          localStorage.setItem('fixify_token', res.token);
          return { success: true, user: techUser };
        }
      } catch (authErr) {
        // If not in users table yet, check if registered in providers table
        const techs = await api.technicians.getAll();
        const matched = techs.find(
          (t) =>
            t.email?.toLowerCase() === emailOrPhone.toLowerCase() ||
            t.phone?.replace(/\s+/g, '') === emailOrPhone.replace(/\s+/g, '')
        );

        if (matched) {
          const techUser = { ...matched, role: 'technician' };
          setUser(techUser);
          localStorage.setItem('fixify_token', 'tech_session_' + matched.id);
          return { success: true, user: techUser };
        }
        throw authErr;
      }
    } finally {
      setLoading(false);
    }
  };

  // Technician Registration - Inserts into mpfixfy.providers
  const registerTechnician = async (techData) => {
    setLoading(true);
    try {
      const created = await api.technicians.register({
        name: techData.name,
        email: techData.email,
        phone: techData.phone,
        city: techData.city,
        address: techData.address,
        category: techData.category,
        skills: techData.skills,
        experience: techData.experience,
        bio: techData.bio,
        hourlyRate: Number(techData.hourlyRate) || 350,
      });

      const authUser = { ...(created.technician || created), role: 'technician' };
      setUser(authUser);
      localStorage.setItem('fixify_token', 'tech_session_' + (authUser.id || Date.now()));
      return { success: true, user: authUser };
    } finally {
      setLoading(false);
    }
  };

  // Admin Login - Verifies credentials in mpfixfy.users table (admin@fixify.in)
  const loginAdmin = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.auth.login(email, password);
      if (res && res.token && res.user) {
        if (res.user.role !== 'admin') {
          throw new Error('Access denied. This account does not have administrator privileges.');
        }
        setUser(res.user);
        localStorage.setItem('fixify_token', res.token);
        return { success: true, user: res.user };
      }
      throw new Error(res.message || 'Admin authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fixify_current_user');
    localStorage.removeItem('fixify_token');
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        role: user?.role || null,
        loading,
        loginCustomer,
        signupCustomer,
        loginTechnician,
        registerTechnician,
        loginAdmin,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
