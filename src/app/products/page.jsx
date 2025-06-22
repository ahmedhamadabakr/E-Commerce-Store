"use client";
import { useQuery } from "@tanstack/react-query";
import { productsAPI } from "../../utils/api";
import dynamic from "next/dynamic";
import { Suspense, memo } from "react";

// تحميل Card بشكل ديناميكي
const Card = dynamic(() => import("../card/card"), {
  loading: () => <ProductSkeleton />,
  ssr: false,
});

// تحميل React Window بشكل ديناميكي
const { FixedSizeGrid: VirtualGrid } = dynamic(() => import("react-window"), {
  ssr: false,
});

// Loading Skeleton Component محسن
const ProductSkeleton = memo(() => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
    <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
      <div className="h-8 bg-gray-200 rounded"></div>
    </div>
  </div>
));

ProductSkeleton.displayName = "ProductSkeleton";

// Virtualized Product Grid
const VirtualizedProductGrid = memo(({ products, columnCount = 4 }) => {
  const rowCount = Math.ceil(products.length / columnCount);

  const Cell = ({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * columnCount + columnIndex;
    const product = products[index];

    if (!product) return null;

    return (
      <div style={style} className="p-2">
        <Card product={product} />
      </div>
    );
  };

  return (
    <VirtualGrid
      columnCount={columnCount}
      columnWidth={300}
      height={800}
      rowCount={rowCount}
      rowHeight={400}
      width={1200}
    >
      {Cell}
    </VirtualGrid>
  );
});

VirtualizedProductGrid.displayName = "VirtualizedProductGrid";

// Custom Hook للاستعلام
const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: productsAPI.getAll,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Loading Component محسن
const LoadingState = () => (
  <div className="container mx-auto px-4 py-16">
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        <h1 className="text-3xl font-bold text-gray-800">
          Loading Products...
        </h1>
      </div>
      <p className="text-gray-600 mt-2">
        Please wait while we fetch the latest products
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {Array.from({ length: 8 }).map((_, index) => (
        <ProductSkeleton key={index} />
      ))}
    </div>
  </div>
);

// Error Component محسن
const ErrorState = ({ error, refetch }) => (
  <div className="container mx-auto px-4 py-16">
    <div className="text-center">
      <div className="text-6xl mb-4">⚠️</div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Failed to Load Products
      </h1>
      <p className="text-gray-600 mb-6">
        {error?.message ||
          "Sorry, we couldn't load the products. Please try again later."}
      </p>
      <button
        onClick={refetch}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Try Again
      </button>
    </div>
  </div>
);

// Empty State Component
const EmptyState = () => (
  <div className="text-center py-16">
    <div className="text-6xl mb-4">📦</div>
    <h2 className="text-2xl font-bold text-gray-800 mb-4">
      No Products Available
    </h2>
    <p className="text-gray-600">
      We're currently updating our product catalog. Please check back soon!
    </p>
  </div>
);

// Main Products Page Component
export default function ProductsPage() {
  const { data: products, isLoading, error, refetch } = useProducts();

  // Loading State
  if (isLoading) {
    return <LoadingState />;
  }

  // Error State
  if (error) {
    return <ErrorState error={error} refetch={refetch} />;
  }

  // Main Content
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Products</h1>

      {!products || products.length === 0 ? (
        <EmptyState />
      ) : (
        <Suspense fallback={<LoadingState />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <Card key={product._id} product={product} />
            ))}
          </div>
        </Suspense>
      )}
    </div>
  );
}
