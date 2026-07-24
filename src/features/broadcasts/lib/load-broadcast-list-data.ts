import {
  mapAudienceCounts,
  mapBroadcastRecordToBroadcast,
  mapBroadcastStatsToMetrics,
} from "./mappers";
import {
  fetchBroadcastAudiences,
  fetchBroadcasts,
  fetchBroadcastStats,
} from "./api";
import { Broadcast, MetricsData } from "../types";

export interface BroadcastListPageData {
  broadcasts: Broadcast[];
  metrics: MetricsData;
}

const DEDUPE_WINDOW_MS = 1500;

let cachedResult: BroadcastListPageData | null = null;
let cachedAt = 0;
let inflightLoad: Promise<BroadcastListPageData> | null = null;

export function clearBroadcastListDataCache() {
  cachedResult = null;
  cachedAt = 0;
  inflightLoad = null;
}

export async function loadBroadcastListPageData(
  options?: { force?: boolean },
): Promise<BroadcastListPageData> {
  const force = options?.force ?? false;
  const now = Date.now();

  if (
    !force &&
    cachedResult &&
    now - cachedAt < DEDUPE_WINDOW_MS
  ) {
    return cachedResult;
  }

  if (inflightLoad) {
    return inflightLoad;
  }

  inflightLoad = (async () => {
    const [records, audiences, stats] = await Promise.all([
      fetchBroadcasts(),
      fetchBroadcastAudiences(),
      fetchBroadcastStats(),
    ]);

    const audienceCounts = mapAudienceCounts(audiences);
    const data: BroadcastListPageData = {
      broadcasts: records.map((record) =>
        mapBroadcastRecordToBroadcast(record, audienceCounts),
      ),
      metrics: mapBroadcastStatsToMetrics(stats),
    };

    cachedResult = data;
    cachedAt = Date.now();
    return data;
  })().finally(() => {
    inflightLoad = null;
  });

  return inflightLoad;
}
