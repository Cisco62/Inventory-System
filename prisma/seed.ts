import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Stack Auth user ID to own the sample products, e.g.
    // SEED_USER_ID=<your-user-id> npx prisma db seed
    const demoUserId = process.env.SEED_USER_ID;
    if (!demoUserId) {
        throw new Error("Set SEED_USER_ID to the Stack Auth user ID that should own the sample products.");
    }

    //Create sample products
    await prisma.product.createMany({
        data: Array.from({ length: 25 }).map((_, i) => ({
            userId: demoUserId,
            name: `Product ${i + 1}`,
            price: (Math.random() * 90 + 10).toFixed(2),
            quantity: Math.floor(Math.random() * 20),
            lowStockAt: 5,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * (i * 5)),
        })),
    }); 
    console.log("Seed data created successfully.");
    console.log("Created 25 products for user ID:", demoUserId);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });