"use client";
import { useSession } from "next-auth/react";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Swal from "sweetalert2";
import { useCart } from "@/utils/useCart";

export default function CartPage() {
  const { data: session, status } = useSession();
  const { 
    cart, 
    loading, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getTotalPrice 
  } = useCart();

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      return;
    }
    
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      
      // تحقق من نوع الخطأ وعرض رسالة مناسبة
      let errorMessage = "Failed to update quantity. Please try again.";
      let errorTitle = "Error";
      
      if (error.response && error.response.data && error.response.data.error) {
        const serverError = error.response.data.error;
        if (serverError.includes("Not enough stock")) {
          errorTitle = "Insufficient Stock";
          errorMessage = serverError;
        } else if (serverError.includes("Product not found")) {
          errorTitle = "Product Not Found";
          errorMessage = "This product is no longer available.";
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

  const handleRemoveItem = async (productId) => {
    try {
      await removeFromCart(productId);
      Swal.fire({
        title: "Removed from Cart",
        text: "Product has been removed from your cart successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      
      // تحقق من نوع الخطأ وعرض رسالة مناسبة
      let errorMessage = "Failed to remove item. Please try again.";
      let errorTitle = "Error";
      
      if (error.response && error.response.data && error.response.data.error) {
        const serverError = error.response.data.error;
        if (serverError.includes("Product not found in cart")) {
          errorTitle = "Item Not Found";
          errorMessage = "This item is no longer in your cart.";
        } else if (serverError.includes("Cart not found")) {
          errorTitle = "Cart Error";
          errorMessage = "Your cart could not be found.";
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

  const handleCheckout = async () => {
    try {
      await clearCart();
      
      Swal.fire({
        title: "Order Placed Successfully!",
        text: "Your order has been placed and your cart has been cleared.",
        icon: "success",
        confirmButtonText: "Continue Shopping",
      });
    } catch (error) {

      
      // تحقق من نوع الخطأ وعرض رسالة مناسبة
      let errorMessage = "Failed to process checkout. Please try again.";
      let errorTitle = "Checkout Error";
      
      if (error.response && error.response.data && error.response.data.error) {
        const serverError = error.response.data.error;
        if (serverError.includes("Cart not found")) {
          errorTitle = "Cart Error";
          errorMessage = "Your cart could not be found.";
        } else if (serverError.includes("Failed to clear cart")) {
          errorTitle = "Clear Cart Error";
          errorMessage = "Failed to clear your cart. Please try again.";
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

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please sign in to view your shopping cart
          </p>
          <Link
            href="/login"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-6xl pt-12 mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="flex items-center text-gray-600 hover:text-gray-800 transition duration-300"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Continue Shopping
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <ShoppingBag className="w-8 h-8 mr-3 text-blue-600" />
            Shopping Cart
          </h1>
          <div className="w-20"></div>
        </div>

        {cart.items.length === 0 ? (
          /* Empty Cart */
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-8xl mb-6">🛒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link
              href="/products"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Cart Items ({cart.items.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {cart.items.map((item, index) => (
                    <div
                      key={index}
                      className="p-6 flex items-center space-x-4"
                    >
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.title}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="text-gray-400 text-2xl">📦</div>
                          )}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-800 truncate">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm">${item.price}</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, (item.quantity || 1) - 1)
                          }
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition duration-200 text-black"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-semibold text-black">
                          {item.quantity || 1}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, (item.quantity || 1) + 1)
                          }
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition duration-200 text-black"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="font-semibold text-gray-800">
                          ${(item.price * (item.quantity || 1)).toFixed(2)}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 transition duration-200"
                        title="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                  Order Summary
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cart.items.length} items)</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>${(getTotalPrice() * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-semibold text-gray-800">
                      <span>Total</span>
                      <span>${(getTotalPrice() * 1.1).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-300 transform hover:scale-105"
                >
                  Proceed to Checkout
                </button>

                <div className="mt-4 text-center">
                  <Link
                    href="/products"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
