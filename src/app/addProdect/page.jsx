"use client";
import { useState, useRef } from "react";
import axios from "axios";

export default function AddProduct() {
  const MAX_PHOTOS = 4;

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
  const formDataRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "photos" && files) {
      let selectedFiles = Array.from(files).slice(0, MAX_PHOTOS);
      setForm((prev) => ({ ...prev, photos: selectedFiles }));
      setPreviews(selectedFiles.map((file) => URL.createObjectURL(file)));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
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
    // Collect data in ref
    formDataRef.current = {
      title: form.title,
      description: form.description,
      price: form.price,
      quantity: form.quantity,
      category: form.category,
      photos: form.photos,
    };
    try {
      let res;
      if (form.photos.length > 0) {
        // Send as FormData
        const fd = new FormData();
        fd.append("title", form.title);
        fd.append("description", form.description);
        fd.append("price", form.price);
        fd.append("quantity", form.quantity);
        fd.append("category", form.category);
        form.photos.forEach((file, idx) => {
          fd.append("photos", file);
        });
        res = await axios.post("/api/products", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // Send as JSON
        res = await axios.post("/api/products", {
          title: form.title,
          description: form.description,
          price: form.price,
          quantity: form.quantity,
          category: form.category,
          photos: [],
        });
      }
      const data = await res.data;
      if (data.success) {
        setMessage("Product saved successfully!");
        setForm({ title: "", description: "", price: "", quantity: "", category: "", photos: [] });
        setPreviews([]);
      } else {
        setMessage("Error saving product. Please try again.");
      }
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-10 bg-white/90 rounded-3xl shadow-2xl mt-14 border border-blue-100 backdrop-blur-md">
      <h2 className="text-4xl font-extrabold mb-10 text-center text-blue-800 tracking-tight drop-shadow-sm">
        Create a New Product
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Enter product name"
          required
          className="input input-bordered border-blue-200 rounded-xl p-4 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe your product in detail"
          required
          className="input input-bordered border-blue-200 rounded-xl p-4 h-32 resize-none text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
        />

        <div className="flex flex-col sm:flex-row gap-6">
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            placeholder="Price (USD)"
            required
            min={0}
            className="input input-bordered w-full border-blue-200 rounded-xl p-4 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
          />
          <input
            name="quantity"
            type="number"
            value={form.quantity}
            onChange={handleChange}
            placeholder="Available quantity"
            required
            min={0}
            className="input input-bordered w-full border-blue-200 rounded-xl p-4 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
          />
        </div>

        <input
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="Product category (e.g. Electronics, Clothing)"
          required
          className="input input-bordered border-blue-200 rounded-xl p-4 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
        />

        <label className="block">
          <span className="text-blue-700 font-semibold mb-2 block">
            Product Images{" "}
            <span className="text-gray-500">(up to 4 images)</span>:
          </span>
          <input
            name="photos"
            type="file"
            accept="image/*"
            multiple
            onChange={handleChange}
            disabled={form.photos.length >= MAX_PHOTOS}
            className="block mt-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all duration-200"
          />
        </label>

        {previews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
            {previews.map((src, idx) => (
              <div key={idx} className="relative group">
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-80 hover:opacity-100 shadow-lg transition-all text-lg font-bold group-hover:scale-110"
                  title="Remove image"
                >
                  &times;
                </button>
                <img
                  src={src}
                  alt={"`Product Image ${idx + 1}`"}
                  className="w-24 h-24 object-cover rounded-xl border shadow-md hover:scale-105 transition-transform duration-200"
                />
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-xl mt-6 shadow-xl text-xl tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all disabled:opacity-60"
        >
          {loading ? "Saving..." : "Publish Product"}
        </button>
        {message && (
          <div className={`text-center mt-4 font-semibold ${message.startsWith("Error") ? "text-red-600" : "text-green-700"}`}>{message}</div>
        )}
      </form>
    </div>
  );
}
