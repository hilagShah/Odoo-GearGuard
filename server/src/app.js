const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const equipmentRoutes = require('./routes/equipment.routes');
const teamRoutes = require('./routes/teams.routes');
const requestRoutes = require('./routes/requests.routes');
const authRoutes = require('./routes/auth.routes');

app.use('/api/equipment', equipmentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('GearGuard API is running');
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = { app, prisma };
