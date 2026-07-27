import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Member Login | LINE OA",
  description: "Login as a member via LINE LIFF",
};

export default function LiffLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e8f8ef] via-white to-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#06C755] text-lg font-bold text-white shadow-sm">
            OA
          </div>
          <p className="text-sm font-medium text-gray-500">LINE Official Account</p>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
