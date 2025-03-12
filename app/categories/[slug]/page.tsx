// app/categories/[slug]/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { notFound, } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { categories } from '@/lib/data';
import type { Product } from '@/types';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

async function fetchProductsByCategory(category: string): Promise<Product[]> {
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || ''; // Use environment variable
    const res = await fetch(`${baseURL}/api/products?category=${category}`, {
        cache: 'no-store' // Now safe to use no-store
    });
    if (!res.ok) {
      throw new Error('Failed to fetch products');
    }
    return res.json();
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = categories.find((cat) => cat.name.toLowerCase() === params.slug);

  if (!category) {
    notFound(); // Use Next.js's notFound function
  }

  const products = await fetchProductsByCategory(params.slug); // Fetch the products

  return (
     <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
          <p className="text-muted-foreground">{category.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product._id} href={`/products/${product._id}`} className="group">
              <div className="bg-card rounded-lg overflow-hidden border">
                <div className="relative aspect-square">
                  <Image
                    src={product.images?.[0] || '/placeholder-image.jpg'} // Corrected image handling
                    alt={product.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">
                      ${product.price.toFixed(2)}
                    </span>
                    <Button variant="secondary" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
    </div>
  );
}