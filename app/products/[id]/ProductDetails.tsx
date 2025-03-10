//app/products/[id]/ProductDetails.tsx
"use client";

import Image from 'next/image';
import { Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart'; // Correct import
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Product } from '@/types';
import { useState } from 'react'; // Import useState

interface ProductDetailsProps {
  product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const cart = useCart();
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product.sizes?.[0]);   // Track selected size
  const [selectedColor, setSelectedColor] = useState<string | undefined>(product.colors?.[0]); // Track selected color

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover rounded-lg"
              priority
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {product.images.map((image, index) => (
              <div key={index} className="relative aspect-square">  {/*Added Key*/}
                <Image
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  fill
                  className="object-cover rounded-lg cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-2xl font-bold mb-4">${product.price.toFixed(2)}</p>
            <div className="flex items-center mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < (product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-muted-foreground">
                ({product.reviews?.length || 0} reviews) {/* Handle potential undefined */}
              </span>
            </div>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <div className="space-y-4">
             {product.sizes && product.sizes.length > 0 && (
                <div>
                <h3 className="font-semibold mb-2">Size</h3>
                <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                    <Button
                        key={size}
                        variant={selectedSize === size ? "default" : "outline"}
                        className="min-w-[60px]"
                        onClick={() => setSelectedSize(size)}
                    >
                        {size}
                    </Button>
                    ))}
                </div>
                </div>
            )}

            {product.colors && product.colors.length > 0 && (
                <div>
                <h3 className="font-semibold mb-2">Color</h3>
                <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                    <Button
                        key={color}
                        variant={selectedColor === color ? "default" : "outline"}
                        className="min-w-[80px]"
                        onClick={() => setSelectedColor(color)}
                    >
                        {color}
                    </Button>
                    ))}
                </div>
                </div>
            )}
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={() =>
              cart.addItem({
                id: crypto.randomUUID(), // Unique cart item ID
                productId: product._id,  // Use product._id
                name: product.name,
                price: product.price,
                image: product.images[0],
                quantity: 1,
                size: selectedSize, //  selected size
                color: selectedColor, //  selected color
              })
            }
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="description">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{product.description}</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="specifications">
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {product.reviews && product.reviews.length > 0 ? ( // Check for undefined reviews
                  product.reviews.map((review) => (
                    <div key={review.id} className="mb-4"> {/*Added Key */}
                      <p>{review.userName}: {review.comment}</p>
                      <p>Rating: {review.rating}/5</p>
                    </div>
                  ))
                ) : (
                  <p>No reviews yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}