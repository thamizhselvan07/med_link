import React, { useState } from 'react';
import axios from 'axios';
import {
    Stethoscope, Clock, Heart, Brain,
    Droplets, Zap, ChevronRight, Star,
    Search, Filter, MapPin
} from 'lucide-react';
import PatientLayout from '../../layouts/PatientLayout';
import { PrimaryButton } from '../../components/common/UIComponents';

import { useAuth } from '../../contexts/AuthContext';

const DoctorsList = () => {
    const { user } = useAuth();

    // Matches backend/data/doctors.json
    const doctors = [
        { id: 'D1', name: 'Dr. Priya Sharma', dept: 'Cardiology', availability: 'Available Today', rating: 4.9, icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
        { id: 'D2', name: 'Dr. Arjun Mehta', dept: 'General Medicine', availability: 'Available Tomorrow', rating: 4.8, icon: Stethoscope, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'D4', name: 'Dr. Kavya Reddy', dept: 'Emergency Medicine', availability: 'On Duty', rating: 5.0, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
        { id: 'D6', name: 'Dr. Anjali Desai', dept: 'Dermatology', availability: 'Available Monday', rating: 4.7, icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50' },
        { id: 'D3', name: 'Dr. Sanjay Kumar', dept: 'Pulmonology', availability: 'Available Today', rating: 4.9, icon: Droplets, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    ];

    const handleBook = async (doc) => {
        try {
            // Generate a random slot in the next 7 days for demo
            const slot = new Date();
            slot.setDate(slot.getDate() + Math.floor(Math.random() * 7) + 1); // 1-7 days ahead
            slot.setHours(9 + Math.floor(Math.random() * 9), 0, 0, 0); // 9 AM - 5 PM
            if (Math.random() > 0.5) slot.setMinutes(30); // 0 or 30 mins

            const slotISO = slot.toISOString();
            console.log("Booking Slot (Frontend):", slotISO);

            const API_BASE = `${import.meta.env.VITE_API_URL}`;
            const res = await axios.post(`${API_BASE}/api/appointments/book`, {
                patient_id: user?.id || 'P001',
                doctor_id: doc.id,
                slot_time: slotISO,
                branch: 'Main Branch'
            });

            if (res.data.success) {
                // Log activity
                const activity = JSON.parse(localStorage.getItem('activity_log') || '[]');
                activity.unshift({
                    time: new Date().toISOString(),
                    action: 'Appointment Booked',
                    details: `Booked appointment with Dr. ${doc.name}`
                });
                localStorage.setItem('activity_log', JSON.stringify(activity));

                alert(`Appointment request sent! \n\nWaiting for Doctor Confirmation.\n\nYou will get an SMS when approved.`);
            }
        } catch (error) {
            console.error("Booking Error:", error);
            const msg = error.response?.data?.message || error.message || 'Booking failed. The slot might be taken.';
            alert(`Booking Failed: ${msg}`);
        }
    };

    return (
        <PatientLayout>
            <div className="space-y-10 animate-slide-up">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Our Specialists</h1>
                        <p className="text-slate-500 font-medium">Top-rated doctors ready to provide expert clinical care.</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-[30px] border border-slate-100 flex flex-col md:flex-row items-center gap-4">
                    <div className="flex items-center gap-4 flex-1 w-full px-4 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0">
                        <Search className="text-slate-300" size={20} />
                        <input
                            type="text"
                            placeholder="Find a specialist..."
                            className="bg-transparent border-none outline-none font-bold text-slate-900 w-full placeholder:text-slate-300"
                        />
                    </div>
                    <div className="flex items-center gap-6 px-4">
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-blue-600" />
                            <span className="text-sm font-bold text-slate-900">Main Branch</span>
                        </div>
                        <button className="text-slate-400 hover:text-blue-600 transition-all font-bold text-sm"><Filter size={18} /></button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {doctors.map((doc, i) => (
                        <div key={i} className="bg-white p-8 rounded-[50px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group flex flex-col items-center text-center">
                            <div className="relative mb-6">
                                <div className={`w-24 h-24 rounded-[35px] ${doc.bg} ${doc.color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                                    <doc.icon size={48} />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-2xl shadow-lg flex items-center gap-1">
                                    <Star size={12} className="text-amber-400 fill-amber-400" />
                                    <span className="text-[10px] font-black">{doc.rating}</span>
                                </div>
                            </div>

                            <div className="space-y-1 mb-6">
                                <h3 className="text-xl font-black text-slate-900 truncate max-w-[200px]">{doc.name}</h3>
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{doc.dept}</p>
                            </div>

                            <div className="w-full flex items-center justify-center gap-3 mb-8">
                                <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5 uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> {doc.availability}
                                </div>
                            </div>

                            <button
                                onClick={() => handleBook(doc)}
                                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 group-hover:bg-blue-600 transition-all active:scale-95"
                            >
                                Book Consultation <ChevronRight size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="bg-slate-900 rounded-[50px] p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 -mr-16"><Stethoscope size={200} /></div>
                    <div className="relative z-10 space-y-4 max-w-xl text-center md:text-left">
                        <h2 className="text-3xl font-black tracking-tight">Virtual Consultation Available</h2>
                        <p className="text-slate-400 font-medium">Connect with our top specialists from the comfort of your home. Video triage available for non-emergency cases.</p>
                    </div>
                    <button className="relative z-10 bg-white text-slate-900 px-10 py-5 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition-all shadow-2xl shadow-white/5">
                        Start Video Triage
                    </button>
                </div>
            </div>
        </PatientLayout>
    );
};

export default DoctorsList;
