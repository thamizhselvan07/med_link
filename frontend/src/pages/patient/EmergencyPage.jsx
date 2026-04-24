import React, { useState } from 'react';
import {
    AlertCircle, Phone, MapPin,
    Share2, Activity, ShieldAlert,
    ChevronRight, Loader2, Zap,
    Truck, UserPlus, Heart, CheckCircle2, XCircle
} from 'lucide-react';
import PatientLayout from '../../layouts/PatientLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const EmergencyPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isTriggered, setIsTriggered] = useState(false);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [sosSteps, setSosSteps] = useState([
        { step: 'MedHub+ Tracking Location', done: false },
        { step: 'Caretaker Priority Alert Sent', done: false },
        { step: 'Syncing Life-critical Vitals Data', done: false },
        { step: 'Ambulance Unit Dispatching', done: false }
    ]);

    const showNotification = (type, title, message) => {
        setNotification({ type, title, message });
        setTimeout(() => setNotification(null), 5000);
    };

    const handleCallNurse = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/emergency/call-nurse`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patient_id: user?.id || 1, // Fallback for dev
                    hospital_clinic_id: 'H001',
                    message: 'Patient requested nurse via Emergency Page'
                })
            });
            const data = await response.json();

            if (data.success) {
                showNotification('success', 'Nurse Notified', data.message);
            } else {
                showNotification('error', 'Request Failed', data.message);
            }
        } catch (error) {
            showNotification('error', 'Network Error', 'Failed to connect to emergency services');
        } finally {
            setLoading(false);
        }
    };

    const handleCallAmbulance = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/emergency/call-ambulance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patient_id: user?.id || 1,
                    hospital_clinic_id: 'H001'
                })
            });
            const data = await response.json();

            if (data.success) {
                showNotification('success', 'Ambulance Dispatched', data.message);
            } else {
                showNotification('error', 'Request Failed', data.message);
            }
        } catch (error) {
            showNotification('error', 'Network Error', 'Failed to connect to ambulance services');
        } finally {
            setLoading(false);
        }
    };

    const handleBroadcastSOS = async () => {
        setIsTriggered(true);

        // SImulate step progress
        const updatedSteps = [...sosSteps];
        updatedSteps[0].done = true;
        setSosSteps([...updatedSteps]);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/emergency/broadcast-sos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patient_id: user?.id || 1,
                    hospital_clinic_id: 'H001',
                    alert_level: 'critical'
                })
            });
            const data = await response.json();

            if (data.success) {
                // Animate steps
                setTimeout(() => {
                    updatedSteps[1].done = true;
                    setSosSteps([...updatedSteps]);
                }, 1000);
                setTimeout(() => {
                    updatedSteps[2].done = true;
                    setSosSteps([...updatedSteps]);
                }, 2000);
                setTimeout(() => {
                    updatedSteps[3].done = true;
                    setSosSteps([...updatedSteps]);
                }, 3000);
            } else {
                showNotification('error', 'SOS Failed', data.message);
                setIsTriggered(false);
            }
        } catch (error) {
            showNotification('error', 'Network Error', 'Failed to broadcast SOS');
            setIsTriggered(false);
        }
    };

    const handleTriageMode = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/emergency/triage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patient_id: user?.id || 1
                })
            });
            const data = await response.json();

            if (data.success) {
                // Navigate to result or show modal
                // For now, let's show a success notification with details
                showNotification('success', `Triage Complete: ${data.risk_level}`,
                    `Score: ${data.urgency_score}. Recommended: ${data.recommended_department}`);

                // Optional: Store in local storage to show on dashboard or redirect
            } else {
                showNotification('error', 'Triage Failed', data.message);
            }
        } catch (error) {
            showNotification('error', 'Network Error', 'Failed to run triage analysis');
        } finally {
            setLoading(false);
        }
    };

    const actions = [
        {
            title: 'Call Nurse',
            desc: 'Alert your assigned caretaker immediately',
            icon: UserPlus,
            color: 'bg-blue-600',
            shadow: 'shadow-blue-200',
            handler: handleCallNurse
        },
        {
            title: 'Call Ambulance',
            desc: 'Dispatch nearest medical vehicle',
            icon: Truck,
            color: 'bg-red-600',
            shadow: 'shadow-red-200',
            handler: handleCallAmbulance
        },
        {
            title: 'Broadcast SOS',
            desc: 'Alert hospital and emergency contacts',
            icon: ShieldAlert,
            color: 'bg-slate-900',
            shadow: 'shadow-slate-200',
            handler: handleBroadcastSOS
        },
        {
            title: 'Triage Mode',
            desc: 'Start quick AI diagnostic flow',
            icon: Heart,
            color: 'bg-indigo-600',
            shadow: 'shadow-indigo-200',
            handler: handleTriageMode
        }
    ];

    return (
        <PatientLayout>
            <div className="min-h-[80vh] py-12 animate-slide-up relative">
                {/* NOTIFICATION TOAST */}
                {notification && (
                    <div className="fixed top-24 right-6 z-50 max-w-sm w-full animate-slide-in-right">
                        <div className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-4 ${notification.type === 'success'
                                ? 'bg-white border-emerald-100'
                                : 'bg-white border-red-100'
                            }`}>
                            <div className={`p-2 rounded-xl shrink-0 ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                }`}>
                                {notification.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                            </div>
                            <div>
                                <h4 className={`font-black text-sm uppercase tracking-wider mb-1 ${notification.type === 'success' ? 'text-emerald-900' : 'text-red-900'
                                    }`}>
                                    {notification.title}
                                </h4>
                                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                    {notification.message}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* LOADING OVERLAY */}
                {loading && (
                    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-40 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4 border border-slate-100">
                            <Loader2 className="animate-spin text-blue-600" size={40} />
                            <p className="font-black text-slate-900 uppercase tracking-widest text-xs">Processing Request...</p>
                        </div>
                    </div>
                )}

                {!isTriggered ? (
                    <div className="max-w-6xl mx-auto space-y-16">
                        <div className="text-center space-y-4">
                            <div className="bg-red-50 text-red-600 w-fit mx-auto px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border border-red-100 mb-4 cursor-default">
                                <Zap size={14} className="animate-pulse" /> Critical Response Unit
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">Emergency Assistance</h1>
                            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">One-tap access to life-saving medical services. Use only in actual emergencies.</p>
                        </div>

                        {/* GRID OF ACTIONS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {actions.map((action, i) => (
                                <button
                                    key={i}
                                    onClick={action.handler}
                                    disabled={loading}
                                    className="bg-white p-10 rounded-[50px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all flex flex-col items-center text-center group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className={`w-20 h-20 ${action.color} text-white rounded-[30px] flex items-center justify-center mb-6 shadow-2xl ${action.shadow} group-hover:scale-110 transition-transform duration-500`}>
                                        <action.icon size={36} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">{action.title}</h3>
                                    <p className="text-sm font-medium text-slate-400">{action.desc}</p>
                                </button>
                            ))}
                        </div>

                        {/* MAP PLACEHOLDER */}
                        <div className="bg-white rounded-[60px] border border-slate-100 shadow-xl overflow-hidden relative min-h-[400px]">
                            <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
                                <MapPin size={100} className="text-blue-100 animate-bounce" />
                                <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent"></div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-10 flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-slate-900">Nearest MedHub+ Centers</h3>
                                    <p className="text-slate-500 font-bold flex items-center gap-2 uppercase tracking-widest text-[10px]">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> Tracking your location...
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="bg-white/90 backdrop-blur p-6 rounded-[35px] border border-slate-100 shadow-lg min-w-[240px]">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">City General Branch</p>
                                        <p className="font-black text-slate-900">1.2 KM Away</p>
                                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tight mt-2 flex items-center gap-1 cursor-pointer hover:underline">
                                            Navigate Now <ChevronRight size={10} />
                                        </p>
                                    </div>
                                    <div className="bg-white/90 backdrop-blur p-6 rounded-[35px] border border-slate-100 shadow-lg min-w-[240px]">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sunrise Trauma Center</p>
                                        <p className="font-black text-slate-900">3.8 KM Away</p>
                                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tight mt-2 flex items-center gap-1 cursor-pointer hover:underline">
                                            Navigate Now <ChevronRight size={10} />
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto bg-slate-900 text-white p-14 rounded-[60px] shadow-2xl relative overflow-hidden text-center">
                        <div className="absolute inset-0 bg-red-600/10 animate-pulse"></div>
                        <div className="relative z-10 space-y-12">
                            <div className="flex flex-col items-center gap-6">
                                <div className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center animate-ping absolute opacity-30"></div>
                                <div className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center relative shadow-[0_0_80px_rgba(220,38,38,0.5)]">
                                    <Loader2 size={50} className="animate-spin" />
                                </div>
                                <h2 className="text-4xl font-black tracking-tight">SOS Request Dispatched</h2>
                                <p className="text-blue-100 font-medium max-w-sm mx-auto">Hospital protocols have been activated. Emergency responders are being briefed on your clinical profile.</p>
                            </div>

                            <div className="space-y-4">
                                {sosSteps.map((step, i) => (
                                    <div key={i} className={`flex items-center gap-4 p-5 rounded-3xl border transition-all ${step.done ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/5 opacity-30'}`}>
                                        <div className={`p-2 rounded-xl ${step.done ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/40'}`}>
                                            <CheckCircle2 size={16} />
                                        </div>
                                        <span className="font-black text-sm uppercase tracking-widest">{step.step}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setIsTriggered(false)}
                                className="mt-8 text-sm font-bold text-slate-400 hover:text-white transition-colors"
                            >
                                Cancel / Return to Dashboard
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </PatientLayout>
    );
};

export default EmergencyPage;
