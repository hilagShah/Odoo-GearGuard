import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import { format, parseISO, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from 'date-fns';

const CalendarPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/requests');
                // Filter only scheduled requests
                setRequests(res.data.filter(r => r.scheduledDate));
            } catch (error) {
                console.error("Failed to fetch requests", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Calendar Navigation
    const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
    const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
    const handleToday = () => setCurrentDate(new Date());

    const start = startOfWeek(currentDate);
    const end = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start, end });

    if (loading) return <div className="p-8 text-white">Loading calendar...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Maintenance Calendar</h1>
                    <p className="text-gray-400">Scheduled maintenance tasks</p>
                </div>
                <div className="flex items-center gap-4 bg-gray-800 p-2 rounded-lg border border-gray-700">
                    <button onClick={handlePrevWeek} className="p-1 hover:bg-gray-700 rounded text-gray-300">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-white font-medium min-w-[140px] text-center">
                        {format(start, 'MMM d')} - {format(end, 'MMM d, yyyy')}
                    </span>
                    <button onClick={handleNextWeek} className="p-1 hover:bg-gray-700 rounded text-gray-300">
                        <ChevronRight size={20} />
                    </button>
                    <button onClick={handleToday} className="text-xs bg-blue-600 text-white px-3 py-1 rounded ml-2 hover:bg-blue-700">
                        Today
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-4">
                {days.map((day) => {
                    const dayRequests = requests.filter(r =>
                        r.scheduledDate && isSameDay(parseISO(r.scheduledDate), day)
                    );

                    const isToday = isSameDay(day, new Date());

                    return (
                        <div key={day.toString()} className={`bg-gray-800 rounded-lg p-3 min-h-[200px] border ${isToday ? 'border-blue-500' : 'border-gray-700'}`}>
                            <div className={`text-center mb-3 pb-2 border-b border-gray-700 ${isToday ? 'text-blue-400 font-bold' : 'text-gray-400'}`}>
                                <div>{format(day, 'EEE')}</div>
                                <div className="text-xl">{format(day, 'd')}</div>
                            </div>

                            <div className="space-y-2">
                                {dayRequests.length > 0 ? (
                                    dayRequests.map(req => (
                                        <div key={req.id} className="bg-blue-600/20 text-blue-200 text-xs p-2 rounded border border-blue-500/30">
                                            <div className="font-semibold truncate" title={req.subject}>{req.subject}</div>
                                            <div className="flex items-center gap-1 mt-1 text-blue-300/70">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                                <span className="truncate">{req.Equipment?.name || 'Item'}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-gray-600 text-xs text-center py-4 opacity-50"></div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-bold text-white mb-4">Upcoming Schedule</h2>
                <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                    <table className="w-full text-left">
                        <thead className="bg-gray-900/50 text-gray-400 text-sm">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Subject</th>
                                <th className="p-4">Equipment</th>
                                <th className="p-4">Technician</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-300">
                            {requests.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate)).map(req => (
                                <tr key={req.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                                    <td className="p-4 flex items-center gap-2">
                                        <CalendarIcon size={16} className="text-gray-500" />
                                        {format(parseISO(req.scheduledDate), 'MMM d, yyyy')}
                                    </td>
                                    <td className="p-4 font-medium">{req.subject}</td>
                                    <td className="p-4 text-sm text-gray-400">{req.Equipment?.name || 'Unknown'}</td>
                                    <td className="p-4 text-sm">
                                        <span className="bg-gray-700/50 px-2 py-1 rounded">
                                            {req.Technician?.name || 'Unassigned'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {requests.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-6 text-center text-gray-500">No scheduled tasks found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;
