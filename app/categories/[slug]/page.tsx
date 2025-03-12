// app/categories/[slug]/page.tsx
"use client" // Added

import Image from 'next/image';
import Link from 'next/link';
import { notFound, } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { categories } from '@/lib/data';
import type { Product } from '@/types';
import { useState, useEffect } from 'react'; // Import useState and useEffect


interface CategoryPageProps {
  params: {
    slug: string;
  };
}


export default function CategoryPage({ params }: CategoryPageProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const category = categories.find((cat) => cat.name.toLowerCase() === params.slug);

    useEffect(() => {
        async function fetchProductsByCategory(category: string): Promise<void> {
            try {
              const res = await fetch(`/api/products?category=${category}`, {
                cache: 'no-store'  // Still use no-store (or force-cache) for dynamic updates
                });
                if (!res.ok) {
                  throw new Error('Failed to fetch products');
                }
                const data = await res.json();
                setProducts(data);

            }
            catch(err: any)
            {
                setError(err.message);
            }
            finally{
              setLoading(false);
            }

        }
        if(category){
          fetchProductsByCategory(category.name.toLowerCase());
        }

    }, [category]);


  if (!category) {
    notFound(); // Fine here; notFound() is special
  }
    if (loading) {
        return <div>Loading...</div>; // Or a proper loading indicator
    }

    if (error) {
        return <div>Error: {error}</div>
    }

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
                    src={product.images?.[0] || '/placeholder-image.jpg'}
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