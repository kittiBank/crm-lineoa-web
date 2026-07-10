// Authentication layout component for login and other authentication pages. This layout provides a centered container for its children, with a gradient background that adapts to light and dark themes. It does not include a sidebar or navbar, making it suitable for full-width authentication pages.
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
