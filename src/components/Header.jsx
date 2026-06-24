import React from 'react'
import Logo from '../assets/logo.png'
import { useNavigate } from 'react-router-dom'

const Header = ({ onLogout, onAddEvent, currentView, onViewChange }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const navLogin = () => { navigate('/login'); }
    const navRegister = () => { navigate('/register'); }

    const views = ['year', 'month', 'week'];

    return (
        <div className='w-full bg-white border-b border-gray-200 flex justify-between items-center px-6 shadow-sm'>
            <div className='flex items-center gap-2'>
                <img src={Logo} alt="Logo" className='w-14 h-14' />
                <h1 className='text-2xl font-bold text-gray-800'>Calendar</h1>
            </div>
            <div className='flex items-center gap-4'>
                {user ? (
                    <>
                        <div className='flex bg-gray-100 rounded-xl overflow-hidden border border-gray-200'>
                            {views.map((view) => (
                                <span
                                    key={view}
                                    className={`px-4 py-2 cursor-pointer font-semibold text-sm capitalize transition-all duration-150
                                        ${currentView === view
                                            ? 'bg-indigo-500 text-white shadow-sm'
                                            : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'}
                                    `}
                                    onClick={() => onViewChange(view)}
                                >
                                    {view}
                                </span>
                            ))}
                        </div>
                        <span className='text-base font-medium text-gray-600'>
                            Hello, <span className='text-indigo-600 font-bold'>{user.name}</span>
                        </span>
                        <span
                            className='cursor-pointer px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl text-sm shadow-sm active:scale-[0.98] transition-all duration-150'
                            onClick={onAddEvent}
                        >
                            + Add Event
                        </span>
                        <span
                            className='cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm border border-gray-200 transition-all duration-150'
                            onClick={onLogout}
                        >
                            Logout
                        </span>
                    </>
                ) : (
                    <>
                        <span className='cursor-pointer px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl text-sm transition-all duration-150' onClick={navLogin}>Login</span>
                        <span className='cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm border border-gray-200 transition-all duration-150' onClick={navRegister}>Register</span>
                    </>
                )}
            </div>
        </div>
    )
}

export default Header