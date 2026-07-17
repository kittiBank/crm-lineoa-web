"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar/navbar";
import { Sidebar } from "@/components/sidebar/sidebar";
import { getToken, redirectToLogin } from "@/lib/auth";
import { useIsMounted } from "@/lib/hooks/useIsMounted";

/**
 * Application layout
 * Main layout for authenticated pages
 * Includes sidebar navigation and top navbar with toggle functionality
 */

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const mounted = useIsMounted();
  const isAuthenticated = mounted && !!getToken();

  useEffect(() => {
    if (mounted && !getToken()) {
      redirectToLogin();
    }
  }, [mounted]);

  const handleSidebarToggle = () => setSidebarOpen(!sidebarOpen);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Top Navigation Bar */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Navigation with Animation */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          sidebarOpen ? "w-64" : "w-0"
        }`}>
          <Sidebar />
        </div>

        {/* Circular Toggle Button - Over Grid Line */}
        <button
          onClick={handleSidebarToggle}
          className="absolute w-12 h-12 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-md z-20 flex items-center justify-center transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 border border-gray-200 dark:border-gray-600"
          style={{
            top: "20px",
            left: sidebarOpen ? "252px" : "12px",
            transform: "translateX(-50%)",
          }}
          title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          <svg className={`w-6 h-6 transition-transform duration-300 ${
            !sidebarOpen ? "rotate-180" : ""
          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 pl-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
