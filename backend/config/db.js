const mongoose = require('mongoose');

// Import Models
const User = require('../models/User');
const Patient = require('../models/Patient');
const Vitals = require('../models/Vitals');
const Notes = require('../models/Notes');
const Symptoms = require('../models/Symptoms');

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/voicetriage_db';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};


// Initialize and Seed Database
const initDB = async () => {
  try {
    // Check if collections already exist with data
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      console.log("Seeding database with initial data...");
      await seedDB();
    } else {
      console.log("Database already seeded");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

const seedDB = async () => {
  try {
    // 1. Seed Users (Admin, Doctors, Nurses, Patients)
    const seedData = [
      { name: 'Administrator', email: 'admin@hospital.com', role: 'admin', password: 'admin123' },
      // 15 Doctors
      { name: 'Dr. Arjun Mehta', email: 'arjun@hospital.com', role: 'doctor', password: 'doc123' },
      { name: 'Dr. Priya Sharma', email: 'priya@hospital.com', role: 'doctor', password: 'doc123' },
      { name: 'Dr. Rahul Verma', email: 'rahul@hospital.com', role: 'doctor', password: 'doc123' },
      { name: 'Dr. Meena Lakshmi', email: 'meena@hospital.com', role: 'doctor', password: 'doc123' },
      { name: 'Dr. Karthik Rao', email: 'karthik@hospital.com', role: 'doctor', password: 'doc123' },
      { name: 'Dr. Nisha Goel', email: 'nisha@hospital.com', role: 'doctor', password: 'doc123' },
      { name: 'Dr. Suresh Kumar', email: 'suresh@hospital.com', role: 'doctor', password: 'doc123' },
      { name: 'Dr. Kavya Iyer', email: 'kavya@hospital.com', role: 'doctor', password: 'doc123' },
      { name: 'Dr. Vivek Joshi', email: 'vivek@hospital.com', role: 'doctor', password: 'doc123' },
      { name: 'Dr. Anand Singh', email: 'anand@hospital.com', role: 'doctor', password: 'doc123' },
      { name: 'Dr. Divya Shetty', email: 'divya@hospital.com', role: 'doctor', password: 'doc123' },
      { name: 'Dr. Sanjay Gupta', email: 'sanjay@hospital.com', role: 'doctor', password: 'doc123' },
      { name: 'Dr. Ritu Oberoi', email: 'ritu@hospital.com', role: 'doctor', password: 'doc123' },
      { name: 'Dr. Deepak Chand', email: 'deepak@hospital.com', role: 'doctor', password: 'doc123' },
      { name: 'Dr. Asha Begum', email: 'asha@hospital.com', role: 'doctor', password: 'doc123' },
      // 15 Nurses
      ...Array.from({ length: 15 }, (_, i) => ({
        name: `Nurse ${i + 1}`,
        email: `nurse${i + 1}@hospital.com`,
        role: 'nurse',
        password: 'nurse123'
      })),
      // 20 Patients
      ...Array.from({ length: 20 }, (_, i) => ({
        name: `Patient ${i + 1}`,
        email: `patient${i + 1}@hospital.com`,
        role: 'patient',
        password: 'patient123'
      }))
    ];

    // Insert users
    for (const userData of seedData) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        await User.create(userData);
      }
    }
    console.log("Users seeded successfully");

    // 2. Seed Patients with Vitals and Symptoms
    const seedPatients = [
      {
        name: 'Arun Kumar', 
        age: 52, 
        gender: 'Male', 
        symptoms: 'chest pain, dizziness',
        doctor: 'Dr. Arjun Mehta', 
        department: 'Cardiology',
        riskLevel: 'HIGH',
        medicalHistory: 'diabetes, hypertension',
        vitals: { bpSystolic: 165, bpDiastolic: 100, heartRate: 115, temperature: 99, spo2: 91 },
        patientSymptoms: { chestPain: true, dizziness: true }
      },
      {
        name: 'Meena Lakshmi', 
        age: 30, 
        gender: 'Female', 
        symptoms: 'fever, cough',
        doctor: 'Dr. Priya Sharma', 
        department: 'General Medicine',
        riskLevel: 'MEDIUM',
        medicalHistory: 'asthma',
        vitals: { bpSystolic: 130, bpDiastolic: 85, heartRate: 88, temperature: 101, spo2: 97 },
        patientSymptoms: { fever: true, cough: true }
      },
      {
        name: 'Rahul Verma', 
        age: 61, 
        gender: 'Male', 
        symptoms: 'breathing difficulty',
        doctor: 'Dr. Rahul Verma', 
        department: 'Emergency',
        riskLevel: 'EMERGENCY',
        medicalHistory: 'heart disease',
        vitals: { bpSystolic: 170, bpDiastolic: 105, heartRate: 122, temperature: 98.6, spo2: 89 },
        patientSymptoms: { breathing: true }
      },
      {
        name: 'Sanjay Patel', 
        age: 40, 
        gender: 'Male', 
        symptoms: 'headache',
        doctor: 'Dr. Priya Sharma', 
        department: 'General Medicine',
        riskLevel: 'LOW',
        medicalHistory: 'None',
        vitals: { bpSystolic: 120, bpDiastolic: 80, heartRate: 72, temperature: 98.4, spo2: 99 },
        patientSymptoms: { headache: true }
      }
    ];

    for (const patientData of seedPatients) {
      const existingPatient = await Patient.findOne({ name: patientData.name });
      if (!existingPatient) {
        const triageCategory = patientData.riskLevel === 'EMERGENCY' || patientData.riskLevel === 'HIGH' 
          ? 'red' 
          : (patientData.riskLevel === 'MEDIUM' ? 'yellow' : 'green');

        const newPatient = await Patient.create({
          name: patientData.name,
          age: patientData.age,
          gender: patientData.gender,
          symptoms: patientData.symptoms,
          doctor: patientData.doctor,
          department: patientData.department,
          riskLevel: patientData.riskLevel,
          triageCategory,
          status: 'waiting',
          medicalHistory: patientData.medicalHistory
        });

        // Create Vitals
        await Vitals.create({
          patientId: newPatient._id,
          bpSystolic: patientData.vitals.bpSystolic,
          bpDiastolic: patientData.vitals.bpDiastolic,
          heartRate: patientData.vitals.heartRate,
          temperature: patientData.vitals.temperature,
          spo2: patientData.vitals.spo2
        });

        // Create Symptoms
        await Symptoms.create({
          patientId: newPatient._id,
          ...patientData.patientSymptoms
        });
      }
    }
    console.log("Patients and vitals seeded successfully");

  } catch (error) {
    console.error("Seeding error:", error);
  }
};

