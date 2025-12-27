import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Wrench, MoreVertical, Brain, Activity, X } from 'lucide-react';
import api from '../api/axios';

const EquipmentPage = () => {
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // AI Predictor State
    const [isPredictModalOpen, setIsPredictModalOpen] = useState(false);
    const [analyzingItem, setAnalyzingItem] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [prediction, setPrediction] = useState(null);

    // New Equipment Form State
    const [formData, setFormData] = useState({
        name: '',
        serialNumber: '',
        location: '',
        department: '',
        status: 'Active',
        purchaseDate: new Date().toISOString().split('T')[0],
        warrantyEnd: new Date().toISOString().split('T')[0],
    });

    const fetchEquipment = async () => {
        try {
            const response = await api.get('/equipment');
            setEquipment(response.data);
        } catch (error) {
            console.error('Error fetching equipment:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEquipment();
    }, []);

    const calculateHealth = (item) => {
        // Simple mock algorithm
        // Base health: 100
        // - 10 per year of age
        // - 20 if status is Maintenance
        // - 50 if status is Scrap
        let health = 100;
        const ageYears = (new Date() - new Date(item.purchaseDate)) / (1000 * 60 * 60 * 24 * 365);
        health -= Math.floor(ageYears) * 5;
        if (item.status === 'Maintenance') health -= 20;
        if (item.status === 'Scrap') health = 0;
        return Math.max(0, Math.min(100, health)); // Clamp 0-100
    };

    const runAIPrediction = (item) => {
        setAnalyzingItem(item);
        setIsPredictModalOpen(true);
        setIsAnalyzing(true);
        setPrediction(null);

        // Simulate AI analysis delay
        setTimeout(() => {
            setIsAnalyzing(false);
            const health = calculateHealth(item);
            const failureDays = Math.floor(health * 0.5 + Math.random() * 30);
            setPrediction({
                health,
                failureDays,
                recommendation: health > 70 ? 'Optimal Condition' : health > 40 ? 'Preventive Maintenance Recommended' : 'Urgent Repair Required',
                nextMaintenanceDate: new Date(Date.now() + failureDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });
        }, 2000);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/equipment', formData);
            setIsModalOpen(false);
            setFormData({
                name: '',
                serialNumber: '',
                location: '',
                department: '',
                status: 'Active',
                purchaseDate: new Date().toISOString().split('T')[0],
                warrantyEnd: new Date().toISOString().split('T')[0],
            });
            fetchEquipment();
        } catch (error) {
            alert('Failed to add equipment. Ensure Serial Number is unique.');
        }
    };

    const filteredEquipment = equipment.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-white">Loading...</div>;

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Equipment Management</h1>
                    <p className="text-gray-400">Track, manage, and analyze facility assets</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus size={20} />
                    Add Equipment
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search equipment..."
                        className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg border border-gray-700 flex items-center gap-2 hover:bg-gray-700">
                    <Filter size={20} />
                    Filters
                </button>
            </div>

            {/* Table */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-900/50 text-gray-400 text-sm">
                        <tr>
                            <th className="p-4">Equipment Name</th>
                            <th className="p-4">Serial Number</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Health Score</th>
                            <th className="p-4">AI Insight</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-300">
                        {filteredEquipment.map((item) => {
                            const health = calculateHealth(item);
                            let healthColor = 'bg-green-500';
                            if (health < 70) healthColor = 'bg-yellow-500';
                            if (health < 40) healthColor = 'bg-red-500';

                            return (
                                <tr key={item.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                                <Wrench className="text-blue-500" size={16} />
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{item.name}</div>
                                                <div className="text-xs text-gray-500">{item.location}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono text-sm">{item.serialNumber}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs flex items-center w-fit gap-1 ${item.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`} />
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="w-24 bg-gray-700 rounded-full h-2 mb-1">
                                            <div className={`${healthColor} h-2 rounded-full`} style={{ width: `${health}%` }}></div>
                                        </div>
                                        <span className="text-xs text-gray-400">{health}% Condition</span>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => runAIPrediction(item)}
                                            className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors text-sm border border-purple-500/30 px-2 py-1 rounded hover:bg-purple-500/10"
                                        >
                                            <Brain size={14} />
                                            Predict
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={async () => {
                                                if (window.confirm('Delete this equipment?')) {
                                                    await api.delete(`/equipment/${item.id}`);
                                                    fetchEquipment();
                                                }
                                            }}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <MoreVertical size={18} className="hidden" />
                                            <span className="text-xs border border-gray-600 px-2 py-1 rounded hover:border-red-500">Delete</span>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* AI Prediction Modal */}
            {isPredictModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border-2 border-purple-500/30 shadow-2xl relative overflow-hidden">
                        {/* Decorative Background Element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                        <button
                            onClick={() => setIsPredictModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Brain className="text-purple-400" />
                            AI Maintenance Insight
                        </h2>

                        {isAnalyzing ? (
                            <div className="py-8 text-center">
                                <Activity className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-pulse" />
                                <h3 className="text-lg font-medium text-white mb-2">Analyzing Sensors...</h3>
                                <p className="text-gray-400 text-sm">Processing telemetry and historical data for {analyzingItem?.name}</p>
                            </div>
                        ) : prediction && (
                            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-gray-400 text-sm">Predicted Health</span>
                                        <span className="text-2xl font-bold text-white">{prediction.health}%</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-1000 ${prediction.health > 70 ? 'bg-green-500' : prediction.health > 40 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                            style={{ width: `${prediction.health}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-700/30 p-3 rounded-lg border border-gray-600/50">
                                        <div className="text-xs text-gray-400 mb-1">Est. Failure</div>
                                        <div className="text-lg font-semibold text-white">{prediction.failureDays} Days</div>
                                    </div>
                                    <div className="bg-gray-700/30 p-3 rounded-lg border border-gray-600/50">
                                        <div className="text-xs text-gray-400 mb-1">Next Service</div>
                                        <div className="text-lg font-semibold text-blue-300">{format(new Date(prediction.nextMaintenanceDate), 'MMM d')}</div>
                                    </div>
                                </div>

                                <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg">
                                    <h4 className="text-purple-300 text-sm font-semibold mb-1">Recommendation</h4>
                                    <p className="text-gray-300 text-sm">{prediction.recommendation}</p>
                                </div>

                                <button
                                    onClick={() => {
                                        // Logic to auto-create request could go here
                                        setIsPredictModalOpen(false);
                                        // Ideally navigate to requests page with params, but for now just close
                                        alert(`Quick Action: Scheduled maintenance for ${analyzingItem?.name} on ${prediction.nextMaintenanceDate}`);
                                    }}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition-colors"
                                >
                                    Schedule {prediction.health > 70 ? 'Checkup' : 'Repair'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700">
                        <h2 className="text-xl font-bold text-white mb-4">Add New Equipment</h2>
                        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-gray-400 text-sm">Name</label>
                                <input
                                    className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm">Serial Number</label>
                                <input
                                    className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                                    value={formData.serialNumber}
                                    onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm">Location</label>
                                <input
                                    className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm">Department</label>
                                <input
                                    className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                                    value={formData.department}
                                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm">Purchase Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                                    value={formData.purchaseDate}
                                    onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm">Warranty End</label>
                                <input
                                    type="date"
                                    className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                                    value={formData.warrantyEnd}
                                    onChange={e => setFormData({ ...formData, warrantyEnd: e.target.value })}
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-300 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                                >
                                    Save Equipment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Formatting Helper if not imported
import { format } from 'date-fns';

export default EquipmentPage;
