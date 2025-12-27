const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    try {
        const decoded = jwt.verify(token.split(' ')[1], JWT_SECRET); // Bearer <token>
        req.userId = decoded.id;
        req.role = decoded.role;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Validations
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => {
    // >8 chars (9+), at least 1 lowercase, 1 uppercase, 1 special char
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{9,})/;
    return regex.test(password);
};

// Signup
router.post('/signup', async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        if (!validateEmail(email)) return res.status(400).json({ error: 'Invalid email format' });
        if (!validatePassword(password)) {
            return res.status(400).json({
                error: 'Password must be >8 characters, include uppercase, lowercase, and special character.'
            });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ error: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = role || 'Portal User';

        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: userRole
            }
        });

        res.json({ message: 'User created successfully', userId: newUser.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ error: 'Account not exist' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid Password' });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

        res.json({ token, role: user.role, name: user.name });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
