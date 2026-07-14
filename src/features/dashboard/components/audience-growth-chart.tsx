import { AudienceGrowthData } from "../lib/mockData";

interface AudienceGrowthChartProps {
  data: AudienceGrowthData[];
}

/**
 * Simple bar chart for audience growth
 * Shows new vs returning audience for 4 weeks
 */
export function AudienceGrowthChart({ data }: AudienceGrowthChartProps) {
  const maxValue = Math.max(...data.flatMap((d) => [d.new, d.returning]));
  const chartHeight = 250;
  const barWidth = 30;
  const barGap = 20;
  const padding = 40;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Audience Growth
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-700"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">New</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-300"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Returning
            </span>
          </div>
        </div>
      </div>

      <svg
        width="100%"
        height={chartHeight}
        viewBox={`0 0 ${(barWidth + barGap) * data.length + 2 * padding} ${chartHeight}`}
        preserveAspectRatio="none"
      >
        {/* Y-axis */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={chartHeight - padding}
          stroke="currentColor"
          strokeWidth="1"
          className="stroke-gray-300 dark:stroke-gray-600"
        />

        {/* X-axis */}
        <line
          x1={padding}
          y1={chartHeight - padding}
          x2={(barWidth + barGap) * data.length + padding}
          y2={chartHeight - padding}
          stroke="currentColor"
          strokeWidth="1"
          className="stroke-gray-300 dark:stroke-gray-600"
        />

        {/* Grid lines and values */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = chartHeight - padding - (chartHeight - 2 * padding) * ratio;
          return (
            <g key={i}>
              <line
                x1={padding - 5}
                y1={y}
                x2={padding}
                y2={y}
                stroke="currentColor"
                strokeWidth="1"
                className="stroke-gray-300 dark:stroke-gray-600"
              />
              <text
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="12"
                className="fill-gray-600 dark:fill-gray-400"
              >
                {Math.round(maxValue * ratio / 1000)}k
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const groupX = padding + (barWidth + barGap) * i + barGap / 2;
          const baseY = chartHeight - padding;
          const chartArea = chartHeight - 2 * padding;

          const newHeight = (d.new / maxValue) * chartArea;
          const returningHeight = (d.returning / maxValue) * chartArea;

          return (
            <g key={d.week}>
              {/* New (darker blue) */}
              <rect
                x={groupX}
                y={baseY - newHeight}
                width={barWidth / 2 - 2}
                height={newHeight}
                fill="currentColor"
                className="fill-blue-700 dark:fill-blue-600"
              />
              {/* Returning (lighter blue) */}
              <rect
                x={groupX + barWidth / 2}
                y={baseY - returningHeight}
                width={barWidth / 2 - 2}
                height={returningHeight}
                fill="currentColor"
                className="fill-blue-300 dark:fill-blue-400"
              />
              {/* Week label */}
              <text
                x={groupX + barWidth / 2}
                y={baseY + 20}
                textAnchor="middle"
                fontSize="12"
                className="fill-gray-600 dark:fill-gray-400"
              >
                {d.week}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
