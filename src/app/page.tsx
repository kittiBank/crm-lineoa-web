import { redirect } from "next/navigation";
import { LiffEntryRedirect } from "@/features/liff-entry/containers/liff-entry-redirect";

// Same-site paths only ("/liff/shop"), never "//evil.com" or "/\evil.com".
const SAFE_LIFF_STATE = /^\/(?![/\\])/;

/**
 * Root page - redirects to login
 * This is the entry point for unauthenticated users
 *
 * It is also the LIFF endpoint URL: LINE opens liff.line.me/{liffId}/liff/shop
 * as /?liff.state=/liff/shop. liff.init() has to run on this page before
 * moving on (it keeps the LINE login), so that path is opened client-side.
 */
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const liffState = (await searchParams)["liff.state"];

  if (typeof liffState === "string" && SAFE_LIFF_STATE.test(liffState)) {
    return <LiffEntryRedirect liffState={liffState} />;
  }

  // Redirect to login page
  redirect("/login");
}
