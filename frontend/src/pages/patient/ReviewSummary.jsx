import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { usePatient } from '../../contexts/PatientContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { StepTitle } from '../../components/patient/WizardUI';
import {
    ChevronLeft, CheckCircle, Edit3, User,
    Stethoscope, HeartPulse, History, ClipboardList,
    Loader2, Send
} from 'lucide-react';

const ReviewSummary = () => {
    const { patientData, setAnalysisResult, updatePatientData } = usePatient();
    const { t, translateText, language } = useLanguage();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // STEP 1: Translate inputs to English for AI (Step 8)
            let processedData = { ...patientData };
            if (language !== 'en') {
                processedData.symptoms = await translateText(patientData.symptoms, 'en', language);
                processedData.transcribed_text = await translateText(patientData.transcribed_text || patientData.symptoms, 'en', language);
            }

            // STEP 2: Call AI engine
            const res = await axios.post('/analyze-patient', processedData);
            let analysis = res.data;

            // Persist backend-generated token/id so Waiting & Result screens show correct value
            if (analysis.patient_id) {
                updatePatientData({ patient_id: analysis.patient_id });
            }

            // STEP 3: Translate AI output back to UI language (Step 7)
            if (language !== 'en' && analysis.ai_analysis) {
                const report = analysis.ai_analysis;
                const translatedSummary = await translateText(report.ai_summary, language, 'en');
                const translatedAlert = await translateText(report.doctor_alert, language, 'en');
                const translatedActions = await Promise.all(
                    (report.nurse_actions || []).map(action => translateText(action, language, 'en'))
                );

                analysis.ai_analysis = {
                    ...report,
                    ai_summary: translatedSummary,
                    doctor_alert: translatedAlert,
                    nurse_actions: translatedActions
                };
            }

            setAnalysisResult(analysis);
            navigate('/patient/result');
        } catch (error) {
            console.error("Submission error", error);
            alert("Failed to connect to AI engine. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const SummarySection = ({ titleKey, icon: Icon, data, onEdit }) => (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative group overflow-hidden">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-50 p-3 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {Icon && <Icon size={24} />}
                    </div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">{t(titleKey)}</h3>
                </div>
                <button onClick={onEdit} className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition-all">
                    <Edit3 size={20} />
                </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {data.map((item, i) => (
                    item.value && (
                        <div key={i} className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t(item.labelKey)}</p>
                            <p className="text-lg font-bold text-slate-700">{item.value}</p>
                        </div>
                    )
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12 flex flex-col items-center font-sans">
            <div className="max-w-4xl w-full">
                <StepTitle title={t('review_confirm')} subtitle={t('review_subtitle')} />

                <div className="space-y-6 mb-12">
                    <SummarySection
                        titleKey="personal_details"
                        icon={User}
                        data={[
                            { labelKey: 'name', value: patientData.name },
                            { labelKey: 'age', value: `${patientData.age} years` },
                            { labelKey: 'gender', value: patientData.gender },
                            { labelKey: 'phone', value: patientData.phone }
                        ]}
                        onEdit={() => navigate('/patient/form')}
                    />

                    <SummarySection
                        titleKey="symptoms_vitals"
                        icon={HeartPulse}
                        data={[
                            { labelKey: 'symptoms', value: patientData.symptoms },
                            { labelKey: 'pain_level', value: `${patientData.pain_level}/10` },
                            { labelKey: 'temperature', value: patientData.temperature ? `${patientData.temperature}°C` : null },
                            { labelKey: 'heart_rate', value: patientData.heart_rate ? `${patientData.heart_rate} BPM` : null },
                            { labelKey: 'oxygen', value: patientData.spo2 ? `${patientData.spo2}%` : null },
                            { labelKey: 'blood_pressure', value: patientData.blood_pressure_systolic ? `${patientData.blood_pressure_systolic}/${patientData.blood_pressure_diastolic}` : null }
                        ]}
                        onEdit={() => navigate('/patient/form')}
                    />

                    <SummarySection
                        titleKey="medical_history"
                        icon={History}
                        data={[
                            {
                                labelKey: 'conditions', value: [
                                    patientData.diabetes && 'Diabetes',
                                    patientData.hypertension && 'Hypertension',
                                    patientData.heart_disease && 'Heart Disease',
                                    patientData.asthma && 'Asthma'
                                ].filter(Boolean).join(', ')
                            },
                            { labelKey: 'medications', value: patientData.current_medications },
                            { labelKey: 'history', value: patientData.chronic_disease_history }
                        ]}
                        onEdit={() => navigate('/patient/form')}
                    />
                </div>

                <div className="flex flex-col gap-6">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className={`w-full ${isSubmitting ? 'bg-slate-400' : 'bg-green-600 hover:bg-green-700 shadow-green-100'} text-white p-8 rounded-[30px] shadow-2xl transition-all flex items-center justify-center gap-4 group active:scale-[0.98]`}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin" size={32} strokeWidth={3} />
                                <span className="text-3xl font-black italic tracking-tight">{t('ai_analyzing')}</span>
                            </>
                        ) : (
                            <>
                                <Send size={32} strokeWidth={3} />
                                <span className="text-3xl font-black">{t('submit_triage')}</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => navigate('/patient/form')}
                        disabled={isSubmitting}
                        className="text-slate-500 font-bold hover:text-slate-800 transition-colors"
                    >
                        {t('fix_something')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewSummary;

