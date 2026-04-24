const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, initDB } = require('./config/db');
const killPort = require('kill-port');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Global Error Handlers
process.on("uncaughtException", err => {
    console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", err => {
    console.error("Unhandled Promise Rejection:", err);
});

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get("/health", (req, res) => {
    res.json({ ok: true, status: "running" });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/triage', require('./routes/triageRoutes')); // AI Analysis Route
app.post('/api/analyze-patient', require('./controllers/triageController').analyzePatient); // Specific requirement alias
app.post('/api/translate', require('./controllers/translateController').translateText); // Multilingual Translation Route

// NEW: Triage Queue & Booking Routes
app.use('/triage', require('./routes/triage')); // Triage Queue Management
app.use('/booking', require('./routes/booking')); // Doctor Booking System

// Emergency Assistance Routes
app.use('/api/emergency', require('./routes/emergency')); // Emergency features

// NEW: Appointment System Routes
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/doctor', require('./routes/doctorRoutes'));
app.use('/api/sms', require('./routes/smsRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes')); // NEW: SMS Integration

app.get('/', (req, res) => {
    res.send('VoiceTriage AI API is running');
});

// Start Server with Port Handling and MongoDB Connection
async function startServer() {
    try {
        // Connect to MongoDB
        await connectDB();
        
        // Initialize database (seed if needed)
        await initDB();
        
        await killPort(PORT);
        console.log(`Old process on port ${PORT} terminated.`);
    } catch (e) {
        if (e.code === 'EACCES') {
            console.log(`No process using port ${PORT} or permission denied.`);
        } else {
            console.log(`No process using port ${PORT}.`);
        }
    }

    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log("MongoDB database connected and initialized.");
    });

    server.on("error", err => {
        if (err.code === "EADDRINUSE") {
            console.error(`Port ${PORT} already in use. Try killing process manually.`);
            process.exit(1);
        }
    });
}

startServer();
