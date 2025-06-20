import Image from "next/image";
import axios from "axios";

async function getProduct(id) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  try {
    const res = await axios.get(`${baseUrl}/api/products?id=${id}`);
    return res.data;
  } catch (error) {
    return null;
  }
}

export default async function ProductDetailPage({ params }) {
  const { id } = params;
  const product = await getProduct(id);

  if (!product || product.success === false) {
    return <div className="text-center text-red-500 py-10">Product not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      {product.photos && product.photos.length > 0 ? (
        <Image src={product.photos[0]} alt={product.title} width={500} height={350} className="rounded mb-4" />
      ) : (
        <div className="w-full h-64 flex items-center justify-center bg-gray-100 text-gray-400 mb-4">لا توجد صورة</div>
      )}
      <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
      <p className="text-gray-700 mb-4">{product.description}</p>
      <div className="text-xl font-semibold text-blue-600 mb-2">Price: {product.price} $</div>
      <div className="mb-2">Quantity: <span className="font-semibold">{product.quantity}</span></div>
      <div className="mb-4">Category: <span className="font-semibold">{product.category}</span></div>
    </div>
  );
} 