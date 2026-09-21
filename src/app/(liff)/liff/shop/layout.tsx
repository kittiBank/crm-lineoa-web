import type { Metadata } from "next";
import { ShopShell } from "@/features/liff-shop/components/shop-shell";

export const metadata: Metadata = {
  title: "Shop | LINE OA",
  description: "Browse products and check out",
};

export default function LiffShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ShopShell>{children}</ShopShell>;
}
