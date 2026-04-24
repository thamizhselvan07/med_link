import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { usePatient } from '../../contexts/PatientContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
    Activity, Clock, User, LogOut, CheckCircle,
    Bell, AlertCircle, Volume2
} from 'lucide-react';

const WaitingScreen = () => {
    const { patientData, analysisResult } = usePatient();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [queue, setQueue] = useState([]);

    useEffect(() => {
        const fetchQueue = async () => {
            try {
                const res = await axios.get('/patients/queue');
                setQueue(res.data);
            } catch (error) {
                console.error("Queue fetch error", error);
            }
        };

        fetchQueue();
        const interval = setInterval(fetchQueue, 10000);
        return () => clearInterval(interval);
    }, []);

    // Derive numeric patient id from backend token (VT-XXXX) if available
    const backendId = analysisResult?.db_id
        || (analysisResult?.patient_id && parseInt(String(analysisResult.patient_id).split('-')[1]))
        || (patientData.patient_id && String(patientData.patient_id).startsWith('VT-')
            ? parseInt(String(patientData.patient_id).split('-')[1])
            : null);

    const myIndex = backendId
        ? queue.findIndex(p => p.id === backendId)
        : queue.findIndex(p => p.name === patientData.name);

    const myPosition = myIndex >= 0 ? myIndex + 1 : null;
    const patientsAhead = myPosition ? Math.max(myPosition - 1, 0) : null;

    const currentTurningId = queue[0]?.id || null;
    const currentTurningToken = currentTurningId
        ? `VT-${currentTurningId.toString().padStart(4, '0')}`
        : '--';

    const displayTokenNumber = (analysisResult?.patient_id || patientData.patient_id || 'VT-0001')
        .replace(/^VT-/, '');

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6 md:p-12 flex flex-col items-center justify-center font-sans">
            <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                {/* Left Side: Large Status */}
                <div className="lg:col-span-12 text-center mb-4">
                    <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 px-6 py-2 rounded-full border border-blue-500/30 font-black text-sm uppercase tracking-widest mb-6">
                        <Activity size={16} /> {t('live_queue_status')}
                    </div>
                    <h1 className="text-6xl font-black mb-4 tracking-tighter">{t('waiting_for_doctor')}</h1>
                    <p className="text-slate-400 text-xl font-medium">{t('watch_token')}</p>
                </div>

                <div className="lg:col-span-8 space-y-8">
                    {/* Main Token Display */}
                    <div className="bg-slate-800/50 rounded-[50px] p-12 lg:p-16 border border-slate-700/50 shadow-2xl relative overflow-hidden backdrop-blur-md">
                        <div className="absolute top-0 right-0 p-12 opacity-5"><Bell size={200} /></div>

                        <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                            <div className="text-center md:text-left space-y-4">
                                <p className="text-blue-400 font-black uppercase tracking-widest">{t('your_token')}</p>
                                <h2 className="text-8xl lg:text-9xl font-black tracking-tighter text-white">
                                    #{displayTokenNumber}
                                </h2>
                                <div className="flex items-center gap-3 text-2xl font-bold text-slate-400">
                                    <User size={30} className="text-blue-500" /> {patientData.name}
                                </div>
                            </div>

                            <div className="w-full md:w-fit space-y-6">
                                <div className="bg-slate-900/80 p-8 rounded-[35px] border border-slate-700 text-center w-full md:w-64">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">{t('patients_ahead')}</p>
                                    <p className="text-6xl font-black text-blue-500">
                                        {patientsAhead !== null ? patientsAhead : '--'}
                                    </p>
                                </div>
                                <div className="bg-blue-600 p-8 rounded-[35px] text-center shadow-2xl shadow-blue-500/20">
                                    <p className="text-xs font-black text-blue-900 uppercase tracking-widest mb-2">{t('est_wait')}</p>
                                    <p className="text-4xl font-black">~15 {t('mins')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-800/40 p-10 rounded-[40px] border border-slate-700/50 flex items-center gap-6">
                            <div className="bg-green-500/10 p-5 rounded-3xl text-green-500"><CheckCircle size={32} strokeWidth={3} /></div>
                            <div>
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{t('department')}</p>
                                <p className="text-2xl font-black">{analysisResult?.department || t('opd')}</p>
                            </div>
                        </div>
                        <div className="bg-slate-800/40 p-10 rounded-[40px] border border-slate-700/50 flex items-center gap-6">
                            <div className="bg-blue-500/10 p-5 rounded-3xl text-blue-500"><Volume2 size={32} strokeWidth={3} /></div>
                            <div>
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{t('announcements')}</p>
                                    <p className="text-xl font-bold italic text-slate-300">
                                        "{t('now_calling')} #{currentTurningToken.replace(/^VT-/, '')}"
                                    </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6 self-start">
                    <h3 className="text-xl font-black uppercase tracking-widest text-slate-500 px-4">{t('now_serving')}</h3>
                    <div className="space-y-4">
                        {queue.slice(0, 4).map((p, i) => (
                            <div key={i} className={`p-6 rounded-3xl border ${i === 0 ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-slate-800/50 border-slate-700 text-slate-300'} flex items-center justify-between`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${i === 0 ? 'bg-white text-blue-600' : 'bg-slate-700 text-white'}`}>
                                        #{(p.id ? p.id.toString().padStart(4, '0') : '0000')}
                                    </div>
                                    <p className="font-bold truncate max-w-[120px]">{p.name || t('anonymous')}</p>
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${i === 0 ? 'bg-white/20' : 'bg-slate-700'}`}>
                                    {i === 0 ? t('in_room') : t('next')}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-[35px] flex items-start gap-4 text-red-400">
                        <AlertCircle className="shrink-0" size={24} />
                        <div>
                            <p className="font-black text-lg">{t('feeling_worse')}</p>
                            <p className="text-sm font-medium opacity-80 leading-relaxed">{t('feeling_worse_detail')}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/patient/start')}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold py-6 rounded-2xl transition-all flex items-center justify-center gap-2 border border-slate-700/50"
                    >
                        <LogOut size={20} /> {t('leave_waiting')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WaitingScreen;
