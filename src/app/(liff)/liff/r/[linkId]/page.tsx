import type { Metadata } from "next";
import { TrackedLinkRedirect } from "@/features/broadcasts/containers/tracked-link-redirect";

export const metadata: Metadata = {
  title: "Opening link… | LINE OA",
  robots: { index: false, follow: false },
};

/** Broadcast tracked link: https://liff.line.me/{LIFF_ID}/liff/r/{linkId} */
export default async function TrackedLinkPage({
  params,
}: {
  params: Promise<{ linkId: string }>;
}) {
  const { linkId } = await params;

  return <TrackedLinkRedirect linkId={linkId} />;
}
