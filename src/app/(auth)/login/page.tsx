"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Login page
 * User authentication form entry point
 */
export default function LoginPage() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          CRM Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          LINE Official Account Management
        </p>
      </div>

      {/* Login Form */}
      <form className="space-y-6">
        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            placeholder="user@example.com"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
            />
            Remember me
          </label>
          <Link
            href="#"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Forgot password?
          </Link>
        </div>

        {/* Login Button */}
        <Link href="/dashboard">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors">
            Sign In
          </Button>
        </Link>
      </form>

      {/* Footer Note */}
      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
        Demo credentials: admin@example.com
      </p>
    </div>
  );
}
