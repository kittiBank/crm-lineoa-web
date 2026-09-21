"use client";

import { useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";

const SHOP_PATH = "/liff/shop";

export function LiffShopLinkCard() {
  const [copied, setCopied] = useState(false);
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID?.trim();

  const shopLink = liffId
    ? `https://liff.line.me/${liffId}${SHOP_PATH}`
    : typeof window !== "undefined"
      ? `${window.location.origin}${SHOP_PATH}`
      : SHOP_PATH;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shopLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — user can still select the text manually.
    }
  };

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
      <div className="flex items-start gap-3">
        <Link2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            LIFF Shop Link
          </p>
          <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
            Paste this into a rich menu area&apos;s URI action to open the shop.
            {!liffId && " Set NEXT_PUBLIC_LIFF_ID to generate a liff.line.me link."}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">
              {shopLink}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
