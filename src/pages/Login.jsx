import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

const Login = () => {
    const navigate = useNavigate();
    const navRegister = () => { navigate('/register'); }

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const response = await fetch(`${apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                toast.success(data.message || 'Login successful!');
                navigate("/");
            } else {
                toast.error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Login failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50'>
            <div className='w-[440px] bg-white shadow-xl rounded-2xl p-10 flex flex-col border border-gray-100'>

                <div className='mb-8 text-center'>
                    <div className='inline-flex items-center justify-center w-14 h-14 bg-indigo-100 rounded-2xl mb-4'>
                        <span className='text-2xl'>📅</span>
                    </div>
                    <h2 className='text-3xl font-bold text-gray-800 tracking-tight'>Welcome Back</h2>
                    <p className='text-gray-400 mt-2 text-sm'>Sign in to your calendar</p>
                </div>

                <form className='flex flex-col gap-5' onSubmit={handleLogin}>
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
                        disabled={loading}
                        className={`w-full mt-2 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-base rounded-xl active:scale-[0.98] transition-all duration-150 shadow-md shadow-indigo-100 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing In...
                            </>
                        ) : 'Sign In'}
                    </button>
                    <p className='text-center text-sm text-gray-400'>
                        Don't have an account?{' '}
                        <span className='text-indigo-500 font-semibold cursor-pointer hover:underline' onClick={navRegister}>Register here</span>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default Login