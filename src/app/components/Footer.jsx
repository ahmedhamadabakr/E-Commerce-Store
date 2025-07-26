"use client"
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Heart,
  ShoppingBag,
  HelpCircle,
} from "lucide-react";

export default function Footer() {
  const [currentYear, setCurrentYear] = useState('');

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-8 h-8 text-blue-400" />
              <h3 className="text-xl font-bold">E-Commerce Store</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your trusted destination for quality products. We provide an exceptional
              shopping experience with fast delivery and outstanding customer
              service.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com/" target="_blank" rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-gray-400 hover:text-blue-400 transition duration-300"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com/" target="_blank" rel="noopener noreferrer"
                aria-label="Twitter"
                className="text-gray-400 hover:text-blue-400 transition duration-300"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com/" target="_blank" rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-gray-400 hover:text-blue-400 transition duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-300 hover:text-blue-400 transition duration-300 text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-gray-300 hover:text-blue-400 transition duration-300 text-sm"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-blue-400 transition duration-300 text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-gray-300 hover:text-blue-400 transition duration-300 text-sm"
                >
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">
              Customer Service
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/help"
                  className="text-gray-300 hover:text-blue-400 transition duration-300 text-sm flex items-center"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-300 hover:text-blue-400 transition duration-300 text-sm flex items-center"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-gray-300 hover:text-blue-400 transition duration-300 text-sm"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-gray-300 hover:text-blue-400 transition duration-300 text-sm"
                >
                  Returns & Exchanges
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center text-gray-300 text-sm">
                <MapPin className="w-4 h-4 mr-2 text-blue-400" />
                <span>Gad Elrab Basha, El Quseia, Assiut, Egypt</span>
              </div>
              <div className="flex items-center text-gray-300 text-sm">
                <Phone className="w-4 h-4 mr-2 text-blue-400" />
                <span>+20 101 997 1564</span>
              </div>
              <div className="flex items-center text-gray-300 text-sm">
                <Mail className="w-4 h-4 mr-2 text-blue-400" />
                <span>ahmedhamadabakr77@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {currentYear || '...'} Ahmed Bakr. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-blue-400 transition duration-300"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-blue-400 transition duration-300"
              >
                Terms of Service
              </Link>
              <Link
                href="/sitemap"
                className="text-gray-400 hover:text-blue-400 transition duration-300"
              >
                Sitemap
              </Link>
            </div>
          </div>
          <div className="text-center mt-4 text-gray-500 text-xs">
            Made by Ahmed Bakr <Heart className="w-3 h-3 inline text-red-500" /> with ❤️ for our customers
          </div>
        </div>
      </div>
    </footer>
  );
}
