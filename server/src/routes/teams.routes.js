const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all teams
router.get('/', async (req, res) => {
    try {
        const teams = await prisma.maintenanceTeam.findMany({
            include: { Users: true }
        });
        res.json(teams);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create team
router.post('/', async (req, res) => {
    try {
        const { name, type } = req.body;
        const newTeam = await prisma.maintenanceTeam.create({
            data: { name, type }
        });
        res.json(newTeam);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete team
router.delete('/:id', async (req, res) => {
    try {
        await prisma.maintenanceTeam.delete({
            where: { id: parseInt(req.params.id) }
        });
        res.json({ message: 'Team deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
