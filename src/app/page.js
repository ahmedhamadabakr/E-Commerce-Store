"use client";
import Link from "next/link";
import dynamic from "next/dynamic";

// تحميل ProductsPage بشكل ديناميكي لتحسين الأداء
const ProductsPage = dynamic(() => import("./products/page"), {
  loading: () => (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading products...</p>
      </div>
    </div>
  ),
  ssr: false, // تحميل على جانب العميل لتحسين الأداء الأولي
});

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
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