module.exports = { 
  connectDB, 
  initDB, 
  User, 
  Patient, 
  Vitals, 
  Notes, 
  Symptoms,
  mongoose 
};

    // Patients table
    db.exec(`
      CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        age INTEGER,
        gender TEXT,
        phone TEXT,
        symptoms TEXT,
        transcribed_text TEXT,
        priority_score INTEGER DEFAULT 0,
        triage_category TEXT CHECK(triage_category IN ('green', 'yellow', 'red', 'black')) DEFAULT 'green',
        risk_level TEXT DEFAULT 'LOW',
        doctor TEXT,
        department TEXT,
        status TEXT CHECK(status IN ('waiting', 'with_nurse', 'with_doctor', 'discharged')) DEFAULT 'waiting',
        visit_type TEXT,
        insurance_provider TEXT,
        policy_number TEXT,
        medical_history TEXT,
        vitals_json TEXT,
        ai_analysis_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Vitals table linked to patient
    db.exec(`
      CREATE TABLE IF NOT EXISTS vitals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER,
        bp_systolic INTEGER,
        bp_diastolic INTEGER,
        temperature REAL,
        heart_rate INTEGER,
        spo2 INTEGER,
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
      )
    `);

    // Symptoms table linked to patient
    db.exec(`
      CREATE TABLE IF NOT EXISTS symptoms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER,
        chest_pain BOOLEAN DEFAULT 0,
        fever BOOLEAN DEFAULT 0,
        cough BOOLEAN DEFAULT 0,
        breathing BOOLEAN DEFAULT 0,
        headache BOOLEAN DEFAULT 0,
        dizziness BOOLEAN DEFAULT 0,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
      )
    `);

    // Notes table linked to patient and doctor
    db.exec(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER,
        doctor_name TEXT,
        note_text TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
      )
    `);

    console.log("SQLite Database tables initialized successfully");

    // Seed Data
    await seedDB();

  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

