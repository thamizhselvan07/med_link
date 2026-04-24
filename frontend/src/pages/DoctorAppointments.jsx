import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Calendar, Clock, User, CheckCircle, XCircle,
    Activity, MapPin, MoreVertical, FileText
} from 'lucide-react';
import GlobalLayout from '../layouts/GlobalLayout';

const DoctorAppointments = () => {
    const [loading, setLoading] = useState(true);
    const [listTab, setListTab] = useState('requests'); // 'requests', 'today', 'upcoming', 'completed'

    // Data
    const [buckets, setBuckets] = useState({ pending: [], today: [], upcoming: [], completed: [] });

    const doctorId = localStorage.getItem('doctor_id') || 'D1';

    useEffect(() => {
        fetchBuckets();

        const interval = setInterval(() => {
            fetchBuckets();
        }, 15000);

        return () => clearInterval(interval);
    }, [doctorId]);

    const fetchBuckets = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/doctor/appointments?doctor_id=${doctorId}`);
            if (res.data.success) {
                setBuckets({
                    pending: res.data.pending,
                    today: res.data.today,
                    upcoming: res.data.upcoming,
                    completed: res.data.completed || []
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/doctor/requests/accept`, { appointment_id: id });
            refreshAll();
            alert("Appointment Confirmed");
        } catch (error) {
            alert("Error confirming appointment");
        }
    };

    const handleDecline = async (id) => {
        if (!window.confirm("Decline this appointment request?")) return;
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/doctor/requests/reject`, { appointment_id: id });
            refreshAll();
        } catch (error) {
            alert("Error declining appointment");
        }
    };

    const handleComplete = async (id, doctorId) => {
        if (!window.confirm("Mark appointment as completed?")) return;
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/doctor/appointments/complete`, { appointment_id: id, doctor_id: doctorId });
            refreshAll();
        } catch (error) {
            alert("Error completing appointment");
        }
    };

    const refreshAll = () => {
        fetchBuckets();
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

    // Components
    const StatsCard = ({ title, count, icon: Icon, color }) => (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-3xl font-black text-slate-800">{count}</h3>
            </div>
            <div className={`p-4 rounded-xl ${color}`}>
                <Icon size={24} />
            </div>
        </div>
    );

    const AppointmentCard = ({ appt, showActions = true }) => (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${appt.patient.gender === 'Male' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                        {appt.patient.name.charAt(0)}
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900">{appt.patient.name}</h4>
                        <p className="text-xs text-slate-400 font-semibold">{appt.patient.patient_id}</p>
                    </div>
                </div>
                <span className={`px-2 py-1 rounded-lg text-[10px] uppercase font-black tracking-wide ${getRiskColor(appt.patient.risk_level)}`}>
                    {appt.patient.risk_level}
                </span>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <Clock size={14} className="text-slate-400" />
                    {new Date(appt.slot_time).toLocaleString()}
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <MapPin size={14} className="text-slate-400" />
                    {appt.branch || 'Main Branch'}
                </div>
            </div>

            {showActions && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
                    {appt.status === 'pending' && (
                        <>
                            <button onClick={() => handleAccept(appt.appointment_id)} className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-blue-700">Accept</button>
                            <button onClick={() => handleDecline(appt.appointment_id)} className="flex-1 bg-white border border-slate-200 text-slate-600 py-2 rounded-xl text-xs font-bold hover:bg-slate-50">Decline</button>
                        </>
                    )}
                    {appt.status === 'booked' && (
                        <button onClick={() => handleComplete(appt.appointment_id, appt.doctor_id)} className="flex-1 bg-emerald-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 flex items-center justify-center gap-2">
                            <CheckCircle size={14} /> Mark Completed
                        </button>
                    )}
                    {appt.status === 'completed' && (
                        <div className="w-full text-center text-xs font-bold text-slate-400 py-2">
                            Completed on {new Date(appt.completed_at || Date.now()).toLocaleDateString()}
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <GlobalLayout>
            <div className="space-y-8 pb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Patient Appointments</h1>
                        <p className="text-slate-500 font-medium">Manage requests, schedule, and patient visits</p>
                    </div>
                </div>

                {/* Summaries */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatsCard title="Requests" count={buckets.pending.length} icon={User} color="bg-amber-50 text-amber-600" />
                    <StatsCard title="Today" count={buckets.today.length} icon={Calendar} color="bg-blue-50 text-blue-600" />
                    <StatsCard title="Upcoming" count={buckets.upcoming.length} icon={Clock} color="bg-purple-50 text-purple-600" />
                    <StatsCard title="Completed" count={buckets.completed.length} icon={CheckCircle} color="bg-emerald-50 text-emerald-600" />
                </div>

                {/* Content Area - List View Only */}
                <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden min-h-[500px]">
                    <div className="border-b border-slate-100 flex overflow-x-auto">
                        {['requests', 'today', 'upcoming', 'completed'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setListTab(tab)}
                                className={`px-8 py-5 text-sm font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${listTab === tab
                                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                                    : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                {tab} <span className="ml-2 bg-slate-200 px-2 py-0.5 rounded-full text-[10px] text-slate-600">{
                                    tab === 'requests' ? buckets.pending.length : buckets[tab].length
                                }</span>
                            </button>
                        ))}
                    </div>

                    <div className="p-8">
                        {buckets[listTab === 'requests' ? 'pending' : listTab].length === 0 ? (
                            <div className="text-center py-20">
                                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                    <FileText size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">No appointments found</h3>
                                <p className="text-slate-400">There are no appointments in this category.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {buckets[listTab === 'requests' ? 'pending' : listTab].map(appt => (
                                    <AppointmentCard key={appt.appointment_id} appt={appt} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </GlobalLayout>
    );
};

export default DoctorAppointments;
