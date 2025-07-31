"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  Package,
  Edit3,
  Trash2,
  Plus,
  Search,
  Eye,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Hash,
  Calendar,
  ExternalLink,
  Shield,
} from "lucide-react";
import Link from "next/link";

export default function AdminProducts() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isAdmin, setIsAdmin] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState("");

  // Check admin status
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const adminEmails = ["ahmedhamadabakr77@gmail.com","f.mumen@drwazaq8.com"];
      const isUserAdmin = adminEmails.includes(session.user.email);
      setIsAdmin(isUserAdmin);
      if (!isUserAdmin) router.push("/");
    }
  }, [session, status, router]);

  // Fetch products
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const response = await axios.get("/api/products");
      return response.data;
    },
    enabled: isAdmin === true,
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId) => {
      const response = await axios.delete(`/api/products/delete?id=${productId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-products"]);
      setDeleteMessage("Product deleted successfully!");
      setTimeout(() => setDeleteMessage(""), 3000);
    },
    onError: (error) => {
      setDeleteMessage(error.response?.data?.error || "Failed to delete product");
      setTimeout(() => setDeleteMessage(""), 3000);
    },
  });

  const handleDeleteProduct = async (productId, productTitle) => {
    if (window.confirm(`Are you sure you want to delete "${productTitle}"?`)) {
      deleteProductMutation.mutate(productId);
    }
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = [...new Set(products.map(product => product.category).filter(Boolean))];

  if (status === "loading" || (status === "authenticated" && isAdmin === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status !== "authenticated" || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="px-6 py-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-8 h-8" />
                <div>
                  <h1 className="text-3xl font-bold">Product Management</h1>
                  <p className="text-blue-100 mt-1">Manage your store products</p>
                </div>
              </div>
              <Link
                href="/addProdect"
                className="inline-flex items-center space-x-2 bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Product</span>
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>
              </div>
              <div className="md:w-64">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Package className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Products</p>
                    <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Eye className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Showing</p>
                    <p className="text-2xl font-bold text-gray-900">{filteredProducts.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Hash className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Categories</p>
                    <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {deleteMessage && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
            deleteMessage.includes("success") 
              ? "bg-green-50 border border-green-200 text-green-700" 
              : "bg-red-50 border border-red-200 text-red-700"
          }`}>
            {deleteMessage.includes("success") ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{deleteMessage}</span>
          </div>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                <div className="bg-gray-300 h-4 rounded mb-2"></div>
                <div className="bg-gray-300 h-4 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Products</h3>
            <p className="text-red-600">Failed to fetch products. Please try again.</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Products Found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || categoryFilter ? "Try adjusting your filters" : "Start by adding your first product"}
            </p>
            <Link
              href="/add-Product"
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Product</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Product Image */}
                <div className="relative h-48 bg-gray-200">
                  {product.photos && product.photos.length > 0 ? (
                    <img
                      src={product.photos[0]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-semibold text-gray-600">
                    {product.category}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1 text-green-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-bold text-lg">{product.price}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Hash className="w-4 h-4" />
                      <span className="text-sm">Stock: {product.quantity}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(product.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {product.updatedAt && (
                      <span>Updated: {new Date(product.updatedAt).toLocaleDateString()}</span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Link
                      href={`/products/${product._id}`}
                      className="flex-1 inline-flex items-center justify-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </Link>
                    <Link
                      href={`/update-Product?id=${product._id}`}
                      className="flex-1 inline-flex items-center justify-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={() => handleDeleteProduct(product._id, product.title)}
                      disabled={deleteProductMutation.isLoading}
                      className="flex-1 inline-flex items-center justify-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
