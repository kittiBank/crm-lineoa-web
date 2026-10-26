# Dashboard redesign — design reference

Source of truth for the `/dashboard` redesign. Canvas: "CRM Dashboard Redesign" (Claude Design artifact).

**For Claude / developers:** these `.dc.html` files are *design mockups*, not production code.
Read them for layout, copy, colors, spacing and which charts/filters each tab has, then build
the real UI in `src/features/dashboard` with Tailwind + shadcn + Recharts. Do not copy the
`<x-dc>` / `{{hole}}` / `DCLogic` syntax or the inline SVG chart math — that is the mockup runtime.
All numbers, product and campaign names inside are **sample data**.

## Files

| File | Tab | Route (proposed) |
|---|---|---|
| `overview.dc.html` | Overview | `/dashboard` (`?tab=overview`) |
| `users.dc.html` | Users | `/dashboard?tab=users` |
| `sales.dc.html` | Sales (LINE Shop) | `/dashboard?tab=sales` |
| `broadcasts.dc.html` | Broadcasts | `/dashboard?tab=broadcasts` |

Markup is in `<x-dc>…</x-dc>`; the data shape each section needs is in `renderVals()` in the
`<script type="text/x-dc">` block at the bottom of each file.

## Shared layout (all tabs)

- Header: breadcrumb → `Dashboard` h1 → subtitle; right side: period switch `Today | 7D | 30D | 90D` (default 30D) + action button.
- Tabs bar under header (Overview / Users / Sales / Broadcasts), active tab = 2px bottom border.
- Overview only: date-range line — `Last 30 days  Sep 23 – Oct 22, 2026 · percentage compared with the previous 30 days (Aug 24 – Sep 22)`. Ranges are computed from today.
- Section tabs: a filter bar card (all filters are `<select>` dropdowns) + "N filters applied" + Reset.
- KPI cards: label, big value, ▲/▼ % badge (green `#047A35` on `#ECFDF3` = good, `#B93815` on `#FFF4ED` = bad). No sparklines.
- Cards: white, `border #E5E5E5`, radius 12px, padding 20px; page bg `#FAFAFA`; font Inter.
- Rows: chart cards in a wrap row — wide card `flex 2 1 520px`, narrow card `flex 1 1 300px`.

## Color tokens

Charts use a single blue scale (darker = more important / later stage):

| Token | Hex | Use |
|---|---|---|
| `chart-blue-900` | `#1E3A8A` | top tier (Platinum), Completed, clicks |
| `chart-blue-600` | `#2563EB` | primary series / bars |
| `chart-blue-500` | `#3B82F6` | secondary series |
| `chart-blue-400` | `#60A5FA` | tertiary (Silver, Paid, Sent dashed line) |
| `chart-blue-300` | `#93C5FD` | light series (weekdays, lost followers) |
| `chart-blue-200` | `#BFDBFE` | lightest (Member, Pending payment) |
| neutral | `#A3A3A3` / `#D4D4D4` | Cancelled, Draft, previous-period dashed line |
| failed | `#EA580C` / badge `#B93815` on `#FFF4ED` | Failed broadcast only |
| brand | `#06C755` | logo + active tab underline only (not charts) |

Text `#0A0A0A`, muted `#525252` / `#6B6B6B`, grid lines `#EDEDED`.

## Tab contents & filters

**Overview** — KPIs: Total followers, New followers, Revenue, Orders, Messages delivered.
Growth trend area chart with metric switch (New followers / Revenue / Orders / Messages sent) + dashed previous period.
Broadcast → purchase funnel (Link clicks → Shop visits → Added to cart → Orders placed → Paid).
Recent broadcasts table (5 rows) · Top products (5, bar by revenue).

**Users** — Filters: User type, Status, Tier (Silver/Gold/Platinum/Member), Customer tag.
KPIs: Total followers, New followers, Unfollowed/blocked, Net growth, Active rate (30d).
Follower movement (gained bars up, lost bars down, net line) · Members by tier donut + User type / Status stacked bars ·
When users are active (line chart by hour, weekdays vs weekend, peak marker) · Customer tags bars.

**Sales** — Filters: Order status (default "Paid, Shipped & Completed"), Product, Buyer tier, Buyer type (New/Returning).
KPIs: Revenue, Orders, Avg. order value, Repeat purchase rate, Pending payment.
Revenue area + orders bars · Order pipeline (stacked bar + list by `OrderStatus`) · Top products table (units, share, revenue, trend) · Revenue by buyer tier donut + New/Returning buyers.

**Broadcasts** — Filters: Search, Status (with counts), Audience segment, Message type.
KPIs: Broadcasts sent, Messages delivered, Delivery rate, Click rate, Attributed revenue.
Sent vs delivered lines + click bars · Broadcast status donut · Click rate by message type · Revenue by audience segment · Campaign performance table (filtered by status).

## Data not yet available (check API / Prisma before building)

Funnel steps (link clicks, shop visits, add to cart), hourly activity, unfollow/block dates,
attributed revenue per broadcast/segment. Hide or mark these sections until the API returns real data — never ship sample numbers.
