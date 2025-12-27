const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Create Teams
    const teamIT = await prisma.maintenanceTeam.create({
        data: { name: 'IT Support', type: 'IT' }
    });
    const teamMech = await prisma.maintenanceTeam.create({
        data: { name: 'Mechanical Crew', type: 'Mechanical' }
    });

    // Create Users (Technicians & Admins)
    const passwordHash = await bcrypt.hash('Password@123', 10);

    const tech1 = await prisma.user.create({
        data: {
            name: 'John Doe',
            email: 'john@gearguard.com',
            password: passwordHash,
            role: 'Technician',
            teamId: teamIT.id
        }
    });

    const admin = await prisma.user.create({
        data: {
            name: 'Admin User',
            email: 'admin@gearguard.com',
            password: passwordHash,
            role: 'Admin',
            teamId: null
        }
    });

    const tech2 = await prisma.user.create({
        data: {
            name: 'Jane Smith',
            email: 'jane@gearguard.com',
            password: passwordHash,
            role: 'Technician',
            teamId: teamMech.id
        }
    });

    // Create Equipment
    const laptop = await prisma.equipment.create({
        data: {
            name: 'Dell XPS 15',
            serialNumber: 'DX123456',
            purchaseDate: new Date('2023-01-15'),
            warrantyEnd: new Date('2026-01-15'),
            location: 'Office 101',
            department: 'Sales',
            teamId: teamIT.id
        }
    });

    const drill = await prisma.equipment.create({
        data: {
            name: 'Bosch Power Drill',
            serialNumber: 'BPD98765',
            purchaseDate: new Date('2022-05-10'),
            warrantyEnd: new Date('2024-05-10'),
            location: 'Workshop A',
            department: 'Operations',
            teamId: teamMech.id
        }
    });

    // Create One Request
    await prisma.maintenanceRequest.create({
        data: {
            subject: 'Laptop Overheating',
            description: 'Fan makes loud noise and shuts down.',
            type: 'Corrective',
            priority: 'High',
            equipmentId: laptop.id,
            technicianId: tech1.id,
            status: 'In Progress'
        }
    });

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
