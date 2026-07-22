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

      <div className="relative flex flex-1 overflow-hidden">
        {/* Sidebar Navigation with Animation */}
        <div
          className={`shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
            sidebarOpen ? "w-[15.5rem]" : "w-16"
          }`}
        >
          <Sidebar collapsed={!sidebarOpen} />
        </div>

        {/* Circular Toggle Button - Over Grid Line */}
        <button
          onClick={handleSidebarToggle}
          className="absolute z-20 flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-md transition-all duration-300 ease-in-out hover:scale-110 hover:bg-gray-100 active:scale-95 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          style={{
            top: "20px",
            left: sidebarOpen ? "calc(15.5rem - 12px)" : "calc(4rem - 12px)",
            transform: "translateX(-50%)",
          }}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <svg
            className={`h-6 w-6 transition-transform duration-300 ${
              !sidebarOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 pl-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
