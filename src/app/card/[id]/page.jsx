"use client";
import { use } from "react";
import ImageSlider from "./ImageSlider";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { ArrowLeft, ShoppingCart, } from "lucide-react";
import Link from "next/link";

export default function ProductDetailPage({ params }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        // Use relative URL to avoid network issues
        const res = await axios.get(`/api/products?id=${id}`);
        if (res.data && res.data.success !== false) {
          setProduct(res.data);
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (typeof window !== "undefined") {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existingItem = cart.find(item => item.id === product._id);
      
      if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
      } else {
        cart.push({
          id: product._id,
          title: product.title,
          price: product.price,
          quantity: 1,
          image: product.photos && product.photos.length > 0 ? product.photos[0] : null,
        });
      }
      
      localStorage.setItem("cart", JSON.stringify(cart));
      setAdded(true);
      
      // Reset added state after 3 seconds
      setTimeout(() => setAdded(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "The product you're looking for doesn't exist."}</p>
          <Link 
            href="/products"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Link 
              href="/products"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-800 truncate">
              {product.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-10">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          
          {/* Desktop Back Button */}
          <div className="hidden lg:block p-6 border-b border-gray-200">
            <Link 
              href="/products"
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Products</span>
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Images Section */}
            <div className="lg:w-1/2 p-6">
              <ImageSlider photos={product.photos} title={product.title} />
            </div>

            {/* Details Section */}
            <div className="lg:w-1/2 p-6 lg:p-8 flex flex-col min-h-0">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                {product.title}
              </h1>
              
              <div className="mb-6">
                <span className="text-3xl lg:text-4xl font-bold text-blue-600">
                  ${product.price}
                </span>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Category</span>
                  <span className="font-semibold text-gray-800">{product.category}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Available Quantity</span>
                  <span className="font-semibold text-gray-800">{product.quantity}</span>
                </div>
              </div>

              {/* Description Section - Optimized for Mobile */}
              <div className="mb-6 flex-1 min-h-0">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-none overflow-visible">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm lg:text-base break-words">
                    {product.description}
                  </div>
                </div>
              </div>

              {/* Action Buttons - Fixed at Bottom */}
              <div className="space-y-3 mt-auto pt-4 border-t border-gray-100">
                {status === "authenticated" ? (
                  <>
                    <button
                      onClick={handleAddToCart}
                      disabled={added}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-green-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>{added ? "Added to Cart!" : "Add to Cart"}</span>
                    </button>
                    {added && (
                      <div className="text-center text-green-600 text-sm font-medium">
                        ✓ Product added to your cart successfully!
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600 mb-3">You must be logged in to add items to cart</p>
                    <Link 
                      href="/login"
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
