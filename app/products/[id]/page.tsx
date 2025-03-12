// app/products/[id]/page.tsx
import { notFound } from 'next/navigation';
import type { Product } from '@/types';
import ProductDetails from './ProductDetails'; // Client Component
import { headers } from 'next/headers';


interface ProductPageProps {
  params: {
    id: string;
  };
}

async function fetchProduct(id: string): Promise<Product | null> {
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL || ''; // Use environment variable

  const res = await fetch(`${baseURL}/api/products/${id}`, { cache: 'no-store' });

  if (!res.ok) {
    if (res.status === 404) {
        return null;
    } else {
       throw new Error(`Failed to fetch product: ${res.status}`);
    }

  }
  return res.json();
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await fetchProduct(params.id);

  if (!product) {
    notFound();
  }

  return <ProductDetails product={product} />;
}