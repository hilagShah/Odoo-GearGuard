import React, { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    useDroppable,
    useDraggable
} from '@dnd-kit/core';
import {
    sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import { Plus, Calendar, User } from 'lucide-react';
import api from '../api/axios';
import { format } from 'date-fns';

const DroppableColumn = ({ id, title, requests, count }) => {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className="bg-gray-800 rounded-lg p-4 flex flex-col h-full min-h-[500px] border border-gray-700"
        >
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
                <h3 className="font-semibold text-gray-200">{title}</h3>
                <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
                    {count}
                </span>
            </div>
            <div className="flex-1 space-y-3">
                {requests.map((req) => (
                    <DraggableCard key={req.id} request={req} />
                ))}
            </div>
        </div>
    );
};

const DraggableCard = ({ request }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: request.id,
        data: { ...request },
    });

    const style = transform
        ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
        : undefined;

    const priorityColor = {
        High: 'text-red-400 bg-red-400/10',
        Medium: 'text-yellow-400 bg-yellow-400/10',
        Low: 'text-green-400 bg-green-400/10',
    }[request.priority] || 'text-gray-400';

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="bg-gray-700 p-3 rounded-md shadow-sm border border-gray-600 cursor-grab hover:border-blue-500 transition-colors"
        >
            <div className="flex justify-between items-start mb-2">
                <span className={`text-xs px-2 py-0.5 rounded ${priorityColor}`}>
                    {request.priority}
                </span>
                <span className="text-xs text-gray-500">#{request.id}</span>
            </div>
            <h4 className="text-white font-medium text-sm mb-1">{request.subject}</h4>
            <p className="text-gray-400 text-xs mb-3 line-clamp-2">{request.description}</p>

            <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                    <User size={12} />
                    <span>{request.Technician?.name || 'Unassigned'}</span>
                </div>
                {request.scheduledDate && (
                    <div className="flex items-center gap-1 text-blue-300">
                        <Calendar size={12} />
                        <span>{format(new Date(request.scheduledDate), 'MMM d')}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const RequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        priority: 'Medium',
        equipmentId: '',
        type: 'Corrective',
        scheduledDate: ''
    });
    const [equipmentList, setEquipmentList] = useState([]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const fetchData = async () => {
        try {
            const [reqRes, eqRes] = await Promise.all([
                api.get('/requests'),
                api.get('/equipment')
            ]);
            setRequests(reqRes.data);
            setEquipmentList(eqRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (!over) return;

        const requestId = active.id;
        const newStatus = over.id; // Droppable ID is the status

        // Optimistic Update
        const updatedRequests = requests.map(req =>
            req.id === requestId ? { ...req, status: newStatus } : req
        );
        setRequests(updatedRequests);

        try {
            await api.put(`/requests/${requestId}/status`, { status: newStatus });
        } catch (error) {
            console.error("Failed to update status", error);
            fetchData(); // Revert on error
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/requests', {
                ...formData,
                equipmentId: parseInt(formData.equipmentId)
            });
            setIsModalOpen(false);
            setFormData({ subject: '', description: '', priority: 'Medium', equipmentId: '', type: 'Corrective', scheduledDate: '' });
            fetchData();
        } catch (error) {
            alert('Failed to create request');
        }
    };

    const columns = ['New', 'In Progress', 'Repaired', 'Scrap'];

    if (loading) return <div className="p-8 text-white">Loading requests...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Maintenance Requests</h1>
                    <p className="text-gray-400">Manage and track maintenance workflows</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus size={20} />
                    New Request
                </button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
                    {columns.map((status) => (
                        <DroppableColumn
                            key={status}
                            id={status}
                            title={status}
                            requests={requests.filter((r) => r.status === status)}
                            count={requests.filter((r) => r.status === status).length}
                        />
                    ))}
                </div>
                <DragOverlay>
                    {/* Optional: Add drag overlay for better visual */}
                </DragOverlay>
            </DndContext>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
                        <h2 className="text-xl font-bold text-white mb-4">New Maintenance Request</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="text-gray-400 text-sm">Subject</label>
                                <input
                                    className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                                    value={formData.subject}
                                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm">Description</label>
                                <textarea
                                    className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-gray-400 text-sm">Priority</label>
                                    <select
                                        className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                                        value={formData.priority}
                                        onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                    >
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-gray-400 text-sm">Type</label>
                                    <select
                                        className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option>Corrective</option>
                                        <option>Preventive</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm">Scheduled Date (Optional)</label>
                                <input
                                    type="date"
                                    className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                                    value={formData.scheduledDate || ''}
                                    onChange={e => setFormData({ ...formData, scheduledDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm">Equipment</label>
                                <select
                                    className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600"
                                    value={formData.equipmentId}
                                    onChange={e => setFormData({ ...formData, equipmentId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Equipment</option>
                                    {equipmentList.map(eq => (
                                        <option key={eq.id} value={eq.id}>{eq.name} ({eq.serialNumber})</option>
                                    ))}
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
                                    Create Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RequestsPage;
