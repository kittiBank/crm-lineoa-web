"use client";

import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

/**
 * Login page
 * User authentication form entry point with modern split-screen design
 */
export default function LoginPage() {
  // State for password visibility toggle
  const [showPassword, setShowPassword] = useState(false);
  // State for keep logged in checkbox
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  return (
    <div className="w-full max-w-md">
      {/* Logo/Title */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
        <p className="text-gray-600">
          Please enter your credentials to access your dashboard.
        </p>
      </div>

      {/* Login Form */}
      <form className="space-y-5">
        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="email"
              placeholder="name@company.com"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {/* Password visibility toggle */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-gray-900 transition-colors">
            <input
              type="checkbox"
              checked={keepLoggedIn}
              onChange={(e) => setKeepLoggedIn(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <span className="font-medium">Keep me logged in</span>
          </label>
          <Link
            href="#"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Sign In Button */}
        <Link href="/dashboard" className="block">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 active:scale-95">
            Sign in
          </button>
        </Link>
      </form>

      {/* Footer Links */}
      <div className="mt-8 pt-6 border-t border-gray-200 flex justify-center gap-4 text-sm">
        <Link
          href="#"
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          Privacy Policy
        </Link>
        <span className="text-gray-300">•</span>
        <Link
          href="#"
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          Terms of Service
        </Link>
      </div>
    </div>
  );
}
