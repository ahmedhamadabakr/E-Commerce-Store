"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { User, Mail, Shield, Edit, ShoppingCart, Package } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  // Redirect if not authenticated
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You must be logged in to view your profile
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Main Content */}
      <div className="max-w-4xl pt-6 mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="px-6 py-8 text-center bg-gradient-to-r from-blue-600 to-indigo-600">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {session.user.name || "User Profile"}
                </h2>
                <p className="text-blue-100 text-sm">
                  Welcome to your personal dashboard
                </p>
              </div>

              {/* Profile Information */}
              <div className="px-6 py-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">
                        {session.user.email}
                      </p>
                    </div>
                  </div>

                  {/* User ID */}
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                    <Shield className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">User ID</p>
                      <p className="font-medium text-gray-900 font-mono text-sm">
                        {session.user.id?.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account Status */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-blue-900">
                        Account Status
                      </p>
                      <p className="text-sm text-blue-700">
                        Active and verified
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Quick Actions</h3>
              </div>
              <div className="p-4 space-y-3">
                <Link
                  href="/cart"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-colors group"
                >
                  <ShoppingCart className="w-5 h-5 text-blue-600 group-hover:text-blue-700" />
                  <span className="font-medium text-gray-700 group-hover:text-blue-700">
                    View Cart
                  </span>
                </Link>

                <Link
                  href="/products"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-green-50 transition-colors group"
                >
                  <Package className="w-5 h-5 text-green-600 group-hover:text-green-700" />
                  <span className="font-medium text-gray-700 group-hover:text-green-700">
                    Browse Products
                  </span>
                </Link>

                {/* Admin Actions */}
                {session.user.email &&
                  ["ahmedhamadabakr77@gmail.com"].includes(
                    session.user.email
                  ) && (
                    <Link
                      href="/addProdect"
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 transition-colors group"
                    >
                      <Edit className="w-5 h-5 text-purple-600 group-hover:text-purple-700" />
                      <span className="font-medium text-gray-700 group-hover:text-purple-700">
                        Add Product
                      </span>
                    </Link>
                  )}
              </div>
            </div>

            {/* Account Info Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">
                  Account Information
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Member Since</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date().toLocaleDateString()//if we  access it must be seend this data from session
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Last Login</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Account Type</span>
                  <span className="text-sm font-medium text-blue-600">
                    {session.user.email &&
                    ["ahmedhamadabakr77@gmail.com"].includes(session.user.email)
                      ? "Administrator"
                      : "Customer"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
