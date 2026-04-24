const { Patient, Vitals, Notes } = require('../config/db');
const { analyzePatientRisk } = require('../ai/riskModel');

exports.intake = async (req, res) => {
    const { name, age, gender, symptoms, transcribed_text } = req.body;

    // Initial Triage based on voice text alone
    const analysis = analyzePatientRisk({
        name, age, gender,
        symptoms, transcribed_text
    });

    const triageCategory = analysis.risk_level === 'EMERGENCY' || analysis.risk_level === 'HIGH' ? 'red' :
        analysis.risk_level === 'MEDIUM' ? 'yellow' : 'green';

    try {
        const patient = await Patient.create({
            name,
            age,
            gender,
            symptoms,
            transcribedText: transcribed_text,
            priorityScore: analysis.priority_score,
            triageCategory,
            riskLevel: analysis.risk_level,
            status: 'waiting'
        });

        res.status(201).json({
            id: patient._id,
            message: 'Patient intake successful',
            triage: triageCategory,
            score: analysis.priority_score,
            analysis
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.updateVitals = async (req, res) => {
    const { id } = req.params;
    const { bp_systolic, bp_diastolic, temperature, heart_rate, spo2 } = req.body;

    try {
        // 1. Save Vitals
        await Vitals.create({
            patientId: id,
            bpSystolic: bp_systolic,
            bpDiastolic: bp_diastolic,
            temperature,
            heartRate: heart_rate,
            spo2
        });

        // 2. Recalculate Triage Score using AI Risk Model
        const patient = await Patient.findById(id);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Prepare data for AI model
        const aiInput = {
            patient_id: id,
            age: patient.age,
            gender: patient.gender,
            symptoms: patient.symptoms,
            transcribed_text: patient.transcribedText,

            // Vitals from request
            blood_pressure_systolic: bp_systolic,
            blood_pressure_diastolic: bp_diastolic,
            temperature: temperature,
            heart_rate: heart_rate,
            spo2: spo2,

            // Parse symptoms from text
            symptom_chest_pain: (patient.transcribedText || "").toLowerCase().includes('chest pain'),
            symptom_breathing_difficulty: (patient.transcribedText || "").toLowerCase().includes('breath'),
            symptom_fever: (patient.transcribedText || "").toLowerCase().includes('fever') || temperature > 37.5,
            symptom_cough: (patient.transcribedText || "").toLowerCase().includes('cough'),
            symptom_headache: (patient.transcribedText || "").toLowerCase().includes('headache'),
            symptom_dizziness: (patient.transcribedText || "").toLowerCase().includes('dizzy'),
            pain_level: (patient.transcribedText || "").match(/pain.*?(\d+)/i) ? parseInt((patient.transcribedText || "").match(/pain.*?(\d+)/i)[1]) : 0,

            // Medical History
            diabetes: (patient.transcribedText || "").toLowerCase().includes('diabetes'),
            hypertension: (patient.transcribedText || "").toLowerCase().includes('pressure'),
            heart_disease: (patient.transcribedText || "").toLowerCase().includes('heart'),
            smoker: (patient.transcribedText || "").toLowerCase().includes('smok'),
            pregnant: (patient.transcribedText || "").toLowerCase().includes('pregnant')
        };

        const analysis = analyzePatientRisk(aiInput);

        const triageCategory = analysis.risk_level === 'EMERGENCY' || analysis.risk_level === 'HIGH' ? 'red' :
            analysis.risk_level === 'MEDIUM' ? 'yellow' : 'green';

        // 3. Update Patient record with new score and status
        await Patient.findByIdAndUpdate(id, {
            priorityScore: analysis.priority_score,
            triageCategory,
            riskLevel: analysis.risk_level,
            status: 'with_nurse'
        });

        // Save AI notes/recommendations to notes table
        if (analysis.recommendations && analysis.recommendations.length > 0) {
            const aiNote = "AI TRIAGE: " + analysis.recommendations.join("; ");
            await Notes.create({
                patientId: id,
                noteText: aiNote,
                doctorName: 'AI System'
            });
        }

        res.json({ message: 'Vitals updated and triage score recalculated', triage: triageCategory, score: analysis.priority_score, analysis });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.getQueue = async (req, res) => {
    try {
        const patients = await Patient.find({ status: { $ne: 'discharged' } })
            .sort({ priorityScore: -1, createdAt: 1 });
        res.json(patients);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.getPatientDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const patient = await Patient.findById(id);
        if (!patient) return res.status(404).json({ message: 'Patient not found' });

        const vitals = await Vitals.find({ patientId: id }).sort({ recordedAt: -1 });
        const notes = await Notes.find({ patientId: id }).sort({ createdAt: -1 });

        res.json({
            ...patient.toObject(),
            vitals,
            notes
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.addNote = async (req, res) => {
    const { id } = req.params;
    const { note_text, doctor_name } = req.body;
    try {
        await Notes.create({
            patientId: id,
            noteText: note_text,
            doctorName: doctor_name
        });
        res.status(201).json({ message: 'Note added' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await pool.query('UPDATE patients SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: 'Status updated' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.getStats = async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN triage_category = 'red' THEN 1 ELSE 0 END) as red,
        SUM(CASE WHEN triage_category = 'yellow' THEN 1 ELSE 0 END) as yellow,
        SUM(CASE WHEN triage_category = 'green' THEN 1 ELSE 0 END) as green,
        AVG(priority_score) as avg_score
      FROM patients
      WHERE created_at >= DATE('now')
    `);
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};
