import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const SignupPage = () => {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const validatePassword = (pwd) => {
        // Small case, large case, special char, > 8 chars (9+)
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{9,})/;
        return regex.test(pwd);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            return setError("Passwords do not match");
        }

        if (!validatePassword(formData.password)) {
            return setError("Password must contain a lowercase, uppercase, special character and be > 8 characters.");
        }

        const res = await signup({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: 'Portal User'
        });

        if (res.success) {
            setSuccess('Account created successfully! Please login.');
            setTimeout(() => navigate('/login'), 2000);
        } else {
            setError(res.error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-700">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">Sign Up</h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-500/10 border border-green-500 text-green-500 p-3 rounded mb-4 text-sm">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-gray-400 text-sm">Full Name</label>
                        <input
                            type="text"
                            className="w-full bg-gray-700 text-white p-3 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
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
                    <div>
                        <label className="text-gray-400 text-sm">Confirm Password</label>
                        <input
                            type="password"
                            className="w-full bg-gray-700 text-white p-3 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-semibold transition-colors"
                    >
                        Create Account
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-500 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-400 hover:underline">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
