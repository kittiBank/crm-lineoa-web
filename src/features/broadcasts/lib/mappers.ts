import {
  Broadcast,
  BroadcastAudienceOption,
  BroadcastAudienceType,
  BroadcastRecord,
  BroadcastStats,
  BroadcastStatus,
  MetricsData,
} from "../types";

const STATUS_MAP: Record<string, BroadcastStatus> = {
  completed: "Sent",
  scheduled: "Scheduled",
  draft: "Draft",
  failed: "Failed",
  processing: "Processing",
};

const AUDIENCE_LABELS: Record<BroadcastAudienceType, string> = {
  all: "All Followers",
  active: "Active Users",
  new: "New Followers",
};

export function mapBroadcastRecordToBroadcast(
  record: BroadcastRecord,
  audienceCounts?: Partial<Record<BroadcastAudienceType, number>>,
): Broadcast {
  const delivered =
    record.messageCount > 0
      ? Math.round((record.successCount / record.messageCount) * 100)
      : record.status === "completed"
        ? 100
        : 0;

  const audienceCount =
    audienceCounts?.[record.audienceType] ?? record.messageCount;

  return {
    id: record.id,
    campaignName: record.name,
    targetAudience:
      AUDIENCE_LABELS[record.audienceType] ?? record.audienceType,
    audienceCount,
    template: {
      id: record.template?.id ?? record.templateId ?? "",
      name: record.template?.name ?? "—",
    },
    status: STATUS_MAP[record.status] ?? "Draft",
    performance: {
      delivered,
      readRate: 0,
    },
    createdAt: new Date(record.createdAt),
  };
}

export function mapAudienceCounts(
  audiences: BroadcastAudienceOption[],
): Partial<Record<BroadcastAudienceType, number>> {
  return audiences.reduce<Partial<Record<BroadcastAudienceType, number>>>(
    (counts, audience) => {
      counts[audience.value] = audience.count;
      return counts;
    },
    {},
  );
}

export function mapBroadcastStatsToMetrics(
  stats: BroadcastStats,
): MetricsData {
  return {
    totalSent: stats.totalSentThisMonth,
    percentageChange: stats.percentageChange,
    averageReadRate: stats.averageReadRate,
    readRatePercentageChange: stats.readRatePercentageChange,
    activeScheduled: stats.activeScheduled,
    nextBroadcastTime: formatRelativeTime(stats.nextBroadcastAt),
  };
}

export function formatRelativeTime(isoDate: string | null): string {
  if (!isoDate) {
    return "—";
  }

  const diffMs = new Date(isoDate).getTime() - Date.now();
  if (diffMs <= 0) {
    return "soon";
  }

  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

export function filterBroadcasts(
  broadcasts: Broadcast[],
  searchQuery: string,
  status: string,
  dateRange?: string,
): Broadcast[] {
  return broadcasts.filter((broadcast) => {
    const matchesSearch = broadcast.campaignName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesStatus =
      status === "All Status" || broadcast.status === status;

    const matchesDate =
      !dateRange ||
      broadcast.createdAt.toISOString().slice(0, 10) === dateRange;

    return matchesSearch && matchesStatus && matchesDate;
  });
}
