# Broadcasts Feature Module Documentation

## 📁 Module Structure

The broadcasts feature is organized as a modular, reusable feature with clean architecture:

```
src/features/broadcasts/
├── components/              # Reusable UI components
│   ├── broadcast-header.tsx        # Header with title and action button
│   ├── search-filters.tsx          # Search and filter form
│   ├── broadcast-table.tsx         # Data table component
│   ├── metrics-section.tsx         # Metrics cards display
│   ├── pagination.tsx              # Pagination controls
│   └── index.ts                    # Component exports
├── containers/              # Smart components with logic
│   └── broadcasts-list.tsx         # Main container managing state & filtering
├── lib/                     # Utilities and helpers
│   └── mockData.ts                 # Mock data generation with faker
├── types/                   # TypeScript types & interfaces
│   └── index.ts                    # Type definitions
└── README.md                # This file
```

## 🔧 Core Components

### 1. **BroadcastHeader**
Displays page title, description, and "New Broadcast" button.

```tsx
<BroadcastHeader
  title="Broadcast Management"
  description="Create and manage campaigns..."
  onNewClick={() => {}}
/>
```

### 2. **SearchFilters**
Search and filter form with campaign search, status filter, and date range.

```tsx
<SearchFilters
  filters={filters}
  onFilterChange={(newFilters) => setFilters(newFilters)}
/>
```

### 3. **BroadcastTable**
Displays broadcasts in a table with columns for campaign info, status, performance, and actions.

```tsx
<BroadcastTable
  broadcasts={broadcasts}
  onEdit={(id) => {}}
  onDelete={(id) => {}}
/>
```

### 4. **MetricsSection**
Shows key metrics: Total Sent, Read Rate, Active Scheduled broadcasts.

```tsx
<MetricsSection
  totalSent={124802}
  percentageChange={12}
  averageReadRate={34.2}
  activeScheduled={18}
  nextBroadcastTime="2h 15m"
/>
```

### 5. **Pagination**
Navigation controls for paginated results.

```tsx
<Pagination
  currentPage={1}
  totalPages={12}
  totalItems={48}
  itemsPerPage={4}
  onPageChange={(page) => {}}
/>
```

## 📝 Type Definitions

```typescript
// Broadcast status type
type BroadcastStatus = "Sent" | "Scheduled" | "Draft" | "Failed";

// Main broadcast interface
interface Broadcast {
  id: string;
  campaignName: string;
  targetAudience: string;
  audienceCount: number;
  template: { id: string; name: string };
  status: BroadcastStatus;
  performance: { delivered: number; readRate: number };
  createdAt: Date;
}
```

## 🎯 Mock Data

The `mockData.ts` file provides utilities for generating realistic test data using faker:

```typescript
// Generate 20 mock broadcasts
const broadcasts = generateMockBroadcasts(20);

// Generate mock metrics
const metrics = generateMockMetrics();

// Filter broadcasts
const filtered = filterBroadcasts(broadcasts, "search", "Sent");
```

## 🚀 Usage Example

```tsx
"use client";

import { BroadcastsListContainer } from "@/features/broadcasts/containers/broadcasts-list";

export default function BroadcastsPage() {
  return <BroadcastsListContainer />;
}
```

## 🔄 State Management Flow

```
BroadcastsListContainer (manages state)
  ├── filters: SearchQuery, Status, DateRange
  ├── currentPage: Pagination state
  └── Filters broadcasts → Paginates results → Passes to components
      ├── BroadcastHeader
      ├── SearchFilters (updates filters)
      ├── BroadcastTable (displays paginated data)
      ├── Pagination (updates currentPage)
      └── MetricsSection
```

## ✨ Features

- ✅ **Modular Components**: Each component is self-contained and reusable
- ✅ **Clean Architecture**: Separation of concerns with containers, components, lib, and types
- ✅ **Mock Data**: Realistic test data generation with faker
- ✅ **Filtering**: Search by campaign name, status, and date range
- ✅ **Pagination**: Navigate through paginated broadcasts
- ✅ **Metrics Display**: Key performance indicators at bottom
- ✅ **TypeScript**: Fully typed for type safety
- ✅ **Dark Mode**: All components support dark mode
- ✅ **Responsive**: Mobile-friendly layout

## 🔌 Extending the Feature

### Add a New Component

1. Create file in `components/` directory
2. Export from `components/index.ts`
3. Use in container or other components

Example:
```tsx
// components/broadcast-card.tsx
export function BroadcastCard({ broadcast }) {
  return (
    <div className="...">
      {/* Card content */}
    </div>
  );
}

// components/index.ts
export { BroadcastCard } from "./broadcast-card";
```

### Connect to Real API

Update `containers/broadcasts-list.tsx`:

```tsx
// Replace mock data generation with API call
const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);

useEffect(() => {
  // Fetch from API
  fetch("/api/broadcasts")
    .then(res => res.json())
    .then(data => setBroadcasts(data));
}, []);
```

### Add New Filters

1. Update `FilterOptions` interface in `types/index.ts`
2. Add filter UI in `SearchFilters` component
3. Update `filterBroadcasts` function in `lib/mockData.ts`

## 📊 Performance Considerations

- Components are optimized with `useMemo` to prevent unnecessary re-renders
- Pagination limits rendered items to improve performance
- Lazy loading ready for future implementation
- Component tree is kept shallow for fast React reconciliation

## 🧪 Testing

All components are designed to be easily testable:

```tsx
// Example test
import { render } from "@testing-library/react";
import { BroadcastHeader } from "./broadcast-header";

test("renders header with title", () => {
  const { getByText } = render(
    <BroadcastHeader title="Test Title" />
  );
  expect(getByText("Test Title")).toBeInTheDocument();
});
```

## 📦 Dependencies

- `@faker-js/faker` - Mock data generation
- `lucide-react` - Icons
- `next/link` - Navigation
- Standard React & TypeScript

## 🎨 Styling

All components use TailwindCSS with:
- Consistent spacing (gap, padding, margin)
- Blue primary color (#2563eb)
- Gray neutral palette for secondary elements
- Dark mode support throughout
- Responsive design (mobile-first approach)

---

**Note**: This module uses mock data from faker. Replace with real API calls when backend is ready.
