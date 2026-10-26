import { formatBaht, formatNumber, formatPercent } from "../../lib/format";
import { PurchaseFunnel as PurchaseFunnelData } from "../../types";
import { CardEmptyState, ChartCard } from "../chart-card";

const STEP_COLORS = ["bg-chart-blue-300", "bg-chart-blue-600", "bg-chart-blue-900"];

export function PurchaseFunnel({ funnel }: { funnel: PurchaseFunnelData }) {
  // Shop visits / add-to-cart are not tracked server-side yet (cart lives in
  // the LIFF browser), so the funnel starts at the click and ends at payment.
  const steps = [
    { label: "Link clicks", value: funnel.linkClicks },
    { label: "Orders placed", value: funnel.ordersPlaced },
    { label: "Paid", value: funnel.paid },
  ];
  const conversion =
    funnel.linkClicks > 0 ? (funnel.paid / funnel.linkClicks) * 100 : 0;

  return (
    <ChartCard
      size="narrow"
      title="Broadcast → purchase funnel"
      subtitle={`Orders within ${funnel.attributionWindowHours}h after a broadcast link click`}
    >
      {funnel.linkClicks === 0 ? (
        <CardEmptyState message="No broadcast link clicks in this period" />
      ) : (
        <>
          <div className="flex flex-col gap-3.5">
            {steps.map((step, index) => {
              const prev = index > 0 ? steps[index - 1].value : null;
              const conv =
                prev === null
                  ? "100%"
                  : prev > 0
                    ? `${formatPercent((step.value / prev) * 100, 0)} of prev.`
                    : "—";
              const width = Math.max(2, (step.value / funnel.linkClicks) * 100);

              return (
                <div key={step.label} className="flex flex-col gap-1.5">
                  <div className="flex justify-between gap-2 text-[13px]">
                    <span className="font-medium text-neutral-950 dark:text-white">
                      {step.label}
                    </span>
                    <span className="tabular-nums text-neutral-600 dark:text-neutral-400">
                      <strong className="text-neutral-950 dark:text-white">
                        {formatNumber(step.value)}
                      </strong>{" "}
                      · {conv}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div
                      className={`h-full rounded-full ${STEP_COLORS[index]}`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto flex flex-col gap-2 border-t border-neutral-100 pt-3.5 text-[13px] dark:border-neutral-800">
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-400">Click → paid conversion</span>
              <strong className="tabular-nums">{formatPercent(conversion)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600 dark:text-neutral-400">Attributed revenue</span>
              <strong className="tabular-nums">{formatBaht(funnel.revenue)}</strong>
            </div>
          </div>
        </>
      )}
    </ChartCard>
  );
}
