# 🏥 MED+ - Smart Healthcare & Patient Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)

🚀 **AI-Powered Healthcare Platform for Smart Patient Triage, Booking & Management**
Built for Kanini Hackathon 2026

---

## 🌐 Live Deployment

[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://med-link-ten.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-Render-blue?logo=render)](https://med-link-dhdf.onrender.com/)

🚀 Try the app live:

* 🌍 Frontend: https://med-link-ten.vercel.app/
* ⚙️ Backend API: https://med-link-dhdf.onrender.com/

> ⚡ Fully deployed system — no setup required

---

## 🎯 Overview

**MED+** is a complete hospital and patient management system designed to improve healthcare efficiency using AI and real-time data.

It combines:

* 🚑 **Smart Patient Triage** – AI-based risk assessment & priority scoring
* 👨‍⚕️ **Doctor Booking System** – real-time availability & scheduling
* 🌐 **Multilingual Support** – supports multiple Indian languages
* 🎤 **Voice Input** – speech-to-text for symptom capture
* 📊 **Analytics Dashboard** – real-time monitoring and insights

---

## ✨ Key Features

### 🧠 Intelligent Triage System

* AI-powered risk classification (Critical / Medium / Low)
* Automated priority scoring (0–100)
* Real-time patient queue management
* Department-based routing

### 👨‍⚕️ Doctor Booking & Management

* One-click doctor assignment
* Capacity tracking
* No double-booking validation
* Department matching

### 🌍 Multilingual Interface

* Supports multiple Indian languages
* Instant language switching
* Persistent user preferences

### 🔐 Role-Based Access

* 👨‍💼 Admin – system analytics & control
* 👨‍⚕️ Doctor – patient treatment workspace
* 👩‍⚕️ Nurse – triage & vitals management
* 🧑‍💼 Receptionist – patient registration
* 🧑‍🦱 Patient – health dashboard

### 📱 Patient Portal

* Personal health dashboard
* Medical history tracking
* Appointment management
* AI insights

---

## 🚀 Quick Start

### 📌 Prerequisites

* Node.js 18+
* Git installed

---

### ⚙️ Installation

```bash
git clone https://github.com/thamizhselvan07/med_link.git
cd med_link
```

### Backend Setup

```bash
cd backend
npm install
node server.js
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Demo Credentials

| Role         | Username     | Password        |
| ------------ | ------------ | --------------- |
| Admin        | admin        | admin123        |
| Doctor       | doctor       | doctor123       |
| Nurse        | nurse        | nurse123        |
| Receptionist | receptionist | receptionist123 |
| Patient      | patient      | patient123      |

---

## 🏗️ Tech Stack

### Frontend

* React 18
* Vite
* TailwindCSS
* Axios

### Backend

* Node.js
* Express.js
* SQLite
* JWT Authentication

### AI/ML

* Risk scoring system
* Priority-based triage logic

---

## 📊 API Endpoints

### Authentication

* POST /api/auth/login
* POST /api/auth/register

### Patients

* GET /api/patients/queue
* POST /api/patients

### Triage

* GET /triage/queue
* POST /triage/add

### Booking

* GET /booking/doctors
* POST /booking/book

---

## 📁 Project Structure

```
med_link/
├── backend/
├── frontend/
├── README.md
```

---

## 🏆 Hackathon Highlights

* ✅ Fully working full-stack system
* ✅ Real-time hospital workflow
* ✅ AI-powered decision system
* ✅ Clean UI + responsive design
* ✅ Scalable architecture

---

## 🚀 Future Enhancements

* WebSocket real-time updates
* SMS/email notifications
* Mobile app (React Native)
* Payment integration
* Telemedicine support

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch
3. Commit changes
4. Push and open PR

---

## 📄 License

MIT License

---

## 👨‍💻 Developer

**Thamizh Selvan Gopi**
GitHub: https://github.com/thamizhselvan07

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!

---

**Made with ❤️ for smarter healthcare**
