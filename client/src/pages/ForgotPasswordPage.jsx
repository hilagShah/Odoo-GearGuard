import React from 'react';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-700 text-center">
                <h2 className="text-3xl font-bold text-white mb-4">Forgot Password</h2>
                <p className="text-gray-400 mb-6">
                    Please contact your administrator to reset your password.
                </p>
                <Link to="/login" className="text-blue-400 hover:underline">
                    Back to Login
                </Link>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
