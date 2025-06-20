"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "",
    address: "",
    age: "",
  });
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
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    try {
      console.log("REGISTER API CALLED");
      const res = await axios.post("/api/auth/register", { ...form }, {
        headers: { "Content-Type": "application/json" }
      });
      if (res.data && res.data.success) {
        router.push("/login");
      } else if (res.data && res.data.error) {
        setError(res.data.error);
        console.log(error);
      } else {
        setError("Registration failed");
        console.log(error);
      }
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 px-4">
      <div className="w-full max-w-2xl p-8 sm:p-12 bg-white rounded-3xl shadow-2xl border border-blue-100 space-y-8">
        <header className="text-center space-y-2">
          <h2 className="text-4xl font-extrabold text-blue-800 tracking-tight">
            Create Account
          </h2>
          <p className="text-gray-600">Sign up to access your dashboard</p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {error && (
            <div className="col-span-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-center font-medium">
              {error}
            </div>
          )}

          {[
            ["firstName", "First Name"],
            ["lastName", "Last Name"],
            ["email", "Email", "email"],
            ["phone", "Phone", "tel"],
            ["address", "Address"],
            ["age", "Age", "number"],
            ["password", "Password", "password"],
            ["confirmPassword", "Confirm Password", "password"],
          ].map(([name, label, type = "text"]) => (
            <div className="flex flex-col gap-1" key={name}>
              <label htmlFor={name} className="text-blue-700 font-semibold">
                {label}
              </label>
              <input
                id={name}
                name={name}
                type={type}
                value={form[name]}
                onChange={handleChange}
                placeholder={label}
                className="input border border-blue-200 rounded-xl p-3 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50"
                required={
                  name !== "phone" && name !== "address" && name !== "age"
                }
              />
            </div>
          ))}

          <div className="col-span-2 flex flex-col gap-1">
            <label htmlFor="gender" className="text-blue-700 font-semibold">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
              className="input border border-blue-200 rounded-xl p-3 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-xl shadow-xl text-xl tracking-wide focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </div>
        </form>

        <div className="text-center space-y-2">
          <p className="text-gray-600">Already have an account?</p>
          <a
            href="/login"
            className="inline-block bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-2 px-6 rounded-xl transition-all shadow"
          >
            Login
          </a>
        </div>
      </div>
    </section>
  );
}
