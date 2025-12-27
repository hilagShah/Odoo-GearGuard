import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const res = await login(formData.email, formData.password);
        if (res.success) {
            navigate('/'); // Redirect to dashboard
        } else {
            setError(res.error); // "Account not exist" or "Invalid Password"
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-700">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">Login</h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-gray-400 text-sm">Email</label>
                        <input
                            type="email"
                            className="w-full bg-gray-700 text-white p-3 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-gray-400 text-sm">Password</label>
                        <input
                            type="password"
                            className="w-full bg-gray-700 text-white p-3 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-semibold transition-colors"
                    >
                        Login
                    </button>
                </form>

                <div className="mt-6 text-center space-y-2">
                    <Link to="/forgot-password" className="block text-sm text-blue-400 hover:underline">
                        Forgot Password?
                    </Link>
                    <p className="text-gray-500 text-sm">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-blue-400 hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
