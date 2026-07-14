import { BroadcastTrendData } from "../lib/mockData";

interface BroadcastTrendChartProps {
  data: BroadcastTrendData[];
}

/**
 * Simple line chart for broadcast trend
 * Shows the last 7 days of broadcast trend
 */
export function BroadcastTrendChart({ data }: BroadcastTrendChartProps) {
  const maxValue = Math.max(...data.map((d) => d.trend));
  const chartHeight = 200;
  const chartWidth = 300;
  const padding = 40;

  // Create SVG path for the line chart
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (chartWidth - 2 * padding);
    const y =
      chartHeight - ((d.trend / maxValue) * (chartHeight - 2 * padding) + padding);
    return { x, y, ...d };
  });

  const pathData = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const fillArea = `${pathData} L ${points[points.length - 1].x} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Broadcast Trend
        </h3>
        <select className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>Last 90 Days</option>
        </select>
      </div>

      <svg
        width={chartWidth}
        height={chartHeight}
        className="w-full"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      >
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1={padding}
            y1={padding + ((chartHeight - 2 * padding) / 4) * i}
            x2={chartWidth - padding}
            y2={padding + ((chartHeight - 2 * padding) / 4) * i}
            stroke="currentColor"
            strokeWidth="1"
            className="stroke-gray-200 dark:stroke-gray-700"
            strokeDasharray="4"
          />
        ))}

        {/* Fill area */}
        <path
          d={fillArea}
          fill="currentColor"
          className="fill-blue-100 dark:fill-blue-900/20"
        />

        {/* Line */}
        <path
          d={pathData}
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="stroke-blue-600 dark:stroke-blue-400"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill="currentColor"
            className="fill-blue-600 dark:fill-blue-400"
          />
        ))}

        {/* X-axis labels */}
        {points.map((p) => (
          <text
            key={p.day}
            x={p.x}
            y={chartHeight - padding + 20}
            textAnchor="middle"
            fontSize="12"
            className="fill-gray-600 dark:fill-gray-400"
          >
            {p.day}
          </text>
        ))}
      </svg>
    </div>
  );
}
