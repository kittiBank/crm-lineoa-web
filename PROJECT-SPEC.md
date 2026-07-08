# LINE CRM Dashboard - Project Specification

## 1. Project Overview
ชื่อโปรเจกต์:

**LINE CRM Management Platform**

ประเภท:

Enterprise CRM SaaS Web Application

เป้าหมาย:

สร้างระบบ CRM สำหรับบริหารจัดการ LINE Official Account (LINE OA) รองรับการจัดการ Audience, Broadcast Campaign, Message Template, Rich Menu และ Tracking Analytics

Tech Stack:

Frontend:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
Backend (Future):

- NestJS
- PostgreSQL
- Prisma ORM
Architecture:

- Frontend แยกจาก Backend
- REST API Communication
- Component-based Architecture

---

# 2. Frontend Requirement

## Design System
Theme:

- Clean Enterprise SaaS
- White / Light Gray as main colors
- Blue Header Bar
- Minimal UI
- Professional CRM Dashboard style
UI Framework:

- Tailwind CSS
- shadcn/ui
Design Principles:

- Reusable components
- Responsive layout
- Consistent spacing
- Table-first design
- Developer friendly Figma handoff

---

# 3. Application Layout

## Main Layout

```
------------------------------------------------
|                 Header Bar                   |
------------------------------------------------
| Sidebar |                                  |
|         |                                  |
| Menu    |          Main Content            |
|         |                                  |
|         |                                  |
------------------------------------------------
```

## Sidebar
Fixed left navigation.

Menu:

```
Dashboard

Audience
 ├── All Audience
 └── Tags

Content Management
 └── Message Templates

Marketing
 └── Broadcast Campaign

LINE Management
 └── Rich Menu

Analytics
 └── Tracking

System
 ├── Users
 ├── Activity Logs
 └── Settings
```

## Header
Components:

- Page title
- Breadcrumb
- Notification
- User avatar
- Profile dropdown

---

# 4. Pages Requirement

# Login Page
Layout:

Split screen design.

Left Section:

- Logo
- Product title
- Description
- CRM illustration
Right Section:

Login Form

Components:

- Email input
- Password input
- Remember me
- Login button

---

# Dashboard Page
Purpose:

CRM overview dashboard.

Components:

## KPI Cards

- Total Audience
- Total Campaign
- Message Sent
- Open Rate
- Click Rate

## Charts

- Audience Growth Line Chart
- Broadcast Performance Bar Chart
- Engagement Area Chart
- Audience Segment Pie Chart

## Recent Activity Table
Columns:

- User
- Action
- Module
- Date

---

# Audience Management
Purpose:

Manage LINE customers.

Features:

- Search
- Filter
- Pagination
- CRUD
Table:

Columns:

- Display Name
- LINE User ID
- Email
- Phone
- Tags
- Status
- Created Date
- Action

---

# Tag Management
Purpose:

Audience segmentation.

Features:

- Create Tag
- Edit Tag
- Delete Tag
Table:

- Tag Name
- Description
- Audience Count
- Created Date

---

# Message Template
Purpose:

Manage reusable LINE messages.

Template Types:

- Text
- Image
- Flex Message
Features:

- Create Template
- Edit Template
- Preview Template
Layout:

Two column form:

Left:
Template Form

Right:
LINE Message Preview

---

# Broadcast Campaign
Purpose:

Create marketing campaigns.

Features:

- Create Campaign
- Schedule Campaign
- Send Campaign
- Cancel Campaign
- View Report
Table:

- Campaign Name
- Audience
- Template
- Schedule
- Status
- Sent Count
- Open Rate
- Click Rate
Create Flow:

Step 1:
Campaign Information

Step 2:
Select Audience

Step 3:
Select Template

Step 4:
Preview

Step 5:
Confirm

---

# Rich Menu Management
Purpose:

Manage LINE Rich Menu.

Features:

- Upload Image
- Create Menu
- Assign Audience
- Enable / Disable
Display:

Card Gallery

Information:

- Image
- Name
- Status
- Target Audience

---

# Tracking Analytics
Purpose:

Analyze campaign performance.

KPI:

- Delivered
- Read
- Click
- Conversion
Charts:

- Delivery Trend
- Engagement Rate
- Click Performance
Table:

- Campaign
- Audience
- Event
- Timestamp

---

# Activity Logs
Purpose:

Audit user activity.

Table:

- User
- Action
- Module
- Description
- Timestamp

---

# 5. Component Structure

```
src

├── app

│   ├── login

│   ├── dashboard

│   ├── audience

│   ├── broadcast

│   ├── templates

│   ├── rich-menu

│   └── tracking

├── components

│   ├── ui
│   │   └── shadcn components
│   │
│   ├── layout
│   │   ├── sidebar
│   │   ├── header
│   │   └── breadcrumb
│   │
│   ├── table
│   │   └── data-table
│   │
│   └── charts

├── features

│   ├── audience
│   ├── broadcast
│   ├── template
│   ├── tracking
│   └── dashboard

├── hooks

├── lib

├── types

└── constants
```

---

# 6. Common Components

## DataTable
ใช้สำหรับทุกหน้า Management

Features:

- Sorting
- Searching
- Filtering
- Pagination
- Row Action

## Search Filter Section
Reusable component:

Contains:

- Search Input
- Select Filter
- Date Range
- Reset Button

## Page Header
Reusable component:

Contains:

- Breadcrumb
- Title
- Description
- Action Button

## Modal Form
ใช้สำหรับ:

- Create
- Edit
- Delete Confirmation

---

# 7. Mock Data Requirement
ก่อน Connect API ให้ใช้ Mock Data

Mock Modules:

- Audience List
- Broadcast Campaign
- Templates
- Tracking Data
- Dashboard Statistic

---

# 8. Coding Standard
Use:

- TypeScript strict mode
- Functional Components
- React Hooks
- Server Component by default
- Client Component only when required
Naming:

Components:

PascalCase

Example:

```
AudienceTable.tsx
DashboardCard.tsx
```
Functions:

camelCase

---

# 9. Future Backend Integration
API Structure:

```
/auth

/audience

/tags

/templates

/broadcast

/rich-menu

/tracking

/dashboard
```
Frontend should separate:

```
components

features

services

types
```
เพื่อให้ง่ายต่อการเชื่อมต่อ REST API ในอนาคต

---

# 10. Development Goal
สร้าง CRM Dashboard ที่มีคุณภาพระดับ Portfolio สำหรับ Full Stack Developer

เน้นแสดง:

- Frontend Architecture
- Reusable Components
- Data Table Management
- Dashboard Analytics
- API Ready Structure
- Clean Code
- Enterprise UI Pattern
