const mongoose = require('mongoose');

const vitalsSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Patient',
            required: true
        },
        bpSystolic: {
            type: Number,
            required: false
        },
        bpDiastolic: {
            type: Number,
            required: false
        },
        temperature: {
            type: Number,
            required: false
        },
        heartRate: {
            type: Number,
            required: false
        },
        spo2: {
            type: Number,
            required: false
        },
        recordedAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Vitals', vitalsSchema);
