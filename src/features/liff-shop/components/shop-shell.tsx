"use client";

import { ShopHeader } from "./shop-header";

export function ShopShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col bg-gray-50 dark:bg-gray-950">
      <ShopHeader />
      <main className="flex-1 pb-8">{children}</main>
    </div>
  );
}
