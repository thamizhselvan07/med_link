import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Set base URL
    axios.defaults.baseURL = `${import.meta.env.VITE_API_URL}/api`;

    useEffect(() => {
        try {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (token && savedUser && savedUser !== 'undefined') {
                setUser(JSON.parse(savedUser));
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
        } catch (error) {
            console.error("Auth initialization error", error);
            localStorage.clear(); // Clear potentially corrupted state
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (username, password, role) => {
        try {
            const res = await axios.post('/auth/login', { username, password, role });
            if (res.data.auth) {
                const userData = { username: res.data.username, role: res.data.role, name: res.data.name };

                // DEMO FIX: Hardcode Doctor ID to D1 for demo flow
                if (res.data.role === 'doctor') {
                    userData.doctor_id = 'D1';
                    localStorage.setItem('doctor_id', 'D1');
                }

                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(userData));
                axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
                setUser(userData);
                return { success: true };
            }
            return { success: false, message: res.data.message || "Login failed" };
        } catch (error) {
            console.error("Login failed", error);
            const message = error.response?.data?.message || "Login failed. Please check your connection.";
            return { success: false, message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        localStorage.removeItem('patient_id');
        localStorage.removeItem('doctor_id');
        localStorage.removeItem('admin_id');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
