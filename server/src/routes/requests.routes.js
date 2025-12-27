const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all requests
router.get('/', async (req, res) => {
    try {
        const requests = await prisma.maintenanceRequest.findMany({
            include: { Equipment: true, Technician: true }
        });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Request (Auto-assignment logic)
router.post('/', async (req, res) => {
    try {
        const { subject, description, type, equipmentId, priority, scheduledDate } = req.body;

        // Auto-assignment: Check equipment's assigned team
        const equipment = await prisma.equipment.findUnique({
            where: { id: parseInt(equipmentId) },
            include: { Team: true }
        });

        if (!equipment) return res.status(404).json({ error: "Equipment not found" });

        // Create request
        const newRequest = await prisma.maintenanceRequest.create({
            data: {
                subject,
                description,
                type,
                priority: priority || "Medium",
                equipmentId: parseInt(equipmentId),
                scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
                status: "New"
            }
        });

        res.json(newRequest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update workflow status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body; // New, In Progress, Repaired, Scrap
        const requestId = parseInt(req.params.id);

        const updatedRequest = await prisma.maintenanceRequest.update({
            where: { id: requestId },
            data: { status }
        });

        // Workflow Logic: If status is Scrap, update Equipment status
        if (status === 'Scrap') {
            await prisma.equipment.update({
                where: { id: updatedRequest.equipmentId },
                data: { status: 'Scrap' }
            });
        }

        // Logic: If status is Repaired, maybe set Equipment to Active if it was Maintenance?
        if (status === 'Repaired') {
            await prisma.equipment.update({
                where: { id: updatedRequest.equipmentId },
                data: { status: 'Active' }
            });
        }

        res.json(updatedRequest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete request
router.delete('/:id', async (req, res) => {
    try {
        await prisma.maintenanceRequest.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ message: 'Request deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
