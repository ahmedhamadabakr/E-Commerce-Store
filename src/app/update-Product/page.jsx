"use client";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Upload,
  X,
  Package,
  DollarSign,
  Hash,
  Tag,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function EditProduct() {
  const MAX_PHOTOS = 4;
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    quantity: "",
    category: "",
    photos: [],
  });

  const [previews, setPreviews] = useState([]); // الصور القديمة + الجديدة
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setMessage("");
        console.log("start fetch");
        const res = await axios.get(`/api/products/editproduct?id=${id}`);
        console.log(res.data);
        if (res.data && res.data.product) {
          const fetchedProduct = res.data.product;
          setForm({
            title: fetchedProduct.title || "",
            description: fetchedProduct.description || "",
            price: fetchedProduct.price?.toString() || "",
            quantity: fetchedProduct.quantity?.toString() || "",
            category: fetchedProduct.category || "",
            photos: [],
          });
          setPreviews(fetchedProduct.photos || []);
        } else {
          setMessage("Product not found");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setMessage("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const adminEmails = [
        "ahmedhamadabakr77@gmail.com",
        "f.mumen@drwazaq8.com",
      ];
      const isUserAdmin = adminEmails.includes(session.user.email);
      setIsAdmin(isUserAdmin);
      if (!isUserAdmin) router.push("/");
    }
  }, [session, status, router]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photos" && files) {
      let selectedFiles = Array.from(files).slice(0, MAX_PHOTOS);
      setForm((prev) => ({ ...prev, photos: selectedFiles }));
      const newPreviews = selectedFiles.map((file) =>
        URL.createObjectURL(file)
      );
      setPreviews((prev) => [
        ...prev.filter((p) => typeof p === "string"),
        ...newPreviews,
      ]);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

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
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
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
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setPreviews(updatedPreviews);
    if (index >= previews.length - form.photos.length) {
      const updatedPhotos = form.photos.filter(
        (_, i) => i !== index - (previews.length - form.photos.length)
      );
      setForm((prev) => ({ ...prev, photos: updatedPhotos }));
    }
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

    if (parseFloat(form.price) <= 0 || parseInt(form.quantity) < 0) {
      setMessage("Price must be > 0 and quantity >= 0");
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
        form.photos.forEach((file) => fd.append("photos", file));

        res = await axios.put(`/api/products/editproduct?id=${id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await axios.put(`/api/products/editproduct?id=${id}`, {
          title: form.title.trim(),
          description: form.description.trim(),
          price: parseFloat(form.price),
          quantity: parseInt(form.quantity),
          category: form.category.trim(),
        });
      }

      if (res.data.success) {
        setMessage("Product updated successfully!");
        queryClient.invalidateQueries(["products"]);
        router.push("/products");
      } else {
        setMessage(res.data.error || "Error updating product.");
      }
    } catch (err) {
      setMessage("Error: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (
    status === "loading" ||
    (status === "authenticated" && isAdmin === null)
  ) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (status !== "authenticated" || !isAdmin) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <Package className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Update Product</h2>
          </div>
          <p className="text-blue-100">Edit this product's details</p>
        </div>

        <div className="p-6 lg:p-8">
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
                message.includes("success")
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              {message.includes("success") ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Field */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4" />
                <span>Product Title</span>
              </label>
              <input
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter product title"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black"
              />
            </div>

            {/* Description Field */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4" />
                <span>Description</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter product description"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none text-black"
              />
            </div>

            {/* Price and Quantity Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Price</span>
                </label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black"
                />
              </div>
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Hash className="w-4 h-4" />
                  <span>Quantity</span>
                </label>
                <input
                  name="quantity"
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black"
                />
              </div>
            </div>

            {/* Category Field */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Package className="w-4 h-4" />
                <span>Category</span>
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black"
              >
                <option value="">Select a category</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Books">Books</option>
                <option value="Home & Garden">Home & Garden</option>
                <option value="Sports">Sports</option>
                <option value="Toys">Toys</option>
                <option value="Health & Beauty">Health & Beauty</option>
                <option value="Automotive">Automotive</option>
                <option value="Food & Beverages">Food & Beverages</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images (up to {MAX_PHOTOS})
              </label>
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

              {previews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
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
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-60 disabled:transform-none flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Update Product</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
