const { analyzePatientRisk } = require('../ai/riskModel');
const { pool } = require('../config/db');

exports.analyzePatient = async (req, res) => {
    try {
        const patientData = req.body;

        // Enrich raw intake data with structured symptom & history flags
        const selectedSymptoms = Array.isArray(patientData.selected_symptoms) ? patientData.selected_symptoms : [];
        const medicalHistoryList = Array.isArray(patientData.medical_history_list) ? patientData.medical_history_list : [];

        const symptomSet = new Set(selectedSymptoms.map(s => String(s).toLowerCase()));
        const historySet = new Set(medicalHistoryList.map(d => String(d).toLowerCase()));

        const enrichedForAI = {
            ...patientData,
            // Symptom booleans derived from checklist + free text
            symptom_chest_pain: patientData.symptom_chest_pain || [...symptomSet].some(s => s.includes('chest pain')),
            symptom_breathing_difficulty: patientData.symptom_breathing_difficulty || [...symptomSet].some(s => s.includes('shortness of breath') || s.includes('breathing difficulty')),
            symptom_fever: patientData.symptom_fever || [...symptomSet].some(s => s === 'fever'),
            symptom_cough: patientData.symptom_cough || [...symptomSet].some(s => s === 'cough'),
            symptom_headache: patientData.symptom_headache || [...symptomSet].some(s => s === 'headache'),
            symptom_dizziness: patientData.symptom_dizziness || [...symptomSet].some(s => s === 'dizziness'),
            symptom_vomiting: patientData.symptom_vomiting || [...symptomSet].some(s => s === 'vomiting'),

            // History booleans derived from expanded history list
            diabetes: patientData.diabetes || [...historySet].some(h => h.startsWith('diabetes')),
            hypertension: patientData.hypertension || [...historySet].some(h => h.startsWith('hypertension')),
            heart_disease: patientData.heart_disease || [...historySet].some(h => h.includes('coronary artery') || h.includes('heart failure') || h.includes('heart attack') || h.includes('ischemic heart')),
            asthma: patientData.asthma || [...historySet].some(h => h.startsWith('asthma')),
            pregnant: patientData.pregnant || [...historySet].some(h => h.includes('pregnancy')),
            smoker: patientData.smoker || [...historySet].some(h => h.includes('smoking') || h.includes('tobacco')),
        };

        // Run Advanced AI Analysis
        const analysis = analyzePatientRisk(enrichedForAI);

        // Map risk level for internal triage categories (colors)
        const triageCategory = analysis.risk_level === 'Critical' || analysis.risk_level === 'High' ? 'red' :
            analysis.risk_level === 'Medium' ? 'yellow' : 'green';

        // Save new patient record to database with full AI insights
        const [result] = await pool.query(
            `INSERT INTO patients (
                name, age, gender, phone, symptoms, transcribed_text, 
                priority_score, triage_category, status, 
                visit_type, insurance_provider, policy_number, medical_history, 
                vitals_json, doctor, department, risk_level, ai_analysis_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                patientData.name,
                patientData.age,
                patientData.gender,
                patientData.phone,
                patientData.symptoms,
                patientData.transcribed_text || patientData.symptoms,
                analysis.emergency_score,
                triageCategory,
                'waiting',
                patientData.visit_type,
                patientData.insurance_provider,
                patientData.policy_number,
                JSON.stringify({
                    diabetes: patientData.diabetes,
                    hypertension: patientData.hypertension,
                    heart_disease: patientData.heart_disease,
                    asthma: patientData.asthma,
                    pregnant: patientData.pregnant,
                    smoker: patientData.smoker,
                    current_medications: patientData.current_medications
                }),
                JSON.stringify({
                    temp: patientData.temperature,
                    hr: patientData.heart_rate,
                    sys: patientData.blood_pressure_systolic,
                    dia: patientData.blood_pressure_diastolic,
                    spo2: patientData.spo2
                }),
                analysis.doctor_alert.includes("Cardiology") ? "Dr. Arjun Mehta" : "General Physician",
                analysis.department,
                analysis.risk_level,
                JSON.stringify(analysis)
            ]
        );

        // Return the STRICT JSON FORMAT for frontend consumption
        res.json({
            db_id: result.insertId,
            patient_id: `VT-${result.insertId.toString().padStart(4, '0')}`,
            ...analysis
        });

    } catch (error) {
        console.error("AI Analysis Error:", error);
        res.status(500).json({ error: "Clinical Analysis Engine Offline." });
    }
};

exports.getTriageHistory = async (req, res) => {
    // Placeholder to fetch past analyses if stored in a separate table
    res.json({ message: "Not implemented for MVP" });
};

exports.assignPatient = async (req, res) => {
    try {
        const { patient_id, doctor_id } = req.body;

        // Handle VT-XXXX format or simple ID
        let dbId = patient_id;
        if (typeof patient_id === 'string' && patient_id.startsWith('VT-')) {
            dbId = parseInt(patient_id.split('-')[1]);
        }

        // Get Doctor Name (Mock lookup or from request if needed, otherwise just ID)
        // For simplicity, we just update the doctor column with ID or Name if available
        // Ideally we should lookup doctor name from users table

        const [users] = await pool.query("SELECT name FROM users WHERE id = ? OR name = ?", [doctor_id, doctor_id]);
        const doctorName = users[0]?.name || doctor_id;

        await pool.query(
            "UPDATE patients SET doctor = ?, status = 'with_doctor' WHERE id = ? OR patient_id = ?",
            [doctorName, dbId, patient_id]
        );

        res.json({ success: true, message: "Patient assigned successfully" });
    } catch (error) {
        console.error("Assign Error:", error);
        res.status(500).json({ success: false, message: "Database Error" });
    }
};
