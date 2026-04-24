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

