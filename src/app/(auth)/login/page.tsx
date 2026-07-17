"use client";

import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/lib/hooks/useToast";
import { API_ENDPOINTS } from "@/constants/api";
import {
  getToken,
  redirectToDashboard,
  setAuthToken,
} from "@/lib/auth";

/**
 * Login page
 * User authentication form entry point with modern split-screen design
 */
export default function LoginPage() {
  const toast = useToast();

  useEffect(() => {
    if (getToken()) {
      redirectToDashboard();
    }
  }, []);

  // State for password visibility toggle
  const [showPassword, setShowPassword] = useState(false);
  // State for keep logged in checkbox
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Login failed");
        return;
      }

      const token = data.accessToken || data.token;
      if (!token) {
        toast.error("No token received from server");
        return;
      }

      setAuthToken(token, data.user);
      toast.success("Login successful!");
      redirectToDashboard();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: "email" | "password", value: string) => {
    if (field === "email") {
      setEmail(value);
    } else {
      setPassword(value);
    }
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

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
      <form onSubmit={handleSubmit} className="space-y-5">
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
              value={email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              disabled={loading}
              aria-invalid={!!errors.email}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed aria-invalid:border-red-500"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
          )}
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
              value={password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              disabled={loading}
              aria-invalid={!!errors.password}
              className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed aria-invalid:border-red-500"
            />
            {/* Password visibility toggle */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password}</p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-gray-900 transition-colors">
            <input
              type="checkbox"
              checked={keepLoggedIn}
              onChange={(e) => setKeepLoggedIn(e.target.checked)}
              disabled={loading}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-5 w-5 animate-spin" />}
          {loading ? "Signing in..." : "Sign in"}
        </button>
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
