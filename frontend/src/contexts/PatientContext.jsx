import React, { createContext, useContext, useState, useEffect } from 'react';

const PatientContext = createContext();

export const usePatient = () => useContext(PatientContext);

export const PatientProvider = ({ children }) => {
    const [patientData, setPatientData] = useState({
        // Basic Info
        name: '',
        age: '',
        gender: 'Male',
        phone: '',
        patient_id: `PT-${Math.floor(Math.random() * 9000) + 1000}`,

        // Symptoms
        symptoms: '',
        transcribed_text: '',
        duration: '',
        pain_level: 0,
        selected_symptoms: [],
        symptom_chest_pain: false,
        symptom_fever: false,
        symptom_cough: false,
        symptom_breathing_difficulty: false,
        symptom_headache: false,
        symptom_dizziness: false,
        symptom_vomiting: false,

        // Medical History
        diabetes: false,
        hypertension: false,
        heart_disease: false,
        asthma: false,
        pregnant: false,
        smoker: false,
        medical_history_list: [],
        recent_diagnosis: '',
        chronic_disease_history: '',
        family_medical_history: '',
        current_medications: '',

        // Vitals (Manual)
        temperature: '',
        heart_rate: '',
        blood_pressure_systolic: '',
        blood_pressure_diastolic: '',
        spo2: '',

        // Visit Details
        visit_type: 'OPD',
        department_preference: 'General',
        insurance_provider: '',
        policy_number: '',

        // Reports
        reports: [], // base64 or file preview urls
    });

    const [analysisResult, setAnalysisResult] = useState(null);
    const [queueStatus, setQueueStatus] = useState(null);

    const updatePatientData = (newData) => {
        setPatientData(prev => ({ ...prev, ...newData }));
    };

    const resetPatientData = () => {
        setPatientData({
            name: '',
            age: '',
            gender: 'Male',
            phone: '',
            patient_id: `PT-${Math.floor(Math.random() * 9000) + 1000}`,

            symptoms: '',
            transcribed_text: '',
            duration: '',
            pain_level: 0,
            selected_symptoms: [],
            symptom_chest_pain: false,
            symptom_fever: false,
            symptom_cough: false,
            symptom_breathing_difficulty: false,
            symptom_headache: false,
            symptom_dizziness: false,
            symptom_vomiting: false,

            diabetes: false,
            hypertension: false,
            heart_disease: false,
            asthma: false,
            pregnant: false,
            smoker: false,
            medical_history_list: [],
            recent_diagnosis: '',
            chronic_disease_history: '',
            family_medical_history: '',
            current_medications: '',

            temperature: '',
            heart_rate: '',
            blood_pressure_systolic: '',
            blood_pressure_diastolic: '',
            spo2: '',

            visit_type: 'OPD',
            department_preference: 'General',
            insurance_provider: '',
            policy_number: '',

            reports: []
        });
        setAnalysisResult(null);
        setQueueStatus(null);
    };

    return (
        <PatientContext.Provider value={{
            patientData,
            updatePatientData,
            resetPatientData,
            analysisResult,
            setAnalysisResult,
            queueStatus,
            setQueueStatus
        }}>
            {children}
        </PatientContext.Provider>
    );
};
