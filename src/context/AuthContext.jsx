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

  // Customer Login
  const loginCustomer = async (emailOrPhone, password, remember = true) => {
    setLoading(true);
    try {
      // Find customer in stored customers or match mock
      const customers = await api.customers.getAll();
      const matched = customers.find(
        (c) =>
          c.email.toLowerCase() === emailOrPhone.toLowerCase() ||
          c.phone.replace(/\s+/g, '') === emailOrPhone.replace(/\s+/g, '')
      );

      // Allow login for matched customer or create demo session
      const authUser = matched
        ? { ...matched, role: 'customer' }
        : {
            id: 'cust-demo',
            name: emailOrPhone.includes('@') ? emailOrPhone.split('@')[0] : 'Fixify Customer',
            email: emailOrPhone.includes('@') ? emailOrPhone : 'customer@fixify.in',
            phone: '+91 98200 12345',
            city: 'Mumbai',
            address: 'Flat 402, Sea Green Apts, Juhu Tara Road, Mumbai',
            pincode: '400049',
            role: 'customer',
          };

      setUser(authUser);
      if (remember) {
        localStorage.setItem('fixify_token', 'demo_customer_token_' + Date.now());
      }
      return { success: true, user: authUser };
    } finally {
      setLoading(false);
    }
  };

  // Customer Signup
  const signupCustomer = async (formData) => {
    setLoading(true);
    try {
      const newCustomer = {
        id: `cust-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city || 'Mumbai',
        pincode: formData.pincode || '400001',
        bookingsCount: 0,
        totalSpent: 0,
        status: 'Active',
        joinedDate: new Date().toISOString().split('T')[0],
        role: 'customer',
      };

      // Add to stored customers
      const existing = await api.customers.getAll();
      localStorage.setItem('fixify_customers', JSON.stringify([...existing, newCustomer]));

      setUser(newCustomer);
      localStorage.setItem('fixify_token', 'demo_customer_token_' + Date.now());
      return { success: true, user: newCustomer };
    } finally {
      setLoading(false);
    }
  };

  // Technician Login
  const loginTechnician = async (emailOrPhone, password) => {
    setLoading(true);
    try {
      const techs = await api.technicians.getAll();
      const matched = techs.find(
        (t) =>
          t.email.toLowerCase() === emailOrPhone.toLowerCase() ||
          t.phone.replace(/\s+/g, '') === emailOrPhone.replace(/\s+/g, '')
      );

      if (matched) {
        const authUser = { ...matched, role: 'technician' };
        setUser(authUser);
        localStorage.setItem('fixify_token', 'demo_tech_token_' + Date.now());
        return { success: true, user: authUser };
      }

      // If user typed a custom email for demo
      const demoTech = {
        id: 'tech-custom',
        name: 'Suresh Verma',
        email: emailOrPhone,
        phone: '+91 97405 88219',
        city: 'Bengaluru',
        category: 'AC Repair & Maintenance',
        skills: 'Jet cleaning, refrigerant charging',
        experience: '8 years',
        rating: 4.9,
        verified: true,
        status: 'Verified',
        available: true,
        role: 'technician',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      };
      setUser(demoTech);
      localStorage.setItem('fixify_token', 'demo_tech_token_' + Date.now());
      return { success: true, user: demoTech };
    } finally {
      setLoading(false);
    }
  };

  // Technician Registration
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

      const authUser = { ...created, role: 'technician' };
      setUser(authUser);
      localStorage.setItem('fixify_token', 'demo_tech_token_' + Date.now());
      return { success: true, user: authUser };
    } finally {
      setLoading(false);
    }
  };

  // Admin Login
  const loginAdmin = async (email, password) => {
    setLoading(true);
    try {
      // In production, validates against backend auth endpoint
      if (email.toLowerCase().includes('admin') || email.toLowerCase() === 'admin@fixify.in') {
        const adminUser = {
          id: 'admin-super',
          name: 'Super Admin',
          email: 'admin@fixify.in',
          role: 'admin',
          designation: 'Operations Head',
        };
        setUser(adminUser);
        localStorage.setItem('fixify_token', 'demo_admin_token_' + Date.now());
        return { success: true, user: adminUser };
      } else {
        throw new Error('Invalid Admin Credentials. Use admin@fixify.in');
      }
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
