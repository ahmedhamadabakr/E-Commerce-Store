"use client";
import Card from "../card/card";
import axios from "axios";
import { useEffect, useState } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/products");
        setProducts(res.data);
      } catch {
        setProducts([]);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-10">
            No products found.
          </div>
        )}
        {products.map((product) => (
          <Card key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
