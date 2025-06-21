"use client";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Upload,
  X,
  Package,
  DollarSign,
  Hash,
  Tag,
  FileText,
  Shield,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function AddProduct() {
  const MAX_PHOTOS = 4;
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    quantity: "",
    category: "",
    photos: [],
  });

  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(null); // null = not checked yet
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Unified admin check and redirect
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const userEmail = session.user.email;
      const adminEmails = ["ahmedhamadabakr77@gmail.com"];
      const isUserAdmin = adminEmails.includes(userEmail);//اليوز اللى عندك كدا ادمن 
      setIsAdmin(isUserAdmin);
      if (!isUserAdmin) {
        router.push("/");
      }
    }
  }, [session, status, router]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photos" && files) {
      let selectedFiles = Array.from(files).slice(0, MAX_PHOTOS); // to transform image to array
      setForm((prev) => ({ ...prev, photos: selectedFiles })); //to up data form
      setPreviews(selectedFiles.map((file) => URL.createObjectURL(file))); //to display after drag
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // to change attribute in classname where drag image
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation(); //prevent an event from propagating
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Verifies that the user actually downloaded files
      const files = Array.from(e.dataTransfer.files)
        .filter((file) => file.type.startsWith("image/"))
        .slice(0, MAX_PHOTOS - form.photos.length);
      if (files.length > 0) {
        const newPhotos = [...form.photos, ...files];
        setForm((prev) => ({ ...prev, photos: newPhotos }));
        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setPreviews((prev) => [...prev, ...newPreviews]);
      }
    }
  };

  const handleRemovePhoto = (index) => {
    const updatedPhotos = form.photos.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, photos: updatedPhotos }));
    setPreviews(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.price ||
      !form.quantity ||
      !form.category.trim()
    ) {
      setMessage("Please fill in all required fields");
      setLoading(false);
      return;
    }
    if (parseFloat(form.price) <= 0) {
      setMessage("Price must be greater than 0");
      setLoading(false);
      return;
    }
    if (parseInt(form.quantity) < 0) {
      setMessage("Quantity cannot be negative");
      setLoading(false);
      return;
    }
    try {
      let res;
      if (form.photos.length > 0) {
        const fd = new FormData();
        fd.append("title", form.title.trim());
        fd.append("description", form.description.trim());
        fd.append("price", parseFloat(form.price));
        fd.append("quantity", parseInt(form.quantity));
        fd.append("category", form.category.trim());
        form.photos.forEach((file) => {
          fd.append("photos", file);
        });
        res = await axios.post("/api/products", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await axios.post("/api/products", {
          title: form.title.trim(),
          description: form.description.trim(),
          price: parseFloat(form.price),
          quantity: parseInt(form.quantity),
          category: form.category.trim(),
          photos: [],
        });
      }
      const data = await res.data;
      if (data.success) {
        setMessage("Product added successfully!");
        setForm({
          title: "",
          description: "",
          price: "",
          quantity: "",
          category: "",
          photos: [],
        });
        setPreviews([]);
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.error || "Error adding product. Please try again.");
      }
    } catch (err) {
      setMessage("Error: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Show loading until admin status is determined
  if (
    status === "loading" ||
    (status === "authenticated" && isAdmin === null)
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (status !== "authenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You must be logged in to access this page
          </p>
          <Link
            href="/login"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return null; // Already redirected
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-xl font-semibold text-gray-800">
              Add New Product
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Form Header */}
          <div className="px-6 py-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center space-x-3 mb-2">
              <Package className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Create New Product</h2>
            </div>
            <p className="text-blue-100">
              Add a new product to your store inventory
            </p>
            <p className="text-blue-200 text-sm mt-2">
              Welcome, {session?.user?.name} (Admin)
            </p>
          </div>

          {/* Form */}
          <div className="p-6 lg:p-8">
            {message && (
              <div
                className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
                  message.includes("successfully")
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
              >
                {message.includes("successfully") ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="font-medium">{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Title *
                </label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe your product in detail"
                    required
                    rows={4}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none text-black"
                  />
                </div>
              </div>

              {/* Price and Quantity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="price"
                      type="number"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                      min="0"
                      step="0.01"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="quantity"
                      type="number"
                      value={form.quantity}
                      onChange={handleChange}
                      placeholder="0"
                      required
                      min="0"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="e.g., Electronics, Clothing, Books"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images (up to {MAX_PHOTOS})
                </label>

                {/* Drag & Drop Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">
                    Drag and drop images here, or click to select
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Select Images</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    name="photos"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleChange}
                    className="hidden"
                  />
                </div>

                {/* Image Previews */}
                {previews.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Selected Images:
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {previews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(index)}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-60 disabled:transform-none flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Adding Product...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Add Product</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
