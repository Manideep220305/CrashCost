import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load user on start
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const API_URL = import.meta.env.VITE_API_URL || '';
            const { data } = await axios.post(`${API_URL}/api/auth/login`, { email, password });

            // Success
            setUser(data);
            setToken(data.token);
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

            setLoading(false);
            return { success: true };
        } catch (err) {
            setLoading(false);
            const message = err.response?.data?.message || 'Login failed';
            setError(message);
            return { success: false, message };
        }
    };

    const register = async (name, email, password) => {
        setLoading(true);
        setError(null);
        try {
            const API_URL = import.meta.env.VITE_API_URL || '';
            const { data } = await axios.post(`${API_URL}/api/auth/register`, { name, email, password });

            // Success - log them in immediately
            setUser(data);
            setToken(data.token);
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

            setLoading(false);
            return { success: true };
        } catch (err) {
            setLoading(false);
            const message = err.response?.data?.message || 'Registration failed';
            setError(message);
            return { success: false, message };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, setError }}>
            {children}
        </AuthContext.Provider>
    );
};
