"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    if (res.error) setError(res.error);
    else router.push("/");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <div className="w-full max-w-md p-8 sm:p-10 bg-white rounded-3xl shadow-2xl border border-blue-100 flex flex-col gap-8">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-4xl font-extrabold text-blue-800 tracking-tight drop-shadow-sm">Welcome Back</h2>
          <p className="text-gray-500 text-lg">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && <div className="text-red-600 text-center font-semibold bg-red-50 border border-red-200 rounded-lg py-2">{error}</div>}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-blue-700 font-semibold">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="border border-blue-200 rounded-xl p-3 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 bg-blue-50"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-blue-700 font-semibold">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="border border-blue-200 rounded-xl p-3 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 bg-blue-50"
              required
            />
          </div>
          <button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-bold py-3 rounded-xl shadow-xl text-xl tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all disabled:opacity-60" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="flex flex-col gap-2 mt-2 items-center">
          <span className="text-center text-gray-600">Don't have an account?</span>
          <Link href="/register" className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-2 px-6 rounded-xl text-center transition-all shadow">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
} 