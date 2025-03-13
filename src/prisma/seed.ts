import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
    const users = [
        {
            id: uuidv4(),
            email: 'user1@example.com',
            name: 'User One',
            emailVerified: false,
            image: null,
            background: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: uuidv4(),
            email: 'user2@example.com',
            name: 'User Two',
            emailVerified: true,
            image: null,
            background: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: uuidv4(),
            email: 'user3@example.com',
            name: 'User Three',
            emailVerified: false,
            image: null,
            background: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: uuidv4(),
            email: 'user4@example.com',
            name: 'User Four',
            emailVerified: true,
            image: null,
            background: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: uuidv4(),
            email: 'user5@example.com',
            name: 'User Five',
            emailVerified: false,
            image: null,
            background: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: user,
        });
    }

    console.log('Users seeded:', users);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });