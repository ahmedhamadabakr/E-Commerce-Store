"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { status } = useSession();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cart");
      setCart(stored ? JSON.parse(stored) : []);
    }
  }, []);

  if (status !== "authenticated") {
    return <div className="min-h-screen flex items-center justify-center text-xl text-red-600">يجب تسجيل الدخول لرؤية السلة</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4 text-center">سلة المشتريات</h2>
        {cart.length === 0 ? (
          <div className="text-gray-500 text-center">السلة فارغة</div>
        ) : (
          <ul className="divide-y">
            {cart.map((item, idx) => (
              <li key={idx} className="py-2 flex justify-between">
                <span>{item.title}</span>
                <span className="font-bold">${item.price}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 