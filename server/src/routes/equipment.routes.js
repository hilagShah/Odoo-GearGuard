const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all equipment
router.get('/', async (req, res) => {
    try {
        const equipment = await prisma.equipment.findMany({
            include: { Team: true, Requests: true }
        });
        res.json(equipment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create equipment
router.post('/', async (req, res) => {
    try {
        const { name, serialNumber, purchaseDate, warrantyEnd, location, department, teamId } = req.body;
        const newEquipment = await prisma.equipment.create({
            data: {
                name,
                serialNumber,
                purchaseDate: new Date(purchaseDate),
                warrantyEnd: new Date(warrantyEnd),
                location,
                department,
                teamId: teamId ? parseInt(teamId) : null
            }
        });
        res.json(newEquipment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update status (e.g. Scrap)
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const updated = await prisma.equipment.update({
            where: { id: parseInt(req.params.id) },
            data: { status }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete equipment
router.delete('/:id', async (req, res) => {
    try {
        await prisma.equipment.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ message: 'Equipment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
