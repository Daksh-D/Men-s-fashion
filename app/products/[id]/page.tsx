// app/products/[id]/page.tsx
"use client"
import { notFound } from 'next/navigation';
import type { Product } from '@/types';
import ProductDetails from './ProductDetails'; // Client Component
import { useState, useEffect } from 'react';


interface ProductPageProps {
  params: {
    id: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      async function fetchProduct(id: string): Promise<void> {
        try{
          const res = await fetch(`/api/products/${id}`, { cache: 'no-store' });

          if (!res.ok) {
            if (res.status === 404) {
                setProduct(null);
                return;
            } else {
              throw new Error(`Failed to fetch product: ${res.status}`);
            }

          }
          const data = await res.json();
          setProduct(data);
        }
        catch(err: any)
        {
          setError(err.message);
        }
        finally{
          setLoading(false);
        }
      }

    fetchProduct(params.id);
  }, [params.id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

  if (!product) {
    notFound(); //This should be called conditionally
    return null; //Not found should be called before returning
  }

  return <ProductDetails product={product} />;
}