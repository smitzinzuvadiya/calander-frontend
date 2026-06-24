import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

const Calender = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/Login');
        }
    }, [navigate]);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/Login');
    }

    const today = new Date()

    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const startDay = new Date(currentYear, currentMonth, 1).getDay();

    const emptyDays = Array.from({ length: startDay });
    const daysInMonthArray = Array.from({ length: daysInMonth }, (_, index) => index + 1);
    const totalDays = [...emptyDays, ...daysInMonthArray];

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekDaysShort = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    }

    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    }

    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchEvent = async () => {
            const token = localStorage.getItem('token');
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const response = await fetch(`${apiBaseUrl}/events`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setEvents(data.events);
            }
        };
        fetchEvent();
    }, []);
    const [showModal, setShowModal] = useState(false);
    const [eventTitle, setEventTitle] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [showSidePanel, setShowSidePanel] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDate, setShowDate] = useState(true);
    const [currentView, setCurrentView] = useState('month');
    const [currentWeekStart, setCurrentWeekStart] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - d.getDay());
        d.setHours(0, 0, 0, 0);
        return d;
    });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(null);
    const [dragEnd, setDragEnd] = useState(null);
    const [dragDate, setDragDate] = useState(null);

    const hours = Array.from({ length: 24 }, (_, i) => i);

    const formatHour = (h) => {
        if (h === 0) return '12 AM';
        if (h < 12) return `${h} AM`;
        if (h === 12) return '12 PM';
        return `${h - 12} PM`;
    }

    const handleMouseDown = (dateStr, hour) => {
        setIsDragging(true);
        setDragStart(hour);
        setDragEnd(hour);
        setDragDate(dateStr);
    }

    const handleMouseEnter = (dateStr, hour) => {
        if (isDragging && dateStr === dragDate) {
            setDragEnd(hour);
        }
    }

    const handleMouseUp = () => {
        if (isDragging && dragDate !== null) {
            const startHour = Math.min(dragStart, dragEnd);
            const endHour = Math.max(dragStart, dragEnd) + 1;
            setSelectedDate(dragDate);
            setEventTime(`${String(startHour).padStart(2, '0')}:00-${String(endHour).padStart(2, '0')}:00`);
            setShowModal(true);
        }
        setIsDragging(false);
    }

    const isHourSelected = (dateStr, hour) => {
        if (!isDragging || dateStr !== dragDate) return false;
        const start = Math.min(dragStart, dragEnd);
        const end = Math.max(dragStart, dragEnd);
        return hour >= start && hour <= end;
    }


    const handleCreateEvent = async (e) => {
        e.preventDefault();
        if (!eventTitle.trim()) {
            toast.error('Please enter an event title');
            return;
        }
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const response = await fetch(`${apiBaseUrl}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: eventTitle,
                    description: eventDescription,
                    time: eventTime,
                    date: selectedDate
                })
            })
            const data = await response.json();
            if (response.ok) {
                setEvents([...events, data.event]);
                setShowModal(false);
                setEventTitle('');
                setEventDescription('');
                setEventTime('');
                setSelectedDate('');
                toast.success('Event saved successfully!');
            } else {
                toast.error(data.message || 'Failed to save event');
            }
        } catch (error) {
            console.error('Create event error:', error);
            toast.error('Failed to save event');
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleclose = () => {
        setShowModal(false);
    }

    const handleDeleteEvent = async (eventId) => {
        try {
            const token = localStorage.getItem('token');
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const response = await fetch(`${apiBaseUrl}/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                setEvents(events.filter(event => event._id !== eventId));
                toast.success('Event deleted successfully!');
            } else {
                toast.error('Failed to delete event');
            }
        } catch (error) {
            console.error('Delete event error:', error);
            toast.error('Failed to delete event');
        }
    }

    // Get week days for the week view
    const getWeekDays = () => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(currentWeekStart);
            d.setDate(d.getDate() + i);
            days.push(d);
        }
        return days;
    }

    const nextWeek = () => {
        const d = new Date(currentWeekStart);
        d.setDate(d.getDate() + 7);
        setCurrentWeekStart(d);
    }

    const prevWeek = () => {
        const d = new Date(currentWeekStart);
        d.setDate(d.getDate() - 7);
        setCurrentWeekStart(d);
    }

    const formatDateStr = (date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }


    // ==================== YEAR VIEW ====================
    const renderYearView = () => {
        return (
            <div className="w-full">
                <div className='flex justify-between items-center w-full mb-6'>
                    <h1 className='text-3xl font-bold text-gray-800'>{currentYear}</h1>
                    <div className='flex gap-2'>
                        <button className='px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50 transition-all duration-150 shadow-sm' onClick={() => setCurrentYear(currentYear - 1)}>←</button>
                        <button className='px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50 transition-all duration-150 shadow-sm' onClick={() => setCurrentYear(currentYear + 1)}>→</button>
                    </div>
                </div>

                <div className='grid grid-cols-4 gap-4'>
                    {monthNames.map((monthName, monthIndex) => {
                        const daysInThisMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
                        const firstDay = new Date(currentYear, monthIndex, 1).getDay();
                        const emptyArr = Array.from({ length: firstDay });
                        const daysArr = Array.from({ length: daysInThisMonth }, (_, i) => i + 1);
                        const allDays = [...emptyArr, ...daysArr];

                        return (
                            <div
                                key={monthIndex}
                                className='bg-white border border-gray-200 rounded-xl p-3 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all duration-150 shadow-sm'
                                onClick={() => {
                                    setCurrentMonth(monthIndex);
                                    setCurrentView('month');
                                }}
                            >
                                <h3 className='text-indigo-500 font-bold text-sm mb-2 text-center'>{monthName}</h3>
                                <div className='grid grid-cols-7 gap-[2px]'>
                                    {weekDaysShort.map((d, i) => (
                                        <div key={i} className='text-center text-gray-400 text-[10px] font-bold'>{d}</div>
                                    ))}
                                    {allDays.map((day, i) => {
                                        const isToday = day === today.getDate() && monthIndex === today.getMonth() && currentYear === today.getFullYear();
                                        const dateStr = day ? `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
                                        const hasEvent = dateStr && events.some(e => e.date === dateStr);

                                        return (
                                            <div key={i} className={`text-center text-[10px] py-[1px] rounded-full
                                                ${isToday ? 'bg-indigo-500 text-white font-bold' : 'text-gray-600'}
                                                ${hasEvent && !isToday ? 'font-bold text-indigo-500 underline' : ''}
                                            `}>
                                                {day || ''}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }


    // ==================== MONTH VIEW ====================
    const renderMonthView = () => {
        return (
            <div className="w-full">
                {showDate && (
                    <div className='flex justify-between items-center w-full mb-4'>
                        <h1 className='text-3xl font-bold text-gray-800'>
                            {monthNames[currentMonth]} {currentYear}
                        </h1>
                        <div className='flex gap-2'>
                            <button className='px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50 transition-all duration-150 shadow-sm' onClick={prevMonth}>←</button>
                            <button className='px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50 transition-all duration-150 shadow-sm' onClick={nextMonth}>→</button>
                        </div>
                    </div>
                )}
                <div className='grid grid-cols-7 gap-1 mb-1'>
                    {weekDays.map((day, index) => (
                        <div key={index} className='text-center text-gray-400 font-semibold text-sm py-2'>
                            {day}
                        </div>
                    ))}
                </div>

                <div className='grid grid-cols-7 gap-1'>
                    {totalDays.map((day, index) => {
                        const isToday =
                            day === today.getDate() &&
                            currentMonth === today.getMonth() &&
                            currentYear === today.getFullYear();

                        return (
                            <div
                                key={index}
                                onClick={() => {
                                    if (day) {
                                        setSelectedDate(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
                                        setShowSidePanel(true);
                                        setShowDate(false);
                                    }
                                }}
                                className={`
                                    min-h-20 border rounded-xl p-2 flex flex-col items-start overflow-hidden transition-all duration-150
                                    ${isToday ? 'bg-indigo-50 border-indigo-300 shadow-sm' : 'bg-white border-gray-100'}
                                    ${day ? 'hover:border-indigo-200 hover:shadow-sm cursor-pointer' : 'opacity-30 pointer-events-none'}
                                `}
                            >
                                <span className={`font-bold text-sm w-7 h-7 flex items-center justify-center rounded-full
                                    ${isToday ? 'bg-indigo-500 text-white' : 'text-gray-700'}
                                `}>{day}</span>
                                {day && events.filter(event => event.date === `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
                                    .map((event, index) => (
                                        <div key={index} className="w-full mt-1 px-2 py-0.5 bg-indigo-100 rounded-md overflow-hidden">
                                            <p className="text-indigo-700 truncate text-xs font-medium">{event.title}</p>
                                        </div>
                                    ))}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }


    // ==================== WEEK VIEW ====================
    const renderWeekView = () => {
        const weekDaysArr = getWeekDays();
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        return (
            <div className="w-full" onMouseUp={handleMouseUp} onMouseLeave={() => { if (isDragging) handleMouseUp(); }}>
                <div className='flex justify-between items-center w-full mb-4'>
                    <h1 className='text-xl font-bold text-gray-800'>
                        {monthNames[currentWeekStart.getMonth()]} {currentWeekStart.getDate()} — {monthNames[weekEnd.getMonth()]} {weekEnd.getDate()}, {weekEnd.getFullYear()}
                    </h1>
                    <div className='flex gap-2'>
                        <button className='px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50 transition-all duration-150 shadow-sm' onClick={prevWeek}>←</button>
                        <button className='px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-50 transition-all duration-150 shadow-sm' onClick={nextWeek}>→</button>
                    </div>
                </div>

                {/* Day Headers */}
                <div className='grid grid-cols-[60px_repeat(7,1fr)] gap-0'>
                    <div className='p-1'></div>
                    {weekDaysArr.map((date, index) => {
                        const isToday = date.toDateString() === today.toDateString();
                        return (
                            <div key={index} className={`text-center p-2 border border-gray-200 ${isToday ? 'bg-indigo-50 border-indigo-300' : 'bg-gray-50'}`}>
                                <p className='font-semibold text-xs text-gray-400 uppercase tracking-wider'>{weekDays[index]}</p>
                                <p className={`text-xl font-bold mt-0.5 ${isToday ? 'text-white bg-indigo-500 rounded-full w-8 h-8 flex items-center justify-center mx-auto' : 'text-gray-700'}`}>{date.getDate()}</p>
                            </div>
                        )
                    })}
                </div>

                {/* 24 Hour Grid */}
                <div className='select-none'>
                    {hours.map((hour) => (
                        <div key={hour} className='grid grid-cols-[60px_repeat(7,1fr)] gap-0'>
                            {/* Hour Label */}
                            <div className='p-1 text-gray-400 text-xs font-medium text-right pr-2 border-r border-gray-200 h-10 flex items-center justify-end'>
                                {formatHour(hour)}
                            </div>
                            {/* Day Cells */}
                            {weekDaysArr.map((date, dayIndex) => {
                                const dateStr = formatDateStr(date);
                                const selected = isHourSelected(dateStr, hour);
                                const dayEvents = events.filter(e => e.date === dateStr);

                                // Check if any event covers this hour
                                let eventAtHour = null;
                                let isEventStart = false;
                                let eventSpan = 0;

                                dayEvents.forEach(e => {
                                    if (!e.time) return;
                                    if (e.time.includes('-')) {
                                        // Range format: "02:00-07:00"
                                        const [startStr, endStr] = e.time.split('-');
                                        const startH = parseInt(startStr.split(':')[0]);
                                        const endH = parseInt(endStr.split(':')[0]);
                                        if (hour >= startH && hour < endH) {
                                            eventAtHour = e;
                                            if (hour === startH) {
                                                isEventStart = true;
                                                eventSpan = endH - startH;
                                            }
                                        }
                                    } else {
                                        // Single time: "14:00"
                                        const startH = parseInt(e.time.split(':')[0]);
                                        if (hour === startH) {
                                            eventAtHour = e;
                                            isEventStart = true;
                                            eventSpan = 1;
                                        }
                                    }
                                });

                                return (
                                    <div
                                        key={dayIndex}
                                        className={`h-10 border-b border-r border-gray-100 cursor-pointer relative
                                            ${selected ? 'bg-indigo-100' : ''}
                                            ${eventAtHour && !selected ? 'bg-indigo-50' : ''}
                                            ${!eventAtHour && !selected ? 'bg-white hover:bg-gray-50' : ''}
                                        `}
                                        onMouseDown={() => handleMouseDown(dateStr, hour)}
                                        onMouseEnter={() => handleMouseEnter(dateStr, hour)}
                                    >
                                        {isEventStart && eventAtHour && (
                                            <div
                                                className='absolute left-0.5 right-0.5 top-0.5 bg-indigo-500 rounded-md px-2 flex items-start overflow-hidden z-10 cursor-pointer hover:bg-indigo-600 transition-colors duration-100'
                                                style={{ height: `${eventSpan * 40 - 4}px` }}
                                                onMouseDown={(e) => e.stopPropagation()}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedDate(eventAtHour.date);
                                                    setShowSidePanel(true);
                                                    setShowDate(false);
                                                }}
                                            >
                                                <div className='py-1'>
                                                    <p className='text-white text-xs font-bold truncate'>{eventAtHour.title}</p>
                                                    <p className='text-indigo-200 text-[10px]'>{eventAtHour.time}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>
        )
    }


    return (
        <div className='min-h-screen bg-gray-50'>
            <Header onLogout={logout} onAddEvent={() => setShowModal(true)} currentView={currentView} onViewChange={(view) => { setCurrentView(view); setShowSidePanel(false); setShowDate(true); }} />

            <div className='w-full flex justify-center mt-4 px-4 pb-8'>
                <div className='flex w-full max-w-[1280px] gap-4'>

                    {/* LEFT SIDE - Event Panel */}
                    {showSidePanel && selectedDate && (
                        <div className='w-72 min-w-[260px] bg-white border border-gray-200 rounded-2xl p-4 h-fit max-h-[calc(100vh-100px)] overflow-y-auto shadow-sm'>
                            <div className='flex justify-between items-center mb-4'>
                                <h2 className='text-base font-bold text-gray-800'>{selectedDate}</h2>
                                <span className='text-gray-400 hover:text-red-400 font-bold cursor-pointer text-lg transition-colors'
                                    onClick={() => { setShowSidePanel(false); setShowDate(true); }}>✕</span>
                            </div>

                            {events.filter(event => event.date === selectedDate).length > 0 ? (
                                <div className='flex flex-col gap-2'>
                                    {events.filter(event => event.date === selectedDate).map((event) => (
                                        <div key={event._id} className='bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex justify-between items-start'>
                                            <div>
                                                <p className='text-gray-800 font-semibold text-sm'>{event.title}</p>
                                                {event.description && <p className='text-gray-500 text-xs mt-0.5'>{event.description}</p>}
                                                {event.time && <p className='text-indigo-500 text-xs mt-1 font-medium'>🕐 {event.time}</p>}
                                            </div>
                                            <span className='text-gray-300 hover:text-red-400 cursor-pointer font-bold text-sm transition-colors'
                                                onClick={() => handleDeleteEvent(event._id)}>✕</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className='text-gray-400 text-center mt-8 text-sm'>No events for this date</p>
                            )}
                        </div>
                    )}

                    {/* RIGHT SIDE - Calendar View */}
                    <div className='flex-1 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm overflow-auto'>
                        {currentView === 'year' && renderYearView()}
                        {currentView === 'month' && renderMonthView()}
                        {currentView === 'week' && renderWeekView()}
                    </div>

                </div>
            </div>

            {/* Add Event Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-[480px] border border-gray-100">
                        <div className="flex justify-between items-center w-full mb-5">
                            <h2 className="text-xl font-bold text-gray-800">Add Event</h2>
                            <button className="text-gray-400 hover:text-red-400 font-bold text-xl transition-colors" onClick={handleclose}>✕</button>
                        </div>

                        <form onSubmit={handleCreateEvent}>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Date</label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200 text-gray-800"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Title</label>
                                <input
                                    type="text"
                                    value={eventTitle}
                                    onChange={(e) => setEventTitle(e.target.value)}
                                    placeholder="Event title..."
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200 text-gray-800"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Description</label>
                                <textarea
                                    value={eventDescription}
                                    onChange={(e) => setEventDescription(e.target.value)}
                                    placeholder="Optional..."
                                    rows={3}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200 text-gray-800 resize-none"
                                />
                            </div>
                            <div className="mb-5">
                                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Time</label>
                                <input
                                    type="time"
                                    value={eventTime}
                                    onChange={(e) => setEventTime(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200 text-gray-800"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-base rounded-xl active:scale-[0.98] transition-all duration-150 shadow-md shadow-indigo-100 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving Event...
                                    </>
                                ) : 'Save Event'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Calender