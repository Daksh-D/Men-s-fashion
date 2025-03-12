// File: scripts/seed.ts
import mongoose from 'mongoose';
import { connectDB, Product, IProduct } from '../lib/db';
import { faker, fakerEN_US } from '@faker-js/faker'; // Corrected import

const categories = ['Shoes', 'Perfumes', 'Trousers', 'Shirts', 'T-Shirts', 'Accessories'];

// Correct type: Use mongoose.mongo.OptionalId for creation
type ProductCreate = Omit<IProduct, keyof mongoose.Document> & { _id?: mongoose.Types.ObjectId };

const generateFakeProduct = (): ProductCreate => ({ // Corrected return type
    name: fakerEN_US.commerce.productName(),
    description: fakerEN_US.commerce.productDescription(),
    price: parseFloat(fakerEN_US.commerce.price()),
    images: [
      fakerEN_US.image.url({ width: 640, height: 480 }),  // Corrected image URL
      fakerEN_US.image.url({ width: 640, height: 480 }),  // Corrected image URL
    ],
    category: fakerEN_US.helpers.arrayElement(categories),
    rating: fakerEN_US.number.int({ min: 1, max: 5 }),
    reviews: [],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [fakerEN_US.color.human(), fakerEN_US.color.human(), fakerEN_US.color.human()],
    inStock: fakerEN_US.datatype.boolean(),
    createdAt: new Date(),
});

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