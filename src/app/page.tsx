import { redirect } from "next/navigation";

// Same-site paths only ("/liff/shop"), never "//evil.com" or "/\evil.com".
const SAFE_LIFF_STATE = /^\/(?![/\\])/;

/**
 * Root page - redirects to login
 * This is the entry point for unauthenticated users
 *
 * It is also the LIFF endpoint URL: LINE opens liff.line.me/{liffId}/liff/shop
 * as /?liff.state=/liff/shop, so forward that path instead of the admin login.
 */
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const liffState = (await searchParams)["liff.state"];

  if (typeof liffState === "string" && SAFE_LIFF_STATE.test(liffState)) {
    redirect(liffState);
  }

  // Redirect to login page
  redirect("/login");
}
