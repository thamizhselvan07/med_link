import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users, Activity, Clock, AlertTriangle,
    Heart, Thermometer, Droplets, User,
    Calendar, CheckCircle, XCircle, RefreshCw
} from 'lucide-react';
import GlobalLayout from '../layouts/GlobalLayout';
import { useLanguage } from '../contexts/LanguageContext';

const TriageQueuePage = () => {
    const { t } = useLanguage();
    const [queue, setQueue] = useState({ critical: [], medium: [], low: [], all: [] });
    const [doctors, setDoctors] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);

    // Doctor Portal Logic
    const role = localStorage.getItem('role') || 'nurse';

    useEffect(() => {
        fetchQueue();
        if (role !== 'doctor') fetchDoctors();

        const interval = setInterval(() => {
            fetchQueue();
            if (role !== 'doctor') fetchDoctors();
        }, 10000);
        return () => clearInterval(interval);
    }, [role]);

    const fetchQueue = async () => {
        try {
            const res = await axios.get('http://localhost:5000/triage/queue');
            setQueue(res.data);
        } catch (error) {
            console.error('Error fetching queue:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDoctors = async () => {
        try {
            const res = await axios.get('http://localhost:5000/booking/doctors');
            setDoctors(res.data);
        } catch (error) {
            console.error('Error fetching doctors:', error);
        }
    };

    const handleBookDoctor = async () => {
        if (!selectedPatient || !selectedDoctor) {
            alert('Please select both patient and doctor');
            return;
        }

        setBooking(true);
        try {
            const res = await axios.post('http://localhost:5000/booking/book', {
                patient_id: selectedPatient.patient_id,
                doctor_id: selectedDoctor.id
            });

            alert(`✅ ${res.data.message}\n\nPatient: ${res.data.booking.patient.name}\nDoctor: ${res.data.booking.doctor.name}\nDepartment: ${res.data.booking.doctor.department}`);

            fetchQueue();
            fetchDoctors();
            setSelectedPatient(null);
            setSelectedDoctor(null);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Booking failed';
            alert(`❌ ${errorMsg}`);
        } finally {
            setBooking(false);
        }
    };

    const handleAssignToMe = async (patient) => {
        const doctorId = localStorage.getItem('doctor_id') || user?.name || 'D1';

        try {
            const res = await axios.post('http://localhost:5000/api/triage/assign', {
                patient_id: patient.id || patient.patient_id,
                doctor_id: doctorId
            });

            if (res.data.success) {
                alert(`✅ Patient ${patient.name} assigned to you successfully!`);
                fetchQueue();
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Assignment failed';
            alert(`❌ ${errorMsg}`);
        }
    };


    const getRiskColor = (riskLevel) => {
        switch (riskLevel?.toLowerCase()) {
            case 'critical': return 'bg-red-600 text-white border-red-700';
            case 'medium': return 'bg-orange-500 text-white border-orange-600';
            case 'low': return 'bg-emerald-600 text-white border-emerald-700';
            default: return 'bg-slate-600 text-white border-slate-700';
        }
    };

    const getRiskBadge = (riskLevel) => {
        switch (riskLevel?.toLowerCase()) {
            case 'critical': return 'bg-red-100 text-red-700 border-red-200';
            case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'low': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const PatientCard = ({ patient, category }) => (
        <div
            onClick={() => role !== 'doctor' && setSelectedPatient(patient)}
            className={`p-6 rounded-3xl border-2 transition-all cursor-pointer hover:shadow-xl ${selectedPatient?.patient_id === patient.patient_id
                ? 'ring-4 ring-blue-500 border-blue-500 shadow-2xl scale-105'
                : 'border-slate-200 hover:border-blue-300'
                } ${role === 'doctor' ? 'cursor-default hover:border-slate-200 hover:shadow-none' : ''}`}
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-black text-slate-900">{patient.name}</h3>
                    <p className="text-sm text-slate-500 font-bold">{patient.patient_id}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${getRiskBadge(patient.risk_level)}`}>
                    {patient.risk_level}
                </span>
            </div>
            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                    <User size={16} className="text-slate-400" />
                    <span className="font-bold text-slate-600">{patient.age} yrs, {patient.gender}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <Activity size={16} className="text-slate-400" />
                    <span className="font-bold text-slate-600">{patient.symptoms}</span>
                </div>
            </div>
            {/* Same Vitals UI as before */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <div className="bg-red-50 p-3 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                        <Heart size={14} className="text-red-600" />
                        <span className="text-xs font-black text-slate-400 uppercase">HR</span>
                    </div>
                    <p className="text-lg font-black text-red-600">{patient.heart_rate}</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                        <Thermometer size={14} className="text-amber-600" />
                        <span className="text-xs font-black text-slate-400 uppercase">Temp</span>
                    </div>
                    <p className="text-lg font-black text-amber-600">{patient.temperature}°F</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                        <Droplets size={14} className="text-blue-600" />
                        <span className="text-xs font-black text-slate-400 uppercase">SpO2</span>
                    </div>
                    <p className="text-lg font-black text-blue-600">{patient.spo2}%</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                        <Activity size={14} className="text-purple-600" />
                        <span className="text-xs font-black text-slate-400 uppercase">BP</span>
                    </div>
                    <p className="text-lg font-black text-purple-600">{patient.bp_systolic}/{patient.bp_diastolic}</p>
                </div>
            </div>
            <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-400 uppercase">{t('department')}</span>
                    <span className="text-sm font-black text-blue-600">{patient.department}</span>
                </div>
                {patient.booking_status === 'Booked' && (
                    <div className="mt-2 flex items-center gap-2 text-emerald-600">
                        <CheckCircle size={16} />
                        <span className="text-xs font-bold">Assigned to {patient.doctor_assigned}</span>
                    </div>
                )}
                {role === 'doctor' && patient.status === 'waiting' && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAssignToMe(patient);
                        }}
                        className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <User size={16} />
                        Assign To Me
                    </button>
                )}
            </div>
        </div>
    );

    if (loading) {
        return (
            <GlobalLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </GlobalLayout>
        );
    }

    return (
        <GlobalLayout>
            <div className="space-y-8 font-sans">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t('triage_queue')}</h1>
                        <p className="text-slate-500 font-medium mt-1">Real-time patient priority queue {role !== 'doctor' && 'with doctor booking'}</p>
                    </div>
                    <button
                        onClick={() => { fetchQueue(); if (role !== 'doctor') fetchDoctors(); }}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all"
                    >
                        <RefreshCw size={18} /> Refresh
                    </button>
                </div>

                {/* Queue Stats Rows */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Users size={24} /></div>
                            <div>
                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Total Queue</p>
                                <p className="text-3xl font-black text-slate-900">{queue.all?.length || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="bg-red-50 p-3 rounded-xl text-red-600"><AlertTriangle size={24} /></div>
                            <div>
                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Critical</p>
                                <p className="text-3xl font-black text-red-600">{queue.critical?.length || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="bg-orange-50 p-3 rounded-xl text-orange-600"><Activity size={24} /></div>
                            <div>
                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Medium</p>
                                <p className="text-3xl font-black text-orange-600">{queue.medium?.length || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600"><CheckCircle size={24} /></div>
                            <div>
                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Low</p>
                                <p className="text-3xl font-black text-emerald-600">{queue.low?.length || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className={`grid grid-cols-1 ${role === 'doctor' ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-8 items-start`}>
                    {/* Patient Queue List */}
                    <div className={`${role === 'doctor' ? 'lg:col-span-2' : 'lg:col-span-2'} space-y-6`}>
                        {/* Critical */}
                        {queue.critical?.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-black text-red-600 mb-4 flex items-center gap-2"><AlertTriangle size={24} /> Critical Priority</h2>
                                <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4`}>
                                    {queue.critical.map(patient => <PatientCard key={patient.patient_id} patient={patient} category="critical" />)}
                                </div>
                            </div>
                        )}
                        {/* Medium */}
                        {queue.medium?.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-black text-orange-600 mb-4 flex items-center gap-2"><Activity size={24} /> Medium Priority</h2>
                                <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4`}>
                                    {queue.medium.map(patient => <PatientCard key={patient.patient_id} patient={patient} category="medium" />)}
                                </div>
                            </div>
                        )}
                        {/* Low */}
                        {queue.low?.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-black text-emerald-600 mb-4 flex items-center gap-2"><CheckCircle size={24} /> Low Priority</h2>
                                <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4`}>
                                    {queue.low.map(patient => <PatientCard key={patient.patient_id} patient={patient} category="low" />)}
                                </div>
                            </div>
                        )}
                        {queue.all?.length === 0 && (
                            <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
                                <Users size={48} className="mx-auto text-slate-300 mb-4" />
                                <p className="text-xl font-black text-slate-400">No patients in queue</p>
                            </div>
                        )}
                    </div>

                    {/* Right Panel: HIDDEN for Doctors */}
                    {role !== 'doctor' && (
                        <div className="lg:col-span-1">
                            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm lg:sticky lg:top-6 space-y-6">
                                <h2 className="text-2xl font-black text-slate-900 mb-6">Book Doctor</h2>

                                {selectedPatient ? (
                                    <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                        <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Selected Patient</p>
                                        <p className="text-lg font-black text-slate-900">{selectedPatient.name}</p>
                                        <p className="text-sm text-slate-600 font-bold">{selectedPatient.patient_id}</p>
                                        <p className="text-xs text-blue-600 font-bold mt-2">{selectedPatient.department}</p>
                                    </div>
                                ) : (
                                    <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                        <p className="text-sm font-bold text-slate-400">Select a patient from the queue</p>
                                    </div>
                                )}

                                <div className="space-y-3 mb-6">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Available Doctors</p>
                                    {doctors.filter(d => d.available).map(doctor => (
                                        <div
                                            key={doctor.id}
                                            onClick={() => setSelectedDoctor(doctor)}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedDoctor?.id === doctor.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-slate-100 hover:border-blue-200'
                                                }`}
                                        >
                                            <p className="font-black text-slate-900">{doctor.name}</p>
                                            <p className="text-xs text-slate-500 font-bold">{doctor.department}</p>
                                            <p className="text-xs text-emerald-600 font-bold mt-1">
                                                {doctor.current_patients}/{doctor.max_patients} patients
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={handleBookDoctor}
                                    disabled={!selectedPatient || !selectedDoctor || booking}
                                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {booking ? (
                                        <>
                                            <RefreshCw size={18} className="animate-spin" /> Booking...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={18} /> Confirm Booking
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </GlobalLayout>
    );
};

export default TriageQueuePage;
