import { PrismaClient, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding catalog...');

    // Clear existing data to make the seed script idempotent
    await prisma.inventory.deleteMany();
    await prisma.variant.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    // Categories
    const sportsCategory = await prisma.category.create({
        data: {
            name: 'Sports Shoes',
            slug: 'sports-shoes',
            description: 'Shoes designed for sports and running',
        },
    });

    const casualCategory = await prisma.category.create({
        data: {
            name: 'Casual Shoes',
            slug: 'casual-shoes',
            description: 'Comfortable everyday shoes',
        },
    });

    // Product 1
    const nikeAirMax = await prisma.product.create({
        data: {
            name: 'Nike Air Max',
            slug: 'nike-air-max',
            description: 'Premium running shoe with Air cushioning.',
            brand: 'Nike',
            status: ProductStatus.PUBLISHED,
            categoryId: sportsCategory.id,
        },
    });

    await prisma.productImage.createMany({
        data: [
            {
                productId: nikeAirMax.id,
                imageUrl:
                    'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
                isPrimary: true,
                sortOrder: 1,
            },
            {
                productId: nikeAirMax.id,
                imageUrl:
                    'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519',
                sortOrder: 2,
            },
        ],
    });

    const nikeVariant8 = await prisma.variant.create({
        data: {
            productId: nikeAirMax.id,
            sku: 'NIKE-AM-BLK-8',
            color: 'Black',
            size: '8',
            price: 499900,
            discountPrice: 449900,
        },
    });

    const nikeVariant9 = await prisma.variant.create({
        data: {
            productId: nikeAirMax.id,
            sku: 'NIKE-AM-BLK-9',
            color: 'Black',
            size: '9',
            price: 499900,
            discountPrice: 449900,
        },
    });

    await prisma.inventory.createMany({
        data: [
            {
                variantId: nikeVariant8.id,
                quantity: 10,
            },
            {
                variantId: nikeVariant9.id,
                quantity: 5,
            },
        ],
    });

    // Product 2
    const adidas = await prisma.product.create({
        data: {
            name: 'Adidas Ultraboost',
            slug: 'adidas-ultraboost',
            description: 'Responsive running shoe for daily training.',
            brand: 'Adidas',
            status: ProductStatus.PUBLISHED,
            categoryId: sportsCategory.id,
        },
    });

    const adidasVariant8 = await prisma.variant.create({
        data: {
            productId: adidas.id,
            sku: 'ADI-ULT-WHT-8',
            color: 'White',
            size: '8',
            price: 699900,
        },
    });

    const adidasVariant9 = await prisma.variant.create({
        data: {
            productId: adidas.id,
            sku: 'ADI-ULT-WHT-9',
            color: 'White',
            size: '9',
            price: 699900,
        },
    });

    await prisma.inventory.createMany({
        data: [
            {
                variantId: adidasVariant8.id,
                quantity: 20,
            },
            {
                variantId: adidasVariant9.id,
                quantity: 15,
            },
        ],
    });

    // Product 3
    const puma = await prisma.product.create({
        data: {
            name: 'Puma RS-X',
            slug: 'puma-rs-x',
            description: 'Stylish casual sneaker with chunky design.',
            brand: 'Puma',
            status: ProductStatus.PUBLISHED,
            categoryId: casualCategory.id,
        },
    });

    const pumaVariant8 = await prisma.variant.create({
        data: {
            productId: puma.id,
            sku: 'PUMA-RSX-RED-8',
            color: 'Red',
            size: '8',
            price: 399900,
        },
    });

    const pumaVariant9 = await prisma.variant.create({
        data: {
            productId: puma.id,
            sku: 'PUMA-RSX-RED-9',
            color: 'Red',
            size: '9',
            price: 399900,
        },
    });

    await prisma.inventory.createMany({
        data: [
            {
                variantId: pumaVariant8.id,
                quantity: 12,
            },
            {
                variantId: pumaVariant9.id,
                quantity: 8,
            },
        ],
    });

    console.log('✅ Catalog seed completed');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });