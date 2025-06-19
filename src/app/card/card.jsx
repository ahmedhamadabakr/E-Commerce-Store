import Link from "next/link";
import Image from "next/image";
export default function Card({ product }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
      <Link
        href={`/products/product/${product._id}`}
        className="block relative h-48"
      >
        {product.photos && product.photos.length > 0 ? (
          <Image
            src={product.photos[0]}
            alt={product.title}
            width={400} // أو أي عرض مناسب
            height={300} 
            className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            No Image
          </div>
        )}
      </Link>
      <div className="p-4 flex-1 flex flex-col">
        <Link
          href={`/id/${product._id}`}
          className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors"
        >
          {product.title}
        </Link>
        <p className="text-gray-600 mt-2 font-bold">${product.price}</p>
        <Link
          href={`/card/${product._id}`}
          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-center"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
