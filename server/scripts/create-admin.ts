import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
    const email = 'admin@autokos.com';
    const password = 'password123';
    const name = 'Admin User';

    try {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            console.log('User already exists. Updating role to ADMIN...');
            await prisma.user.update({
                where: { email },
                data: { role: 'ADMIN' }
            });
            console.log('User role updated to ADMIN.');
        } else {
            console.log('Creating new admin user...');
            const hashedPassword = await bcrypt.hash(password, 10);
            await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    role: 'ADMIN',
                    isVerified: true
                }
            });
            console.log(`Admin user created: ${email} / ${password} / ${name}`);
        }
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
