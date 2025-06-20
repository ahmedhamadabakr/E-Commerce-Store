"use client";
import { use } from "react";
import ImageSlider from "./ImageSlider";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function ProductDetailPage({ params }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const [product, setProduct] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      try {
        const res = await axios.get(`${baseUrl}/api/products?id=${id}`);
        setProduct(res.data);
      } catch {
        setProduct(null);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product || product.success === false) {
    return (
      <div className="text-center text-red-500 py-10">Product not found</div>
    );
  }

  const handleAddToCart = () => {
    if (typeof window !== "undefined") {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      cart.push({
        id: product._id,
        title: product.title,
        price: product.price,
      });
      localStorage.setItem("cart", JSON.stringify(cart));
      setAdded(true);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-10">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 flex flex-col md:flex-row gap-8">
          {/* Images Section */}
          <div className="md:w-1/2 flex flex-col items-center">
            <ImageSlider photos={product.photos} title={product.title} />
          </div>
          {/* Details Section */}
          <div className="md:w-1/2 flex flex-col justify-center">
            <h1 className="text-3xl font-extrabold text-blue-900 mb-3">
              {product.title}
            </h1>
            <p className="text-gray-700 mb-5 text-lg leading-relaxed break-words overflow-auto max-h-60 whitespace-pre-line">
              {product.description}
            </p>
            <div className="mb-3">
              <span className="block text-gray-500">Price</span>
              <span className="text-2xl font-bold text-blue-700">
                {product.price} <span className="text-base font-normal">$</span>
              </span>
            </div>
            <div className="mb-2">
              <span className="block text-gray-500">Available Quantity</span>
              <span className="font-semibold text-gray-800">
                {product.quantity}
              </span>
            </div>
            <div className="mb-2">
              <span className="block text-gray-500">Category</span>
              <span className="font-semibold text-gray-800">
                {product.category}
              </span>
            </div>
            {/* Add to Cart Button */}
            {status === "authenticated" ? (
              <>
                <button
                  onClick={handleAddToCart}
                  className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  Add to Cart
                </button>
                {added && (
                  <div className="text-green-600 mt-2">
                    تمت الإضافة إلى السلة!
                  </div>
                )}
              </>
            ) : (
              <div className="mt-4 text-red-500">
                You must be logged in to add to cart.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
