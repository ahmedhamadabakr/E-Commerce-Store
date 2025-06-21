import Link from "next/link";
import Image from "next/image";
import { memo, useState } from "react";
import { ShoppingCart, Eye } from "lucide-react";

const Card = memo(({ product }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };


  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">

      
      <Link
        href={`/card/${product._id}`}
        className="block relative h-48 overflow-hidden group"
      >
        {product.photos && product.photos.length > 0 && !imageError ? (
          <>
            {/* Loading placeholder */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
            )}
            
            <Image
              src={product.photos[2]}
              alt={product.title}
              width={400}
              height={300}
              className={`object-cover w-full h-full transition-all duration-300 ${
                imageLoaded 
                  ? 'opacity-100 group-hover:scale-105' 
                  : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              priority={false}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
            
            {/* Overlay with icons */}
            <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-1-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-4">
                <div className="bg-white rounded-full p-2 shadow-lg">
                  <Eye className="w-5 h-5 text-gray-700" />
                </div>
                <div className="bg-blue-600 rounded-full p-2 shadow-lg">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-sm">No Image</p>
            </div>
          </div>
        )}
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
              <p className="text-sm text-gray-500 line-through">${product.originalPrice}</p>
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

Card.displayName = 'Card';

export default Card;
