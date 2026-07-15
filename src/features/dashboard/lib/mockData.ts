import { faker } from "@faker-js/faker";

export interface DashboardMetrics {
  totalAudience: number;
  activeBroadcasts: number;
  messageSentToday: number;
  newFollowers: number;
}

export interface FollowerStatus {
  active: number;
  inactive: number;
}

export interface BroadcastTrendData {
  day: string;
  sent: number;
  delivered: number;
}

export interface AudienceGrowthData {
  week: string;
  new: number;
  returning: number;
}

export interface BroadcastStatusData {
  name: string;
  value: number;
  fill: string;
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
 * Generate mock follower status data (active/inactive)
 */
export function generateFollowerStatus(): FollowerStatus {
  const total = faker.number.int({ min: 30000, max: 50000 });
  const active = Math.round(total * faker.number.float({ min: 0.6, max: 0.8 }));
  return {
    active,
    inactive: total - active,
  };
}

/**
 * Generate mock broadcast trend data (last 7 days)
 */
export function generateBroadcastTrendData(): BroadcastTrendData[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day) => {
    const sent = faker.number.int({ min: 1000, max: 5000 });
    return {
      day,
      sent,
      delivered: Math.round(sent * faker.number.float({ min: 0.75, max: 0.95 })),
    };
  });
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
 * Generate mock broadcast status data (pie chart)
 */
export function generateBroadcastStatusData(): BroadcastStatusData[] {
  return [
    {
      name: "Sent",
      value: faker.number.int({ min: 40, max: 60 }),
      fill: "#3b82f6",
    },
    {
      name: "In Progress",
      value: faker.number.int({ min: 10, max: 25 }),
      fill: "#f59e0b",
    },
    {
      name: "Scheduled",
      value: faker.number.int({ min: 15, max: 30 }),
      fill: "#10b981",
    },
    {
      name: "Draft",
      value: faker.number.int({ min: 5, max: 20 }),
      fill: "#9ca3af",
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
