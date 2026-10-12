import { ExternalLink } from "lucide-react";
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

interface TrackingLinksTableProps {
  links: BroadcastTrackingLink[];
}

/** Clicks per tracked link: our per-user counts next to LINE Insight's. */
export function TrackingLinksTable({ links }: TrackingLinksTableProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Link clicks
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Every link in the message is tracked for 24 hours after sending
        </p>
      </div>

      {links.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
          This message has no trackable links (http/https without merge tags).
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
              <tr>
                <th className={headerClassName}>Link</th>
                <th className={headerClassName}>Placement</th>
                <th className={`${headerClassName} text-right`}>
                  Unique clicks
                </th>
                <th className={`${headerClassName} text-right`}>
                  Total clicks
                </th>
                <th className={`${headerClassName} text-right`}>
                  LINE unique / total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {links.map((link) => (
                <tr key={link.id}>
                  <td className="max-w-md px-4 py-3">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex max-w-full items-center gap-1.5 text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                      <span className="truncate">{link.url}</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                    {link.label ? (
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        Button: {link.label}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {SOURCE_LABELS[link.source] ?? link.source} #
                    {link.position + 1}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                    {link.uniqueClicks.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                    {link.totalClicks.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                    {formatLineCount(link.lineUniqueClicks)} /{" "}
                    {formatLineCount(link.lineClicks)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
