// app/products/search/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';


async function fetchProductsBySearch(query: string): Promise<Product[]> {
  const res = await fetch(`http://localhost:3001/api/products/search?q=${query}`);
  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }
  return res.json();
}
interface SearchProps{
    searchParams:{
        q: string;
    }
}
export default async function SearchPage({searchParams}: SearchProps) {
 const query = searchParams.q;
  const products = await fetchProductsBySearch(query);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Search Results for &quot;{query}&quot;</h1>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`} className="group">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative w-full h-48">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold">{product.name}</h2>
                  <p className="text-gray-600 mt-1">${product.price.toFixed(2)}</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    View Details
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No products found for your query.</p>
      )}
    </div>
  );
}