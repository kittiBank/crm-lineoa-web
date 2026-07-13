"use client";

import { LogOut, Settings, User } from "lucide-react";
import { useState } from "react";

/**
 * Top navigation bar component
 * Displays header with user menu
 */
export function Navbar() {
  // State for mobile menu dropdown
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-gradient-to-r from-blue-400 to-blue-600 border-b border-blue-700 shadow-lg h-16 flex items-center">
      {/* Left section - Logo/Brand */}
      <div className="px-4 md:px-6">
        <h1 className="text-white text-lg font-bold">CRM LINE OA</h1>
      </div>

      {/* Center spacer */}
      <div className="flex-1"></div>

      {/* Right section - User menu */}
      <div className="relative px-4 md:px-6">
        <button
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-300/30 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold border border-white/30">
            AB
          </div>
          <div className="hidden sm:flex flex-col items-end">
            <p className="text-sm font-medium text-white">Admin User</p>
            <p className="text-xs text-blue-100">Admin</p>
          </div>
        </button>

        {/* Dropdown Menu */}
        {isUserMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <User className="w-4 h-4" />
              Profile
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
            <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 transition-colors">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
