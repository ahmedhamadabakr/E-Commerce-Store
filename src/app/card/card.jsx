import Link from "next/link";
import { memo } from "react";
import { ShoppingCart, Eye } from "lucide-react";
import { OptimizedImage } from "@/utils/imageOptimization";

const Card = memo(({ product }) => {
  const hasValidImage =
    product?.photos?.[0] &&
    typeof product.photos[0] === "string" &&
    product.photos[0].trim() !== "";

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <Link
        href={`/card/${product._id}`}
        className="block relative h-48 overflow-hidden group"
      >
        <OptimizedImage
          src={hasValidImage ? product.photos[0] : null}
          alt={product.title || "Product image"}
          width={400}
          height={300}
          className="object-cover w-full h-full transition-all duration-300"
          priority={false}
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />

        <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-1-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-4">
            <div className="bg-white rounded-full p-2 shadow-lg">
              <Eye className="w-5 h-5 text-gray-700" />
            </div>
            <div className="bg-blue-600 rounded-full p-2 shadow-lg">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </Link>

      <div className="p-4 flex-1 flex flex-col">
        <Link
          href={`/card/${product._id}`}
          className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors duration-200 line-clamp-2"
        >
          {product.title}
        </Link>

        {product.description && (
          <p className="text-gray-600 mt-2 text-sm line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-2xl font-bold text-blue-600">${product.price}</p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-sm text-gray-500 line-through">
                ${product.originalPrice}
              </p>
            )}
          </div>

          <div className="flex space-x-2">
            <Link
              href={`/card/${product._id}`}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              View Details
            </Link>

            <button
              className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              aria-label="Add to cart"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

Card.displayName = "Card";

export default Card;
