"use client";
import Link from "next/link";
import ProductsPage from "./products/page";

export default function Home() {
  return (
    <>
      <section className="relative h-[600px] bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-5xl font-bold mb-4">Welcome to Sports Store</h1>
            <p className="text-xl mb-8">
              Your one-stop shop for all sports equipment and accessories
            </p>
            <Link
              href="/products"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>
      <ProductsPage />
    </>
  );
}
