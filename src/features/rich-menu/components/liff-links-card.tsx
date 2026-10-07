"use client";

import { useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";

const LIFF_PAGES = [
  {
    id: "shop",
    label: "Shop",
    description: "Browse products and check out",
    path: "/liff/shop",
  },
  {
    id: "member",
    label: "Member Card",
    description: "Tier card and progress to the next tier",
    path: "/liff/member",
  },
  {
    id: "orders",
    label: "My Orders",
    description: "Order history and status",
    path: "/liff/shop/orders",
  },
  {
    id: "login",
    label: "Member Login",
    description: "Register as a member with phone OTP",
    path: "/liff/login",
  },
] as const;

function buildLiffLink(path: string): string {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID?.trim();
  if (liffId) {
    return `https://liff.line.me/${liffId}${path}`;
  }
  return typeof window !== "undefined"
    ? `${window.location.origin}${path}`
    : path;
}

/** Copyable LIFF page links for rich menu URI actions. */
export function LiffLinksCard() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const hasLiffId = Boolean(process.env.NEXT_PUBLIC_LIFF_ID?.trim());

  const handleCopy = async (id: string, link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(id);
      setTimeout(
        () => setCopiedId((current) => (current === id ? null : current)),
        2000,
      );
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
            LIFF Links
          </p>
          <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
            Paste a link into a rich menu area&apos;s URL action to open that
            page in LINE.
            {!hasLiffId &&
              " Set NEXT_PUBLIC_LIFF_ID to generate liff.line.me links."}
          </p>

          <ul className="mt-3 grid gap-2 md:grid-cols-2">
            {LIFF_PAGES.map((page) => {
              const link = buildLiffLink(page.path);
              const isCopied = copiedId === page.id;

              return (
                <li
                  key={page.id}
                  className="rounded-md border border-blue-100 bg-white p-3 dark:border-blue-900/60 dark:bg-gray-900"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {page.label}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {page.description}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <code className="min-w-0 flex-1 truncate rounded-md border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">
                      {link}
                    </code>
                    <button
                      type="button"
                      onClick={() => void handleCopy(page.id, link)}
                      aria-label={`Copy ${page.label} link`}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      {isCopied ? (
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
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
