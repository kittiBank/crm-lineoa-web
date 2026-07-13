// Authentication layout component for login and other authentication pages
// Split-screen design with gradient background on left and white form area on right
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side - Blue gradient with branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-700 flex-col justify-center items-center px-12 py-8">
        <div className="text-center text-white space-y-6">
          <h1 className="text-5xl font-bold leading-tight">Empower Your Business</h1>
          <p className="text-xl text-blue-100 leading-relaxed">
            The all-in-one CRM solution to streamline your LineOA management, automate engagements, and scale your business effortlessly.
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-8 py-8 bg-gray-50">
        {children}
      </div>
    </div>
  );
}

