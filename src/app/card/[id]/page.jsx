"use client";
import { use } from "react";
import ImageSlider from "./ImageSlider";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import { useCart } from "@/utils/useCart";

export default function ProductDetailPage({ params }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");
  const { addToCart, isInCart } = useCart();

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

  const handleAddToCart = async () => {
    if (status !== "authenticated") {
      Swal.fire({
        title: "Authentication Required",
        text: "Please sign in to add items to your cart",
        icon: "info",
        confirmButtonText: "Sign In",
      });
      return;
    }

    try {
      await addToCart(product._id, 1);
      
      setAdded(true);
      Swal.fire({
        title: "Added to Cart!",
        text: "Product has been added to your cart successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      // Reset added state after 3 seconds
      setTimeout(() => setAdded(false), 3000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      
      // تحقق من نوع الخطأ وعرض رسالة مناسبة
      let errorMessage = "Failed to add product to cart. Please try again.";
      let errorTitle = "Error";
      
      if (error.response && error.response.data && error.response.data.error) {
        const serverError = error.response.data.error;
        if (serverError.includes("Not enough stock")) {
          errorTitle = "Insufficient Stock";
          errorMessage = serverError;
        } else if (serverError.includes("Product not found")) {
          errorTitle = "Product Not Found";
          errorMessage = "This product is no longer available.";
        } else if (serverError.includes("Invalid product ID")) {
          errorTitle = "Invalid Product";
          errorMessage = "This product is not valid.";
        }
      }
      
      Swal.fire({
        title: errorTitle,
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "The product you're looking for doesn't exist."}
          </p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 pt-12">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/products"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Products
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <ImageSlider photos={product.photos || []} />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                {product.title}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-blue-600">
                  ${product.price}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xl text-gray-500 line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              {product.category && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 font-medium">Category:</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {product.category}
                  </span>
                </div>
              )}

              {product.quantity !== undefined && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600 font-medium">Stock:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.quantity > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.quantity > 0 ? `${product.quantity} available` : 'Out of stock'}
                  </span>
                </div>
              )}

              {product.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons - Fixed at Bottom */}
            <div className="space-y-3 mt-auto pt-4 border-t border-gray-100">
              {status === "authenticated" ? (
                <>
                  <button
                    onClick={handleAddToCart}
                    disabled={added || (product.quantity !== undefined && product.quantity <= 0)}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-green-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>
                      {added 
                        ? "Added to Cart!" 
                        : (product.quantity !== undefined && product.quantity <= 0) 
                          ? "Out of Stock" 
                          : "Add to Cart"
                      }
                    </span>
                  </button>
                  {added && (
                    <div className="text-center text-green-600 text-sm font-medium">
                      ✓ Product added to your cart successfully!
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 mb-3">
                    You must be logged in to add items to cart
                  </p>
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
  );
}
