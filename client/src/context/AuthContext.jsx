import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            setUser(JSON.parse(userData));
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            const { token, role, name } = res.data;

            const userData = { email, role, name };
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));

            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(userData);
            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err.response?.data?.error || 'Login failed'
            };
        }
    };

    const signup = async (data) => {
        try {
            await api.post('/auth/signup', data);
            return { success: true };
        } catch (err) {
            return {
                success: false,
                error: err.response?.data?.error || 'Signup failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
