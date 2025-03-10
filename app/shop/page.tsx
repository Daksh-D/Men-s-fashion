import Link from 'next/link';

export default function Shop() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Shop</h1>
      <p>Welcome to the shop! Check out our <Link href="/categories" className="text-blue-500 hover:underline">categories</Link>.</p>
    </div>
  );
}