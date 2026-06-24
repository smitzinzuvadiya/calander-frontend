import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

const Register = () => {
    const navigate = useNavigate();
    const navLogin = () => { navigate("/login"); }

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const response = await fetch(`${apiBaseUrl}/auth/register`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                toast.success(data.message || 'Registration successful!');
                navigate('/');
            } else {
                toast.error(data.message || 'Registration failed. Please try again.')
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error('Server error. Please try again.');
        }
    }

    return (
        <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50'>
            <div className='w-[440px] bg-white shadow-xl rounded-2xl p-10 flex flex-col border border-gray-100'>

                <div className='mb-8 text-center'>
                    <div className='inline-flex items-center justify-center w-14 h-14 bg-indigo-100 rounded-2xl mb-4'>
                        <span className='text-2xl'>✨</span>
                    </div>
                    <h2 className='text-3xl font-bold text-gray-800 tracking-tight'>Create Account</h2>
                    <p className='text-gray-400 mt-2 text-sm'>Join and manage your calendar</p>
                </div>

                <form className='flex flex-col gap-5' onSubmit={handleRegister}>
                    <div className='flex flex-col gap-1.5'>
                        <label className='text-sm font-semibold text-gray-600'>Full Name</label>
                        <input
                            type="text"
                            placeholder='Your name'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className='w-full px-4 py-3 bg-gray-50 text-gray-800 placeholder-gray-300 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200'
                        />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <label className='text-sm font-semibold text-gray-600'>Email Address</label>
                        <input
                            type="email"
                            placeholder='name@example.com'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='w-full px-4 py-3 bg-gray-50 text-gray-800 placeholder-gray-300 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200'
                        />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <label className='text-sm font-semibold text-gray-600'>Password</label>
                        <input
                            type="password"
                            placeholder='••••••••'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='w-full px-4 py-3 bg-gray-50 text-gray-800 placeholder-gray-300 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200'
                        />
                    </div>
                    <button
                        type='submit'
                        className='w-full mt-2 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-base rounded-xl cursor-pointer active:scale-[0.98] transition-all duration-150 shadow-md shadow-indigo-100'
                    >
                        Create Account
                    </button>
                    <p className='text-center text-sm text-gray-400'>
                        Already have an account?{' '}
                        <span className='text-indigo-500 font-semibold cursor-pointer hover:underline' onClick={navLogin}>Login here</span>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default Register