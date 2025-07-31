"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, ShoppingCart, User, Home, Info, Package } from "lucide-react";
import { useCart } from "@/utils/useCart";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { getItemCount } = useCart();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Navigation items array with icons
  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "About", href: "/about", icon: Info },
    { name: "Products", href: "/products", icon: Package },
  ];

  // Add Profile to navigation if authenticated
  if (status === "authenticated") {
    navItems.push({ name: "Profile", href: "/profile", icon: User });
  }

  const handleAuthClick = () => {
    if (status === "authenticated") {
      signOut();
    } else {
      router.push("/login");
    }
  };

  const isAdmin =
    status === "authenticated" &&
    session?.user?.email &&
    ["ahmedhamadabakr77@gmail.com"].includes(session.user.email);

  return (
    <>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg"
            : "bg-white/90 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center space-x-2 text-blue-600 font-bold text-xl hover:text-blue-700 transition-colors"
            >
              <Package className="w-8 h-8" />
              <span>Ecommerce</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              {/* Add Product button for admin */}
              {isAdmin && (
                <Link
                  href="/admin/products"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === "/admin/products"
                      ? "text-green-700 bg-green-50"
                      : "text-green-700 hover:text-green-800 hover:bg-green-50"
                  }`}
                >
                  <span className="font-bold">Admin</span>
                </Link>
              )}
            </div>

            {/* Desktop Auth & Cart */}
            <div className="hidden lg:flex items-center space-x-4">
              {status === "authenticated" && (
                <Link
                  href="/cart"
                  className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors relative"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Cart</span>
                  {getItemCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {getItemCount() > 99 ? "99+" : getItemCount()}
                    </span>
                  )}
                </Link>
              )}

              <button
                onClick={handleAuthClick}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  status === "authenticated"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {status === "authenticated" ? "Logout" : "Login"}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Navigation */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Navigation
                </h3>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={toggleMobileMenu}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        pathname === item.href
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                {/* Add Product button for admin */}
                {isAdmin && (
                  <Link
                    href="/addProdect"
                    onClick={toggleMobileMenu}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === "/addProdect"
                        ? "text-green-700 bg-green-50"
                        : "text-green-700 hover:text-green-800 hover:bg-green-50"
                    }`}
                  >
                    <span className="font-bold">+ Add Product</span>
                  </Link>
                )}
              </div>

              {/* User Actions */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Account
                </h3>

                {status === "authenticated" ? (
                  <>
                    <Link
                      href="/cart"
                      onClick={toggleMobileMenu}
                      className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors relative"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>Shopping Cart</span>
                      {getItemCount() > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                          {getItemCount() > 99 ? "99+" : getItemCount()}
                        </span>
                      )}
                    </Link>

                    <button
                      onClick={() => {
                        signOut();
                        toggleMobileMenu();
                      }}
                      className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                    >
                      <User className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      router.push("/login");
                      toggleMobileMenu();
                    }}
                    className="flex items-center space-x-3 w-full px-3 py-2 rounded-md text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span>Login</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
