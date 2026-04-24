const mongoose = require('mongoose');

const symptomsSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Patient',
            required: true
        },
        chestPain: {
            type: Boolean,
            default: false
        },
        fever: {
            type: Boolean,
            default: false
        },
        cough: {
            type: Boolean,
            default: false
        },
        breathing: {
            type: Boolean,
            default: false
        },
        headache: {
            type: Boolean,
            default: false
        },
        dizziness: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Symptoms', symptomsSchema);
