import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../../contexts/PatientContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
    Activity, Clock, User, LogOut, CheckCircle,
    Download, ArrowRight, AlertTriangle, ShieldCheck
} from 'lucide-react';

const ResultScreen = () => {
    const { analysisResult, patientData, resetPatientData } = usePatient();
    const { t } = useLanguage();
    const navigate = useNavigate();

    useEffect(() => {
        if (!analysisResult) navigate('/patient/start');
    }, [analysisResult, navigate]);

    if (!analysisResult) return null;

    const riskColors = {
        'EMERGENCY': 'bg-red-600 text-white shadow-red-200',
        'HIGH': 'bg-orange-500 text-white shadow-orange-100',
        'MEDIUM': 'bg-yellow-500 text-white shadow-yellow-100',
        'LOW': 'bg-green-600 text-white shadow-green-100'
    };

    const handleDone = () => {
        resetPatientData();
        navigate('/patient/start');
    };

    const handleDownloadPdf = () => {
        const content = `
Medicare AI Triage Summary
==========================

Patient: ${patientData?.name || '-'} (${analysisResult.patient_id || '-'})
Risk Level: ${analysisResult.risk_level}
Priority Score: ${analysisResult.priority_score || analysisResult.emergency_score || '-'}
Department: ${analysisResult.department}
Doctor Assigned: ${analysisResult.doctor_assigned || '-'}

AI Summary:
${analysisResult.ai_summary || '-'}

Primary Symptoms:
${patientData?.symptoms || patientData?.transcribed_text || (patientData?.selected_symptoms || []).join(', ') || '-'}

Medical History:
${(patientData?.medical_history_list || []).join(', ') || '-'}
`;

        const blob = new Blob([content], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `triage-summary-${analysisResult.patient_id || 'patient'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12 flex flex-col items-center justify-center font-sans">
            <div className="max-w-4xl w-full space-y-8 animate-in zoom-in-95 duration-700">

                {/* Result Hero */}
                <div className={`rounded-[50px] p-12 md:p-16 text-center space-y-10 shadow-2xl relative overflow-hidden ${riskColors[analysisResult.risk_level]}`}>
                    <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 scale-150">
                        <Activity size={200} />
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="bg-white/20 w-32 h-32 rounded-full flex items-center justify-center mx-auto backdrop-blur-md ring-8 ring-white/10 animate-pulse">
                            <Activity size={60} strokeWidth={3} />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-5xl md:text-7xl font-black tracking-tight">{t('ai_analysis_title')}</h1>
                            <p className="text-2xl font-medium opacity-90">{t('based_on_symptoms')} <span className="underline font-black">{t(analysisResult.risk_level.toLowerCase()) || analysisResult.risk_level}</span></p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                        {[
                            { labelKey: 'priority_score', val: `${analysisResult.priority_score || analysisResult.emergency_score || 0}/100`, icon: ShieldCheck },
                            { labelKey: 'wait_time', val: '~15 mins', icon: Clock },
                            { labelKey: 'zone', val: analysisResult.department, icon: Activity },
                            { labelKey: 'token', val: `#${(analysisResult.patient_id || patientData.patient_id || 'VT-0001').replace(/^VT-/, '')}`, icon: User }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/15 backdrop-blur-lg p-6 rounded-3xl border border-white/20 text-center">
                                <stat.icon size={24} className="mx-auto mb-3 opacity-60" />
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">{t(stat.labelKey)}</p>
                                <p className="text-2xl font-black">{stat.val}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Patient Instructions */}
                <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 p-12 md:p-16 flex flex-col md:flex-row gap-12 items-center">
                    <div className="flex-1 space-y-6 text-center md:text-left">
                        <h2 className="text-3xl font-black text-slate-900 leading-tight">{t('instructions')}</h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 group hover:bg-blue-50 transition-colors text-left flex-col md:flex-row">
                                <CheckCircle className="text-green-500 mt-1 shrink-0" />
                                <div>
                                    <p className="font-black text-slate-800">{t('assigned_consultant')}: {analysisResult.doctor_assigned}</p>
                                    <p className="text-slate-500 font-medium">{t('proceed_to')} {analysisResult.department} {t('waiting_area')}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 group hover:bg-blue-50 transition-colors text-left flex-col md:flex-row">
                                <AlertTriangle className="text-orange-500 mt-1 shrink-0" />
                                <div>
                                    <p className="font-black text-slate-800">{t('mask_mandatory')}</p>
                                    <p className="text-slate-500 font-medium">{t('mask_detail')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-auto flex flex-col gap-4">
                        <button onClick={() => navigate('/patient/waiting')} className="bg-slate-900 text-white px-10 py-6 rounded-3xl shadow-xl font-black text-2xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all group">
                            {t('go_to_queue')} <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                        </button>
                        <button
                            onClick={handleDownloadPdf}
                            className="flex items-center justify-center gap-2 text-slate-500 font-bold hover:text-blue-600 transition-colors py-2"
                        >
                            <Download size={18} /> {t('download_pdf')}
                        </button>
                    </div>
                </div>

                <div className="text-center">
                    <button onClick={handleDone} className="text-slate-400 font-bold hover:text-red-500 transition-colors uppercase tracking-widest text-sm flex items-center gap-2 mx-auto">
                        <LogOut size={16} /> {t('exit_session')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResultScreen;
