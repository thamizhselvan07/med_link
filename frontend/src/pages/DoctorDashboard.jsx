import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Calendar, Clock, AlertCircle, CheckCircle, Activity,
    ChevronRight, User, FileText
} from 'lucide-react';
import GlobalLayout from '../layouts/GlobalLayout';
import { useAuth } from '../contexts/AuthContext';

const DoctorDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        pending_requests: 0,
        today_appointments: 0,
        completed_today: 0,
        critical_patients: 0
    });
    const [nextAppointment, setNextAppointment] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);

    const doctorId = localStorage.getItem('doctor_id') || 'D1';

    useEffect(() => {
        fetchDashboard();
        const interval = setInterval(fetchDashboard, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchDashboard = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/doctor/dashboard?doctor_id=${doctorId}`);
            if (res.data.success) {
                setStats(res.data.stats);
                setNextAppointment(res.data.next_appointment);
                setRecentActivity(res.data.recent_activity);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, link }) => (
        <div className={`bg-white p-6 rounded-3xl border border-slate-100 hover:shadow-lg transition-all cursor-pointer group ${link ? 'hover:border-blue-200' : ''}`}
            onClick={() => link && (window.location.href = link)}>
            <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
                    <Icon size={24} />
                </div>
                {link && <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />}
            </div>
            <h3 className="text-4xl font-black text-slate-900 mb-1">{value}</h3>
            <p className="text-slate-500 font-medium text-sm">{title}</p>
        </div>
    );

    return (
        <GlobalLayout>
            <div className="space-y-8 pb-12">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
                    <p className="text-slate-500 font-medium">Welcome back, {user?.name || 'Doctor'}</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title="Pending Requests"
                                value={stats.pending_requests}
                                icon={User}
                                color="bg-amber-50 text-amber-600"
                                link="/doctor/appointments"
                            />
                            <StatCard
                                title="Today's Appointments"
                                value={stats.today_appointments}
                                icon={Calendar}
                                color="bg-blue-50 text-blue-600"
                                link="/doctor/schedule"
                            />
                            <StatCard
                                title="Completed Today"
                                value={stats.completed_today}
                                icon={CheckCircle}
                                color="bg-emerald-50 text-emerald-600"
                            />
                            <StatCard
                                title="Critical Patients"
                                value={stats.critical_patients}
                                icon={AlertCircle}
                                color="bg-red-50 text-red-600"
                                link="/triage-queue"
                            />
                        </div>

                        {/* Next Appointment & Recent Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Next Appointment */}
                            <div className="bg-white p-6 rounded-3xl border border-slate-100">
                                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <Clock size={18} className="text-blue-600" />
                                    Next Confirmed Appointment
                                </h3>
                                {nextAppointment ? (
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h4 className="text-xl font-bold text-slate-900 mb-1">{nextAppointment.patient_name}</h4>
                                                <p className="text-sm text-slate-600">Patient ID: {nextAppointment.patient_id}</p>
                                            </div>
                                            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold">
                                                {nextAppointment.time_str}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Calendar size={14} />
                                            <span>{new Date(nextAppointment.slot_time).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
                                        <p className="text-slate-400 font-medium">No upcoming appointments</p>
                                    </div>
                                )}
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white p-6 rounded-3xl border border-slate-100">
                                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <Activity size={18} className="text-emerald-600" />
                                    Recent Activity
                                </h3>
                                {recentActivity.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentActivity.map((activity, idx) => (
                                            <div key={idx} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                                                <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'completed' ? 'bg-emerald-400' : 'bg-blue-400'}`}></div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-slate-700">{activity.text}</p>
                                                    <p className="text-xs text-slate-400 mt-0.5">
                                                        {new Date(activity.time).toLocaleString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
                                        <p className="text-slate-400 font-medium">No recent activity</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-3xl border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-6">Quick Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <a href="/triage-queue" className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all flex items-center gap-3 group">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <Activity size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">Triage Queue</p>
                                        <p className="text-xs text-slate-500">View patients</p>
                                    </div>
                                </a>
                                <a href="/doctor/appointments" className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-amber-200 hover:shadow-md transition-all flex items-center gap-3 group">
                                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">Appointments</p>
                                        <p className="text-xs text-slate-500">Manage requests</p>
                                    </div>
                                </a>
                                <a href="/doctor/schedule" className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-purple-200 hover:shadow-md transition-all flex items-center gap-3 group">
                                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">My Schedule</p>
                                        <p className="text-xs text-slate-500">View calendar</p>
                                    </div>
                                </a>
                                <a href="/doctor/reports" className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all flex items-center gap-3 group">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">Reports</p>
                                        <p className="text-xs text-slate-500">View reports</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </GlobalLayout>
    );
};

export default DoctorDashboard;
