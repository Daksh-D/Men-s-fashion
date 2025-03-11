// scripts/seed.ts (Option 1 - Generic Images)
import mongoose from 'mongoose';
import { connectDB, Product, IProduct } from '../lib/db';
import { faker, fakerEN_US } from '@faker-js/faker';

const categories = ['Shoes', 'Perfumes', 'Trousers', 'Shirts', 'T-Shirts', 'Accessories'];

type ProductCreate = Omit<IProduct, keyof mongoose.Document> & { _id?: mongoose.Types.ObjectId };

const generateFakeProduct = (): ProductCreate => ({
    name: fakerEN_US.commerce.productName(),
    description: fakerEN_US.commerce.productDescription(),
    price: parseFloat(fakerEN_US.commerce.price()),
    // Use faker.image.url() for generic images
    images: [
        fakerEN_US.image.url({ width: 640, height: 480 }), // Correct usage
        fakerEN_US.image.url({ width: 640, height: 480 }), // Correct usage
    ],
    category: fakerEN_US.helpers.arrayElement(categories),
    rating: fakerEN_US.number.int({ min: 1, max: 5 }),
    reviews: [],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [fakerEN_US.color.human(), fakerEN_US.color.human(), fakerEN_US.color.human()],
    inStock: fakerEN_US.datatype.boolean(),
    createdAt: new Date(),
});

// ... (rest of the seedDB function remains the same) ...

const seedDB = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB (seed script)');

        await Product.deleteMany({});
        console.log('Existing products deleted.');

        // Generate 20 fake products
        const products: ProductCreate[] = []; // Corrected type
        for (let i = 0; i < 20; i++) {
            products.push(generateFakeProduct());
        }

        await Product.insertMany(products);
        console.log('Products seeded successfully!');

    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

seedDB();