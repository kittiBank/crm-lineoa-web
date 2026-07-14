import { faker } from "@faker-js/faker";

export interface DashboardMetrics {
  totalAudience: number;
  activeBroadcasts: number;
  messageSentToday: number;
  newFollowers: number;
}

export interface BroadcastTrendData {
  day: string;
  trend: number;
}

export interface AudienceGrowthData {
  week: string;
  new: number;
  returning: number;
}

export interface RecentBroadcast {
  id: string;
  campaign: string;
  status: "Sent" | "In Progress" | "Scheduled" | "Draft" | "Failed";
  sent: number;
  delivered: number;
  deliveredRate: number;
  read: number;
  readRate: number;
  date: string;
}

/**
 * Generate mock dashboard metrics
 */
export function generateDashboardMetrics(): DashboardMetrics {
  return {
    totalAudience: faker.number.int({ min: 30000, max: 50000 }),
    activeBroadcasts: faker.number.int({ min: 5, max: 15 }),
    messageSentToday: faker.number.int({ min: 5000, max: 10000 }),
    newFollowers: faker.number.int({ min: 100, max: 500 }),
  };
}

/**
 * Generate mock broadcast trend data (last 7 days)
 */
export function generateBroadcastTrendData(): BroadcastTrendData[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day) => ({
    day,
    trend: faker.number.int({ min: 500, max: 5000 }),
  }));
}

/**
 * Generate mock audience growth data (4 weeks)
 */
export function generateAudienceGrowthData(): AudienceGrowthData[] {
  return [
    {
      week: "W1",
      new: faker.number.int({ min: 500, max: 2000 }),
      returning: faker.number.int({ min: 3000, max: 8000 }),
    },
    {
      week: "W2",
      new: faker.number.int({ min: 500, max: 2000 }),
      returning: faker.number.int({ min: 3000, max: 8000 }),
    },
    {
      week: "W3",
      new: faker.number.int({ min: 500, max: 2000 }),
      returning: faker.number.int({ min: 3000, max: 8000 }),
    },
    {
      week: "W4",
      new: faker.number.int({ min: 500, max: 2000 }),
      returning: faker.number.int({ min: 3000, max: 8000 }),
    },
  ];
}

/**
 * Generate mock recent broadcasts
 */
export function generateRecentBroadcasts(count: number = 5): RecentBroadcast[] {
  const statuses: ("Sent" | "In Progress" | "Scheduled" | "Draft" | "Failed")[] = [
    "Sent",
    "In Progress",
    "Scheduled",
    "Draft",
    "Failed",
  ];
  const campaigns = [
    "Summer Sale 2024",
    "VIP Loyalty Rewards",
    "New Product Launch",
    "Flash Deal",
    "Birthday Campaign",
    "Newsletter",
  ];

  return Array.from({ length: count }, () => {
    const delivered = faker.number.int({ min: 80, max: 100 });
    const read = faker.number.int({ min: 30, max: 70 });
    const sent = faker.number.int({ min: 5000, max: 20000 });

    return {
      id: faker.string.uuid(),
      campaign: faker.helpers.arrayElement(campaigns),
      status: faker.helpers.arrayElement(statuses),
      sent,
      delivered: Math.round((sent * delivered) / 100),
      deliveredRate: delivered,
      read: Math.round((sent * read) / 100),
      readRate: read,
      date: faker.date.recent({ days: 30 }).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
  });
}
