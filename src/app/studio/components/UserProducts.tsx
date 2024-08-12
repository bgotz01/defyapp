//src/app/studio/components/UserProducts.tsx

"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import Image from 'next/image';

const UserProducts = () => {
  const { user } = useUser();
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found, please log in.');
        return;
      }

      try {
        const response = await fetch('http://localhost:4000/api/products', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('Products not found');
          } else if (response.status === 401) {
            setError('Access denied');
          } else {
            setError('Failed to fetch products');
          }
          return;
        }

        const data = await response.json();
        setProducts(data);
      } catch (error) {
        if (error instanceof Error) {
          setError('Error fetching products: ' + error.message);
        } else {
          setError('An unknown error occurred');
        }
      }
    };

    if (user) {
      fetchProducts();
    }
  }, [user]);

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="product-list">
      {products.length > 0 ? (
        <ul>
          {products.map((product) => (
            <li key={product._id} className="mb-4 p-4 border rounded">
              <h3 className="text-xl font-semibold">{product.name}</h3>
              <p>Category: {product.category}</p>
              <p>Gender: {product.gender}</p>
              <p>Price: ${product.price}</p>
              <p>Description: {product.description}</p>
              <div className="relative w-32 h-32">
                <Image
                  src={product.imageUrl1}
                  alt={product.name}
                  layout="fill"
                  objectFit="cover"
                  className="rounded"
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No products found</p>
      )}
    </div>
  );
};

export default UserProducts;
