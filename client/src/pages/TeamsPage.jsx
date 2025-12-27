import React, { useState, useEffect } from 'react';
import { Users, Plus, Shield, Trash2 } from 'lucide-react';
import api from '../api/axios';

const TeamsPage = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTeam, setNewTeam] = useState({ name: '', type: 'General' });

    const fetchTeams = async () => {
        try {
            const res = await api.get('/teams');
            setTeams(res.data);
        } catch (error) {
            console.error("Failed to fetch teams", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/teams', newTeam);
            setIsModalOpen(false);
            setNewTeam({ name: '', type: 'General' });
            fetchTeams();
        } catch (error) {
            alert('Failed to create team');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this team?")) return;
        try {
            await api.delete(`/teams/${id}`);
            fetchTeams();
        } catch (error) {
            console.error(error);
            alert("Failed to delete team");
        }
    };

    if (loading) return <div className="p-8 text-white">Loading teams...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Maintenance Teams</h1>
                    <p className="text-gray-400">Manage technicians and departments</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus size={20} />
                    Add Team
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map((team) => (
                    <div key={team.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors group relative">
                        <div className="flex items-start justify-between mb-4">
                            <div className="bg-blue-500/10 p-3 rounded-lg">
                                <Users className="text-blue-500" size={24} />
                            </div>
                            <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
                                {team.type}
                            </span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-1">{team.name}</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Active Technicians
                        </p>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <Shield size={14} />
                                <span>ID: {team.id}</span>
                            </div>
                            <button
                                onClick={() => handleDelete(team.id)}
                                className="text-gray-600 hover:text-red-400 transition-colors p-1"
                                title="Delete Team"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
                        <h2 className="text-xl font-bold text-white mb-4">Add Maintenance Team</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="text-gray-400 text-sm">Team Name</label>
                                <input
                                    className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                                    value={newTeam.name}
                                    onChange={e => setNewTeam({ ...newTeam, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm">Type</label>
                                <select
                                    className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                                    value={newTeam.type}
                                    onChange={e => setNewTeam({ ...newTeam, type: e.target.value })}
                                >
                                    <option>General</option>
                                    <option>IT</option>
                                    <option>Mechanical</option>
                                    <option>Electrical</option>
                                    <option>Facilities</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
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
                                    Create Team
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamsPage;
