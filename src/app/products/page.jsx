"use client";
import Card from "../card/card";
import axios from "axios";
import { useEffect, useState } from "react";

// Loading Skeleton Component
const ProductSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200"></div>
    <div className="p-4">
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
      <div className="h-8 bg-gray-200 rounded"></div>
    </div>
  </div>
);

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await axios.get("/api/products");
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(true);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Loading State
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <h1 className="text-3xl font-bold text-gray-800">Loading Products...</h1>
          </div>
          <p className="text-gray-600 mt-2">Please wait while we fetch the latest products</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Failed to Load Products</h1>
          <p className="text-gray-600 mb-6">Sorry, we couldn't load the products. Please try again later.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main Content
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Products</h1>
      
      {products.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Products Available</h2>
          <p className="text-gray-600">We're currently updating our product catalog. Please check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Card key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
