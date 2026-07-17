# LINE Users Feature

Modern enterprise CRM "LINE Users" management page for viewing and managing users synced from LINE Official Account.

## Features

- **Search & Filtering**: Search by Display Name or LINE User ID, filter by User Type (Member/Guest), Status (Active/Blocked/Unfollowed), and Date Range
- **Responsive Data Table**: Displays users with Avatar, Display Name, User Type, Status Badges, Tags, Last Active, and Date Added
- **Bulk Selection**: Checkbox for selecting multiple users
- **Pagination**: Navigate through large datasets with customizable items per page (10, 20, 50)
- **Action Buttons**: 
  - Search: Filter users
  - Reset: Clear all filters
  - Refresh: Reload data
  - Sync LINE OA: Sync users from LINE Official Account
- **User Actions**: View detailed user info and more options menu

## Architecture

```
line-users/
├── components/          # Reusable UI components
│   ├── line-user-header.tsx      # Page header with Sync button
│   ├── search-filters.tsx        # Search and filter controls
│   ├── line-user-table.tsx       # Data table component
│   ├── pagination.tsx            # Pagination controls
│   └── index.ts                  # Component exports
├── containers/         # Smart containers with state management
│   └── line-users-list.tsx       # Main container managing page state
├── lib/               # Utilities and mock data
│   └── mockData.ts    # Generate mock users and filter logic
├── types/             # TypeScript interfaces
│   └── index.ts       # Type definitions
└── README.md          # This file
```

## Data Structure

### LineUser Interface
```typescript
interface LineUser {
  id: string;
  lineUserId: string;           // Unique LINE user ID
  displayName: string;          // Display name
  avatar?: string;              // Profile avatar URL
  userType: "Member" | "Guest"; // User type
  status: "Active" | "Blocked" | "Unfollowed"; // Status
  tags: string[];               // User tags (VIP, Frequent Buyer, etc.)
  lastActive: Date;             // Last activity date
  dateAdded: Date;              // Account creation date
  followedDate?: Date;          // Follow date
}
```

### FilterOptions Interface
```typescript
interface FilterOptions {
  searchQuery: string;          // Search text
  searchType: "all" | "displayName" | "userId"; // Search field
  userType: "Member" | "Guest" | "All"; // User type filter
  status: "Active" | "Blocked" | "Unfollowed" | "All"; // Status filter
  dateRange: string;            // Date range filter
}
```

## Components

### LineUserHeader
Displays page title and "Sync LINE OA" button to trigger synchronization.

### SearchFilters
Advanced search and filtering interface with:
- Text search (Display Name / LINE User ID)
- User Type dropdown
- Status dropdown
- Date range picker
- Reset and Refresh buttons

### LineUserTable
Data table with:
- Checkbox column for bulk selection
- Avatar and Display Name
- User Type badge
- Status badge with color coding
- Tags display (shows first 2 tags, with count of remaining)
- Last Active date
- Date Added
- Action buttons (View, More)

### Pagination
Navigation controls with:
- Items per page selector (10, 20, 50)
- Item count display
- Previous/Next buttons
- Page number buttons with smart ellipsis

## Usage

The page is automatically available at `/line-users` in the app and integrated with the existing navigation.

### Container Props & Actions

```typescript
// State Management
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);
const [filters, setFilters] = useState<FilterOptions>(...);

// Handlers
handleFilterChange()    // Update filters and reset pagination
handlePageChange()      // Navigate to page
handleSync()           // Trigger LINE OA sync (TODO: implement)
handleRefresh()        // Refresh user data (TODO: implement)
handleViewUser()       // View user details (TODO: implement)
handleMoreOptions()    // Show more options menu (TODO: implement)
```

## Styling

- **Theme**: Clean white theme with dark mode support
- **Colors**: Blue primary color (#2563EB), enterprise SaaS dashboard style
- **Layout**: Responsive grid layout, subtle borders, rounded corners, soft shadows
- **Typography**: Clear hierarchy with semibold headers and muted text

## Mock Data

The feature includes 150 mock users generated with:
- Random names (using faker.js)
- Unique LINE User IDs
- Random avatars
- Distributed user types and statuses
- Random tags
- Date ranges spanning 2 years

## Future Enhancements

- [ ] Implement LINE OA API integration for real data
- [ ] Add user detail modal/panel
- [ ] Implement bulk actions (block, unblock, tag)
- [ ] Add user segmentation
- [ ] Export user data to CSV
- [ ] Advanced analytics dashboard
- [ ] User activity timeline
- [ ] Message template assignment
