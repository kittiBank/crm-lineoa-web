import { faker } from "@faker-js/faker";
import { Broadcast, BroadcastStatus, MetricsData } from "../types";

/**
 * Generate mock broadcast data
 * Used for development and testing
 */
export function generateMockBroadcasts(count: number = 10): Broadcast[] {
  const statuses: BroadcastStatus[] = ["Sent", "Scheduled", "Draft", "Failed"];
  const templates = [
    "Summer_Promo_01",
    "Premium_Newsletter",
    "Product_Update_v2",
    "Welcome_Flow",
    "Special_Offer_01",
  ];

  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    campaignName: faker.commerce.productName(),
    targetAudience: `${faker.person.jobTitle()} Customers`,
    audienceCount: faker.number.int({ min: 100, max: 50000 }),
    template: {
      id: faker.string.uuid(),
      name: templates[Math.floor(Math.random() * templates.length)],
    },
    status: statuses[Math.floor(Math.random() * statuses.length)],
    performance: {
      delivered: faker.number.int({ min: 50, max: 100 }),
      readRate: faker.number.int({ min: 10, max: 100 }),
    },
    createdAt: faker.date.past({ years: 2 }),
  }));
}

/**
 * Generate mock metrics data
 */
export function generateMockMetrics(): MetricsData {
  return {
    totalSent: 124802,
    percentageChange: 12,
    averageReadRate: 34.2,
    activeScheduled: 18,
    nextBroadcastTime: "2h 15m",
  };
}

/**
 * Filter broadcasts based on search and filters
 */
export function filterBroadcasts(
  broadcasts: Broadcast[],
  searchQuery: string,
  status: string,
): Broadcast[] {
  return broadcasts.filter((broadcast) => {
    const matchesSearch = broadcast.campaignName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesStatus =
      status === "All Status" || broadcast.status === status;

    return matchesSearch && matchesStatus;
  });
}
