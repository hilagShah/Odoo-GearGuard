import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Search, Plus, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const KPICard = ({ title, subtitle, subtext, colorClass, borderColorClass, bgClass }) => (
    <div className={`p-6 rounded-xl border-2 ${borderColorClass} ${bgClass} flex flex-col items-center justify-center text-center h-32 cursor-pointer transition-transform hover:scale-105 shadow-sm`}>
        <h3 className={`${colorClass} font-medium mb-1 uppercase tracking-wider text-xs`}>{title}</h3>
        <p className={`${colorClass} text-2xl font-bold`}>{subtitle}</p>
        <p className={`${colorClass} text-xs opacity-80 mt-1`}>{subtext}</p>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState({ requests: [], equipment: [], teams: [] });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Quick Create State
    const [newRequest, setNewRequest] = useState({ subject: '', priority: 'Medium', equipmentId: '', scheduledDate: '' });

    const fetchData = async () => {
        try {
            const [reqRes, eqRes, teamRes] = await Promise.all([
                api.get('/requests'),
                api.get('/equipment'),
                api.get('/teams')
            ]);
            setData({
                requests: reqRes.data,
                equipment: eqRes.data,
                teams: teamRes.data
            });
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // KPI Calculations
    const criticalEqCount = data.equipment.filter(e => e.status === 'Scrap' || e.status === 'Maintenance').length;
    const totalEqCount = data.equipment.length;

    const activeRequests = data.requests.filter(r => r.status === 'New' || r.status === 'In Progress').length;
    // Calculate Technician Load (Assignments)
    const assignedTechs = new Set(data.requests.map(r => r.technicianId).filter(id => id)).size;
    const loadPercentage = assignedTechs > 0 ? Math.round((activeRequests / (assignedTechs * 5)) * 100) : 0;

    const pendingRequests = data.requests.filter(r => r.status === 'New').length;
    const overdueRequests = data.requests.filter(r => r.scheduledDate && new Date(r.scheduledDate) < new Date()).length;

    // Handlers
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this request?")) return;
        try {
            await api.delete(`/requests/${id}`);
            setData(prev => ({
                ...prev,
                requests: prev.requests.filter(r => r.id !== id)
            }));
        } catch (error) {
            alert("Failed to delete request");
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/requests', {
                ...newRequest,
                type: 'Corrective', // Default
                equipmentId: parseInt(newRequest.equipmentId)
            });
            setIsModalOpen(false);
            setNewRequest({ subject: '', priority: 'Medium', equipmentId: '', scheduledDate: '' });
            fetchData(); // Refresh
        } catch (error) {
            alert('Failed to create request');
        }
    };

    // Filter
    const filteredRequests = data.requests.filter(req =>
        req.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (req.Technician?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-sm">
                <div className="mb-4 md:mb-0">
                    <h1 className="text-xl font-bold text-white">Maintenance Overview</h1>
                    <p className="text-sm text-gray-400">Welcome, {user?.name}</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold border border-gray-300 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                    >
                        <Plus size={18} />
                        New
                    </button>
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search requests..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-600 bg-gray-700 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard
                    title="Critical Equipment"
                    subtitle={`${criticalEqCount} Units`}
                    subtext={`(Total: ${totalEqCount} tracked)`}
                    colorClass="text-red-400"
                    borderColorClass="border-red-400"
                    bgClass="bg-red-400/10"
                />

                <KPICard
                    title="Technician Load"
                    subtitle={`${loadPercentage}% Utilized`}
                    subtext={`(${activeRequests} Active Tasks)`}
                    colorClass="text-blue-400"
                    borderColorClass="border-blue-400"
                    bgClass="bg-blue-400/10"
                />

                <KPICard
                    title="Open Requests"
                    subtitle={`${pendingRequests} Pending`}
                    subtext={`${overdueRequests} Overdue`}
                    colorClass="text-green-400"
                    borderColorClass="border-green-400"
                    bgClass="bg-green-400/10"
                />
            </div>

            {/* Activity Table */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-700 text-gray-300 border-b border-gray-600">
                            <tr>
                                <th className="p-4 font-semibold">Subject</th>
                                <th className="p-4 font-semibold">Technician</th>
                                <th className="p-4 font-semibold">Equipment</th>
                                <th className="p-4 font-semibold">Stage</th>
                                <th className="p-4 font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-200 divide-y divide-gray-700">
                            {loading ? (
                                <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr>
                            ) : filteredRequests.length === 0 ? (
                                <tr><td colSpan="5" className="p-4 text-center text-gray-500">No matching requests.</td></tr>
                            ) : filteredRequests.slice(0, 10).map((req) => (
                                <tr key={req.id} className="hover:bg-gray-700/50 transition-colors">
                                    <td className="p-4 font-medium">{req.subject}</td>
                                    <td className="p-4 text-blue-300">{req.Technician?.name || 'Unassigned'}</td>
                                    <td className="p-4 text-gray-400">{req.Equipment?.name || 'Unknown'}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs ${req.status === 'New' ? 'bg-blue-500/20 text-blue-300' :
                                                req.status === 'In Progress' ? 'bg-yellow-500/20 text-yellow-300' :
                                                    'bg-green-500/20 text-green-300'
                                            }`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleDelete(req.id)}
                                            className="text-gray-500 hover:text-red-400 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-bold text-white mb-4">Quick Request</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="text-gray-400 text-sm">Subject</label>
                                <input
                                    className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                                    value={newRequest.subject}
                                    onChange={e => setNewRequest({ ...newRequest, subject: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm">Equipment</label>
                                <select
                                    className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                                    value={newRequest.equipmentId}
                                    onChange={e => setNewRequest({ ...newRequest, equipmentId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Equipment</option>
                                    {data.equipment.map(eq => (
                                        <option key={eq.id} value={eq.id}>{eq.name} ({eq.serialNumber})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm">Priority</label>
                                <select
                                    className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                                    value={newRequest.priority}
                                    onChange={e => setNewRequest({ ...newRequest, priority: e.target.value })}
                                >
                                    <option>Low</option>
                                    <option>Medium</option>
                                    <option>High</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm">Scheduled Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                                    value={newRequest.scheduledDate || ''}
                                    onChange={e => setNewRequest({ ...newRequest, scheduledDate: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium mt-4"
                            >
                                Create Request
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
