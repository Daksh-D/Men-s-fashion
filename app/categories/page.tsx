// app/categories/page.tsx

import Image from 'next/image';
import Link from 'next/link';
import { categories } from '@/lib/data';

export default function Categories() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center mb-12">Our Categories</h1>
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.name.toLowerCase()}`}
              className="group relative h-64 overflow-hidden rounded-lg"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-2xl font-bold text-white">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">
          No categories available.
        </p>
      )}
    </div>
  );
}