const seedDB = async () => {
  try {
    const bcrypt = require('bcryptjs');

    // 1. Seed Users (Admin, Doctors, Nurses, Patients)
    const seedData = [
      { name: 'Administrator', email: 'admin@hospital.com', role: 'admin', pass: 'admin123' },
      // 15 Doctors
      { name: 'Dr. Arjun Mehta', email: 'arjun@hospital.com', role: 'doctor', pass: 'doc123' },
      { name: 'Dr. Priya Sharma', email: 'priya@hospital.com', role: 'doctor', pass: 'doc123' },
      { name: 'Dr. Rahul Verma', email: 'rahul@hospital.com', role: 'doctor', pass: 'doc123' },
      { name: 'Dr. Meena Lakshmi', email: 'meena@hospital.com', role: 'doctor', pass: 'doc123' },
      { name: 'Dr. Karthik Rao', email: 'karthik@hospital.com', role: 'doctor', pass: 'doc123' },
      { name: 'Dr. Nisha Goel', email: 'nisha@hospital.com', role: 'doctor', pass: 'doc123' },
      { name: 'Dr. Suresh Kumar', email: 'suresh@hospital.com', role: 'doctor', pass: 'doc123' },
      { name: 'Dr. Kavya Iyer', email: 'kavya@hospital.com', role: 'doctor', pass: 'doc123' },
      { name: 'Dr. Vivek Joshi', email: 'vivek@hospital.com', role: 'doctor', pass: 'doc123' },
      { name: 'Dr. Anand Singh', email: 'anand@hospital.com', role: 'doctor', pass: 'doc123' },
      { name: 'Dr. Divya Shetty', email: 'divya@hospital.com', role: 'doctor', pass: 'doc123' },
      { name: 'Dr. Sanjay Gupta', email: 'sanjay@hospital.com', role: 'doctor', pass: 'doc123' },
      { name: 'Dr. Ritu Oberoi', email: 'ritu@hospital.com', role: 'doctor', pass: 'doc123' },
      { name: 'Dr. Deepak Chand', email: 'deepak@hospital.com', role: 'doctor', pass: 'doc123' },
      { name: 'Dr. Asha Begum', email: 'asha@hospital.com', role: 'doctor', pass: 'doc123' },
      // 15 Nurses
      ...Array.from({ length: 15 }, (_, i) => ({
        name: `Nurse ${i + 1}`,
        email: `nurse${i + 1}@hospital.com`,
        role: 'nurse',
        pass: 'nurse123'
      })),
      // 20 Patients
      ...Array.from({ length: 20 }, (_, i) => ({
        name: `Patient ${i + 1}`,
        email: `patient${i + 1}@hospital.com`,
        role: 'patient',
        pass: 'patient123'
      }))
    ];

    for (const u of seedData) {
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [u.email]);
      if (rows.length === 0) {
        const hashedPassword = await bcrypt.hash(u.pass, 8);
        await pool.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [u.name, u.email, hashedPassword, u.role]);
      }
    }

    // 2. Seed Patients
    const seedPatients = [
      {
        name: 'Arun Kumar', age: 52, gender: 'Male', symptoms: 'chest pain, dizziness',
        bp_sys: 165, bp_dia: 100, hr: 115, temp: 99, spo2: 91,
        conditions: 'diabetes, hypertension', doctor: 'Dr. Arjun Mehta', dept: 'Cardiology',
        chest_pain: 1, dizziness: 1, risk: 'HIGH'
      },
      {
        name: 'Meena Lakshmi', age: 30, gender: 'Female', symptoms: 'fever, cough',
        bp_sys: 130, bp_dia: 85, hr: 88, temp: 101, spo2: 97,
        conditions: 'asthma', doctor: 'Dr. Priya Sharma', dept: 'General Medicine',
        fever: 1, cough: 1, risk: 'MEDIUM'
      },
      {
        name: 'Rahul Verma', age: 61, gender: 'Male', symptoms: 'breathing difficulty',
        bp_sys: 170, bp_dia: 105, hr: 122, temp: 98.6, spo2: 89,
        conditions: 'heart disease', doctor: 'Dr. Naveen Rao', dept: 'Emergency',
        breathing: 1, risk: 'EMERGENCY'
      },
      {
        name: 'Sanjay Patel', age: 40, gender: 'Male', symptoms: 'headache',
        bp_sys: 120, bp_dia: 80, hr: 72, temp: 98.4, spo2: 99,
        conditions: 'None', doctor: 'Dr. Priya Sharma', dept: 'General Medicine',
        headache: 1, risk: 'LOW'
      }
    ];

    for (const p of seedPatients) {
      const [rows] = await pool.query('SELECT * FROM patients WHERE name = ?', [p.name]);
      if (rows.length === 0) {
        const triageCat = p.risk === 'EMERGENCY' || p.risk === 'HIGH' ? 'red' : (p.risk === 'MEDIUM' ? 'yellow' : 'green');
        const [result] = await pool.query(
          `INSERT INTO patients (name, age, gender, symptoms, doctor, department, risk_level, triage_category, status, medical_history) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [p.name, p.age, p.gender, p.symptoms, p.doctor, p.dept, p.risk, triageCat, 'waiting', p.conditions]
        );
        const pid = result.insertId;

        // Seed Vitals
        await pool.query(
          `INSERT INTO vitals (patient_id, bp_systolic, bp_diastolic, heart_rate, temperature, spo2) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
          [pid, p.bp_sys, p.bp_dia, p.hr, p.temp, p.spo2]
        );

        // Seed Symptoms
        await pool.query(
          `INSERT INTO symptoms (patient_id, chest_pain, fever, cough, breathing, headache, dizziness) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [pid, p.chest_pain || 0, p.fever || 0, p.cough || 0, p.breathing || 0, p.headache || 0, p.dizziness || 0]
        );
      }
    }
    console.log("Seed data created successfully");
  } catch (err) {
    console.error("Seeding error:", err);
  }
}

module.exports = { pool, initDB, db };
