import type { Metadata } from "next";
import { ShopShell } from "@/features/liff-shop/components/shop-shell";

export const metadata: Metadata = {
  title: "Member Card | LINE OA",
  description: "Your member tier and progress to the next tier",
};

export default function LiffMemberLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ShopShell>{children}</ShopShell>;
}
