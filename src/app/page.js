import Link from "next/link";

export default async function Home() {
  // جلب المنتجات من API
  let products = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/products`, { cache: "no-store" });
    if (res.ok) {
      products = await res.json();
    }
  } catch (e) {
    products = [];
  }

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
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">All Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.length === 0 && (
              <div className="col-span-full text-center text-gray-500">No products found.</div>
            )}
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                <Link href={`/products/prodect/${product._id}`} className="block relative h-48">
                  {product.photos && product.photos.length > 0 ? (
                    <img
                      src={product.photos[0]}
                      alt={product.title}
                      className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">No Image</div>
                  )}
                </Link>
                <div className="p-4 flex-1 flex flex-col">
                  <Link
                    href={`/products/prodect/${product._id}`}
                    className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors"
                  >
                    {product.title}
                  </Link>
                  <p className="text-gray-600 mt-2 font-bold">${product.price}</p>
                  <Link
                    href={`/products/id/${product._id}`}
                    className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
