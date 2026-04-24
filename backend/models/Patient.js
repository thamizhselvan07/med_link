const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: false
        },
        age: {
            type: Number,
            required: false
        },
        gender: {
            type: String,
            required: false
        },
        phone: {
            type: String,
            required: false
        },
        email: {
            type: String,
            required: false
        },
        symptoms: {
            type: String,
            required: false
        },
        transcribedText: {
            type: String,
            required: false
        },
        priorityScore: {
            type: Number,
            default: 0
        },
        triageCategory: {
            type: String,
            enum: ['green', 'yellow', 'red', 'black'],
            default: 'green'
        },
        riskLevel: {
            type: String,
            enum: ['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY'],
            default: 'LOW'
        },
        doctor: {
            type: String,
            required: false
        },
        department: {
            type: String,
            required: false
        },
        status: {
            type: String,
            enum: ['waiting', 'with_nurse', 'with_doctor', 'discharged'],
            default: 'waiting'
        },
        visitType: {
            type: String,
            required: false
        },
        insuranceProvider: {
            type: String,
            required: false
        },
        policyNumber: {
            type: String,
            required: false
        },
        medicalHistory: {
            type: String,
            required: false
        },
        vitalsJson: {
            type: mongoose.Schema.Types.Mixed,
            required: false
        },
        aiAnalysisJson: {
            type: mongoose.Schema.Types.Mixed,
            required: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);
