import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Download, Eye, Filter } from 'lucide-react';
import GlobalLayout from '../layouts/GlobalLayout';

const DoctorReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/doctor/reports`);
            if (res.data.success) {
                setReports(res.data.reports);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Available': return 'bg-emerald-100 text-emerald-700';
            case 'Reviewed': return 'bg-blue-100 text-blue-700';
            case 'Pending': return 'bg-amber-100 text-amber-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <GlobalLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reports</h1>
                        <p className="text-slate-500 font-medium">Patient medical reports and test results</p>
                    </div>
                    <button className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-all">
                        <Filter size={18} /> Filter
                    </button>
                </div>

                {/* Reports List */}
                <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
                    {loading ? (
                        <div className="p-20 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Patient</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Report Type</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {reports.map((report) => (
                                        <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-900">{report.patient_name}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <FileText size={16} className="text-slate-400" />
                                                    <span className="font-medium text-slate-700">{report.type}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-500 font-medium">{new Date(report.date).toLocaleDateString()}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(report.status)}`}>
                                                    {report.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-all" title="View">
                                                        <Eye size={18} />
                                                    </button>
                                                    <button className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-all" title="Download">
                                                        <Download size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </GlobalLayout>
    );
};

export default DoctorReports;
