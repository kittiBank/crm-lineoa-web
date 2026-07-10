# Frontend Project Setup - CRM LINE OA Dashboard

## 📋 Project Structure

The frontend project has been set up with a clean, modular structure following Next.js best practices.

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication layout group
│   │   └── login/                # Login page
│   ├── (app)/                    # Main application layout group
│   │   ├── dashboard/            # Dashboard home page
│   │   ├── broadcasts/           # Broadcasts list
│   │   │   ├── create/           # Create new broadcast
│   │   │   └── [id]/             # Edit broadcast by ID
│   │   ├── templates/            # Message templates
│   │   ├── line-users/           # LINE users management
│   │   ├── rich-menu/            # Rich menu configuration
│   │   ├── settings/             # LINE OA settings
│   │   └── user-settings/        # User profile settings
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Root page (redirects to login)
├── components/                   # Reusable React components
│   ├── navbar/                   # Top navigation bar
│   ├── sidebar/                  # Left sidebar navigation
│   ├── breadcrumbs/              # Breadcrumb navigation
│   └── ui/                       # shadcn/ui components
├── constants/                    # Application constants
│   └── navigation.ts             # Menu items and breadcrumb config
├── types/                        # TypeScript type definitions
│   └── index.ts                  # Shared types
└── lib/                          # Utility functions
    └── utils.ts                  # Helper utilities
```

## 🎯 Key Features Implemented

### 1. **Authentication Flow**
- Login page at `/login`
- Separate auth layout (full-width, no navigation)
- Routes protected by layout groups `(auth)` and `(app)`

### 2. **Navigation System**
- **Sidebar**: Persistent left sidebar with all menu items
- **Navbar**: Top navigation with user profile dropdown
- **Breadcrumbs**: Contextual breadcrumb navigation on each page
- **Menu Items**: All 7 main features accessible from sidebar

### 3. **Menu Structure**
The sidebar includes all menu items from the PROJECT-SPEC:
- Dashboard
- Broadcasts
- Message Templates
- LINE Users
- Rich Menu
- LINE OA Settings
- User Settings

### 4. **Page Routes**
All pages are created and linked together:
- `/login` - User authentication
- `/dashboard` - Main overview page
- `/broadcasts` - List all broadcasts
- `/broadcasts/create` - Create new broadcast
- `/broadcasts/[id]` - Edit broadcast
- `/templates` - Message templates management
- `/line-users` - LINE user management
- `/rich-menu` - Rich menu configuration
- `/settings` - LINE OA credentials
- `/user-settings` - User profile and security

## 🚀 Getting Started

### Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. You'll be automatically redirected to the login page.

### Build for Production
```bash
npm run build
npm start
```

### Code Quality
```bash
npm run lint
```

## 🎨 Design System

The project uses:
- **TailwindCSS**: For styling
- **shadcn/ui**: Pre-built UI components
- **Lucide React**: For icons
- **Dark Mode**: Fully supported throughout

### Color Scheme
- Primary: Blue-600
- Success: Green
- Warning: Yellow
- Error: Red-600
- Background: Light (white) / Dark (gray-900)

## 📝 Component Guidelines

### Clean Code Practices
1. **Inline Comments**: Important functions have comments explaining their purpose
2. **TypeScript**: Full type safety with proper interfaces
3. **Component Organization**: Each component is in its own directory with index files
4. **Naming Conventions**: Clear, descriptive names for components and functions

### Creating New Pages
1. Create a new directory under `/app/(app)/`
2. Add a `page.tsx` file
3. Import `Breadcrumbs` for navigation context
4. Use consistent styling with existing pages
5. Add inline comments for complex logic

Example:
```typescript
// src/app/(app)/my-feature/page.tsx
"use client";

import { Breadcrumbs } from "@/components/breadcrumbs";

/**
 * My Feature page
 * Description of what this page does
 */
export default function MyFeaturePage() {
  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "My Feature", isActive: true },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={breadcrumbItems} />
      {/* Your content here */}
    </div>
  );
}
```

## 🔄 Navigation Patterns

### Internal Linking
Use `next/link` for all internal navigation:
```typescript
<Link href="/broadcasts">View Broadcasts</Link>
```

### Breadcrumb Navigation
Always include breadcrumbs for context:
```typescript
const breadcrumbItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Broadcasts", href: "/broadcasts" },
  { label: "Edit", isActive: true },
];
```

### Active Menu Item Highlighting
The sidebar automatically highlights the current page based on `pathname`.

## 📦 Types

Common types are defined in `/src/types/index.ts`:

```typescript
interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface User {
  id: string;
  email: string;
  role: "admin" | "user";
}
```

## 🔧 Configuration Files

- **next.config.ts**: Next.js configuration
- **tsconfig.json**: TypeScript configuration with path aliases
- **tailwind.config.js**: TailwindCSS customization
- **eslint.config.mjs**: ESLint rules
- **components.json**: shadcn/ui configuration

## 📚 Adding New Features

### Step 1: Update Navigation
Add the new menu item to `/src/constants/navigation.ts`:
```typescript
{
  id: "new-feature",
  label: "New Feature",
  href: "/new-feature",
  icon: "IconName",
}
```

### Step 2: Create Page Directory
```bash
mkdir -p src/app/(app)/new-feature
touch src/app/(app)/new-feature/page.tsx
```

### Step 3: Create Page Component
Use the template from existing pages and customize.

### Step 4: Test Navigation
- Verify the link appears in sidebar
- Confirm breadcrumbs work correctly
- Test internal navigation between pages

## 🎓 Placeholder Content

All pages currently have placeholder content and basic form structures:
- No actual data fetching (API integration ready)
- No database connections (backend integration ready)
- Focus on UI/UX layout and navigation flow

When implementing features:
1. Replace placeholder content with actual forms
2. Add API calls using TanStack Query
3. Implement form validation with React Hook Form + Zod
4. Add loading and error states

## ✅ What's Ready to Customize

1. **Forms**: All form fields are ready for validation logic
2. **Data Tables**: Table structure ready for data integration
3. **API Integration**: All pages structured for API calls
4. **Authentication**: Login page ready for auth logic
5. **State Management**: Ready for Redux/Zustand/Jotai

## 🔗 Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS](https://tailwindcss.com)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Lucide Icons](https://lucide.dev)

## 📞 Next Steps

1. ✅ Start the dev server: `npm run dev`
2. Test navigation between all pages
3. Implement backend API calls
4. Add form validation and submission logic
5. Set up authentication with JWT
6. Integrate with LINE Messaging API
7. Add data persistence with backend

---

**Happy coding!** 🚀
