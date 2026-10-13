import { ExternalLink, MessageSquareText } from "lucide-react";
import { BroadcastTrackingLink } from "../../types/tracking";

const SOURCE_LABELS: Record<string, string> = {
  imagemap: "Rich message",
  flex: "Card button",
  carousel: "Carousel button",
};

const headerClassName =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300";

function formatLineCount(value: number | null): string {
  return value === null ? "—" : value.toLocaleString();
}

export function hasLinkClicks(link: BroadcastTrackingLink): boolean {
  return link.totalClicks > 0 || (link.lineClicks ?? 0) > 0;
}

function ActionCell({ link }: { link: BroadcastTrackingLink }) {
  if (link.actionType === "message") {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <MessageSquareText className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
        <span className="truncate text-sm font-medium text-gray-900 dark:text-white">
          &ldquo;{link.text}&rdquo;
        </span>
      </div>
    );
  }

  return (
    <>
      {link.label ? (
        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
          {link.label}
        </p>
      ) : null}
      <a
        href={link.url ?? undefined}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex max-w-full items-center gap-1.5 text-sm text-blue-600 hover:underline dark:text-blue-400"
      >
        <span className="truncate">{link.url}</span>
        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
      </a>
    </>
  );
}

interface TrackingLinksTableProps {
  links: BroadcastTrackingLink[];
  /** Show LINE Insight's per-link numbers (only when LINE returned any). */
  showLineStats: boolean;
}

/** Clicked links and message taps, with per-user counts (and LINE's when available). */
export function TrackingLinksTable({
  links,
  showLineStats,
}: TrackingLinksTableProps) {
  const clickedLinks = links.filter(hasLinkClicks);

  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Clicks by action
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Links and rich message areas users tapped
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
            <tr>
              <th className={headerClassName}>Action</th>
              <th className={headerClassName}>Placement</th>
              <th className={`${headerClassName} text-right`}>Unique clicks</th>
              <th className={`${headerClassName} text-right`}>Total clicks</th>
              {showLineStats ? (
                <th className={`${headerClassName} text-right`}>
                  LINE unique / total
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {clickedLinks.map((link) => (
              <tr key={link.id}>
                <td className="max-w-md px-4 py-3">
                  <ActionCell link={link} />
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-600 dark:text-gray-400">
                  {SOURCE_LABELS[link.source] ?? link.source}
                  {link.actionType === "message" ? " · message" : " · link"} #
                  {link.position + 1}
                </td>
                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  {link.uniqueClicks.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                  {link.totalClicks.toLocaleString()}
                </td>
                {showLineStats ? (
                  <td className="px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                    {link.actionType === "uri"
                      ? `${formatLineCount(link.lineUniqueClicks)} / ${formatLineCount(link.lineClicks)}`
                      : "—"}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
