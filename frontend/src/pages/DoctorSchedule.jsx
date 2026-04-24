import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import GlobalLayout from '../layouts/GlobalLayout';

const DoctorSchedule = () => {
    const [loading, setLoading] = useState(true);
    const [scheduleItems, setScheduleItems] = useState([]);
    const [weekSummary, setWeekSummary] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [currentWeekStart, setCurrentWeekStart] = useState(() => {
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));
        return monday.toISOString().split('T')[0];
    });

    const doctorId = localStorage.getItem('doctor_id') || 'D1';

    useEffect(() => {
        fetchWeekSummary();
        fetchSchedule();

        const interval = setInterval(() => {
            fetchWeekSummary();
            fetchSchedule();
        }, 15000);

        return () => clearInterval(interval);
    }, [doctorId, currentWeekStart]);

    useEffect(() => {
        fetchSchedule();
    }, [selectedDate]);

    const fetchSchedule = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/doctor/schedule?doctor_id=${doctorId}&date=${selectedDate}`);
            if (res.data.success) {
                setScheduleItems(res.data.items);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchWeekSummary = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/doctor/schedule/week?doctor_id=${doctorId}&weekStart=${currentWeekStart}`);
            if (res.data.success) {
                setWeekSummary(res.data.days);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleComplete = async (id) => {
        if (!window.confirm("Mark appointment as completed?")) return;
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/doctor/appointments/complete`, { appointment_id: id, doctor_id: doctorId });
            fetchSchedule();
            fetchWeekSummary();
        } catch (error) {
            alert("Error completing appointment");
        }
    };

    const getRiskColor = (level) => {
        switch (level?.toLowerCase()) {
            case 'critical': return 'bg-red-100 text-red-700 border-red-200';
            case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'booked': return 'bg-blue-100 text-blue-700';
            case 'completed': return 'bg-slate-100 text-slate-600 line-through';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <GlobalLayout>
            <div className="space-y-8 pb-12">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Schedule</h1>
                    <p className="text-slate-500 font-medium">Weekly calendar and daily timeline view</p>
                </div>

                {/* Calendar + Timeline */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Weekly Calendar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-3xl border border-slate-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-slate-900">Weekly Schedule</h3>
                                <div className="flex gap-2">
                                    <button className="p-1 hover:bg-slate-100 rounded opacity-50 cursor-not-allowed"><ChevronLeft size={16} /></button>
                                    <button className="p-1 hover:bg-slate-100 rounded opacity-50 cursor-not-allowed"><ChevronRight size={16} /></button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {weekSummary.map((day) => {
                                    const date = new Date(day.date);
                                    const isSelected = day.date === selectedDate;
                                    const isToday = day.date === new Date().toISOString().split('T')[0];

                                    return (
                                        <div
                                            key={day.date}
                                            onClick={() => setSelectedDate(day.date)}
                                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${isSelected
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-slate-50 hover:border-blue-100 bg-white'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`text-xs font-bold uppercase w-8 text-center ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                                                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                                </div>
                                                <div>
                                                    <p className={`font-bold ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                                                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </p>
                                                    {isToday && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 rounded font-bold">Today</span>}
                                                </div>
                                            </div>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {day.count}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right: Timeline */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 min-h-[600px]">
                            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Clock size={18} className="text-blue-600" />
                                Timeline: {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </h3>

                            {scheduleItems.length === 0 ? (
                                <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-2xl">
                                    <p className="text-slate-400 font-bold">No appointments scheduled for this day.</p>
                                </div>
                            ) : (
                                <div className="space-y-4 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100">
                                    {scheduleItems.map((item, idx) => (
                                        <div key={idx} className="relative pl-12">
                                            <div className="absolute left-0 top-3 w-8 text-center text-xs font-bold text-slate-400">
                                                {new Date(item.slot_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                            </div>
                                            <div className="absolute left-[13px] top-4 w-2 h-2 rounded-full bg-blue-400 ring-4 ring-white"></div>

                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-bold text-slate-900">{item.patient.name}</h4>
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${getRiskColor(item.patient.risk_level)}`}>
                                                                {item.patient.risk_level}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-500">{item.patient.gender}, {item.patient.age} years</p>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getStatusColor(item.status)}`}>
                                                        {item.status}
                                                    </span>
                                                </div>

                                                {/* Quick Actions */}
                                                {item.status === 'booked' && (
                                                    <div className="mt-3">
                                                        <button onClick={() => handleComplete(item.appointment_id)} className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1">
                                                            <CheckCircle size={14} /> Mark Completed
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </GlobalLayout>
    );
};

export default DoctorSchedule;
