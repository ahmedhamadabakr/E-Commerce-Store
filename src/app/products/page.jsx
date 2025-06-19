import Card from "../card/card";

export default async function ProductsPage() {
  let products = [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/products`,
      { cache: "no-store" }
    );
    if (res.ok) {
      products = await res.json();
    }
  } catch (e) {
    products = [];
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-12">All Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.length === 0 && (
          <div className="col-span-full text-center text-gray-500">
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
