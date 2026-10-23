# LINE OA CRM - Project Specification

## Project Overview

A Full Stack CRM web application for managing a LINE Official Account (LINE OA).

This project is designed as a portfolio project to demonstrate modern Full Stack architecture, including authentication, REST APIs, webhook integration, background workers, message queues, and third-party API integration.

---

# Objectives

- Demonstrate Full Stack architecture
- Integrate with LINE Messaging API
- Implement asynchronous processing using RabbitMQ
- Handle LINE Webhook events
- Build a modern dashboard
- Follow clean architecture principles
- Production-like project structure

---

# Tech Stack

## Frontend

- Next.js (App Router)
- React
- TypeScript
- TailwindCSS
- shadcn/ui
- TanStack Query
- React Hook Form
- Zod

---

## Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Swagger

---

## Worker

- NestJS
- RabbitMQ Consumer
- LINE Messaging API

---

## Infrastructure

- Docker Compose
- PostgreSQL
- RabbitMQ
- Redis (Optional)
- Nginx (Optional)

---

# Repository Structure

```
crm-frontend/
crm-api/
crm-worker/
```

---

# High Level Architecture

```
                +----------------+
                |   Frontend     |
                +--------+-------+
                         |
                     REST API
                         |
                +--------v-------+
                |   NestJS API   |
                +--------+-------+
                         |
          +--------------+--------------+
          |                             |
     PostgreSQL                    RabbitMQ
                                         |
                                 Broadcast Queue
                                         |
                                 +-------v------+
                                 |    Worker    |
                                 +-------+------+
                                         |
                                  LINE Messaging API
```

Webhook Flow

```
LINE Platform
      |
      |
Webhook Event
      |
POST /webhook
      |
NestJS API
      |
Save Event
      |
Publish Queue
      |
Worker
      |
Business Logic
      |
Database
```

---

# Authentication

- Login
- JWT Access Token
- Refresh Token
- Protected APIs
- Role-based Authorization

Roles

- Admin
- User

---

# Core Features

## 1. Dashboard

Purpose

Provide an overview of LINE OA activity.

Widgets

- Total Friends
- Total Broadcasts
- Messages Sent
- Failed Messages
- New Followers
- Recent Activities

Charts

- Broadcast per Day
- New Followers
- Message Statistics

---

## 2. Broadcast

Purpose

Create and send broadcast messages.

Functions

- Create Broadcast
- Update Broadcast
- Delete Broadcast
- Schedule Broadcast
- Send Immediately
- Preview Template
- View Logs

Broadcast Flow

```
Create Broadcast

↓

API

↓

RabbitMQ

↓

Worker

↓

LINE Push API

↓

Save Result

↓

Dashboard
```

Status

- Draft
- Scheduled
- Processing
- Completed
- Failed

---

## 3. Message Templates

CRUD

Fields

- Name
- Message Type
- Content
- Image URL (optional)

Types

- Text
- Image
- Flex (Future)

---

## 4. LINE Users

Purpose

Display users synced from LINE OA.

Functions

- Search
- Filter
- Pagination
- Detail View

Columns

- Display Name
- User ID
- Status
- Follow Date
- Last Activity

---

## 5. Rich Menu

Functions

- Create Rich Menu
- Upload Image
- Assign Rich Menu
- Unassign Rich Menu

(Area editor is optional)

---

## 6. LINE OA Settings

Store

- Channel Access Token
- Channel Secret

Functions

- Verify Connection
- Update Credentials
- Display Webhook URL

---

## 7. User Settings

Functions

- Update Profile
- Change Password
- Change Avatar (optional)

---

# Webhook

Endpoint

```
POST /webhook/line
```

Supported Events

- follow
- unfollow
- message
- postback

Follow Event

```
Receive Event

↓

Save User

↓

Update Dashboard
```

Message Event

```
Receive Event

↓

Save Message

↓

Update Last Activity
```

---

# Background Workers

## Broadcast Worker

Responsibilities

- Receive Queue
- Send LINE Push Messages
- Retry Failed Requests
- Save Broadcast Logs

---

## Webhook Worker

Responsibilities

- Process Webhook Events
- Update User Information
- Update Analytics

---

# API Modules

```
Auth

Dashboard

Broadcast

Templates

LINE Users

Rich Menu

Settings

Webhook

Queue
```

---

# Suggested API Endpoints

Authentication

```
POST   /auth/login
POST   /auth/refresh
GET    /auth/profile
```

Dashboard

```
GET    /dashboard
```

Broadcast

```
GET    /broadcasts
GET    /broadcasts/:id
POST   /broadcasts
PUT    /broadcasts/:id
DELETE /broadcasts/:id
POST   /broadcasts/:id/send
```

Templates

```
GET
POST
PUT
DELETE
```

LINE Users

```
GET
GET /:id
```

Rich Menu

```
GET
POST
DELETE
```

Settings

```
GET
PUT
```

Webhook

```
POST /webhook/line
```

---

# Database Tables

## users

```
id
email
password
role
created_at
```

---

## line_accounts

```
id
channel_secret
channel_access_token
created_at
```

---

## line_users

```
id
line_user_id
display_name
picture_url
status
followed_at
last_activity
```

---

## message_templates

```
id
name
type
content
image_url
created_at
```

---

## broadcasts

```
id
title
template_id
status
scheduled_at
created_at
```

---

## broadcast_logs

```
id
broadcast_id
line_user_id
status
error_message
sent_at
```

---

## webhook_events

```
id
event_type
payload
created_at
```

---

# Folder Structure

## Frontend

```
src

app/

components/

features/

hooks/

services/

types/

utils/
```

Feature Modules

```
dashboard/

broadcast/

templates/

line-users/

rich-menu/

settings/
```

---

## Backend

```
src

auth/

dashboard/

broadcast/

templates/

line-users/

rich-menu/

settings/

webhook/

queue/

common/

prisma/
```

---

## Worker

```
src

broadcast/

webhook/

consumers/

line/

utils/
```

---

# UI Pages

```
Login

Dashboard

Broadcast List

Create Broadcast

Message Templates

LINE Users

Rich Menu

LINE OA Settings

User Settings

404
```

---

# Non-Functional Requirements

- RESTful API
- Modular Architecture
- Repository Pattern (Optional)
- Swagger Documentation
- Docker Ready
- Environment Variables
- Error Handling
- Validation
- Logging
- Pagination
- Search
- Clean Folder Structure

---

# Future Enhancements

- Segment Broadcast
- Tags
- Auto Reply
- Chat Inbox
- Flex Message Builder
- Campaign Analytics
- Scheduler
- Multiple LINE OA
- Notification Center
- Audit Log
- File Storage (S3)
- Redis Cache
- CI/CD
- Kubernetes Deployment

---

# Portfolio Highlights

This project should demonstrate the following skills:

- Full Stack Development
- Next.js
- NestJS
- PostgreSQL
- Prisma ORM
- JWT Authentication
- REST API Design
- RabbitMQ
- Background Workers
- Webhook Integration
- LINE Messaging API
- Docker
- Clean Architecture
- Third-party API Integration
- Dashboard Development
- Production-ready Folder Structure

# Developer more feature
- [Done] หน้า DashBaord เพิ่ม Date picker เลือกวันที่ได้ 7 วัน, เดือนนี้, ระหว่างวันที่ 
- [Done] หน้า Brodcast เพิ่ม Card Quota, Used, Remaining  Currrent (มี percent บอกด้วย)
- [Done] หน้า Create Message tempalte ปรับให้สูงสุดรองรับ 5 bubble messages ฺ
- [Done] หน้า Create Message tempalte ปรับให้มี Default flex message ย้าย icon ไปหลังสุด และมีเช็ก flex เหมือน flex simulate
- [Done] หน้า Create Message tempalte ปรับ Default Flex เป็น bubble ต้อนรับ + ปุ่มดูรายละเอียด
- [Done] หน้า Create Auto Message Keyword Rule เพิ่มคำที่รอบรับได้แบบ multi tag 
- [Done] หน้า Create New Audience เพิ่ม Section preview result ใช้ filter ข้อมูลตามที่เลือก (live estimate + cached member count)
- [Done] หน้า Create New Audience เพิ่ม filter User Tier (Silver / Gold / Platinum) คู่กับ User Type
- [Done] หน้า LINE Users เพิ่มคอลัมน์ User Tier (Silver / Gold / Platinum)
- [Done] หน้า Create Rich menu เพิ่ม Validate ไฟล์ภาพ png, jpg ขนาดไฟล์ และ size ตามที่ line กำหนดเท่านั้น
- [Done] หน้า Create Rich menu เพิ่มแบบ custom area วาดได้
- [Done] หน้า Create Rich menu ให้เลือก layout น้อยลง แบบ Big, compact, Custom (พร้อม default grid ใต้ Big/Compact)
- [Done] หน้า Create message เพิ่ม Default img / video / carousel (ไฟล์ใน `public/defaults`) + อัปโหลด video พร้อม thumbnail อัตโนมัติ
- [Done] หน้า Create message เพิ่ม Merge Tag ข้อมูล linruser กับ flex msg ได้
- [Done] Sidebar ปิด Link prefetch เพื่อไม่โหลดหน้าเมนูอื่นล่วงหน้าบน prod
- [Done] ทำ User tracking reach, read
- [Done] ทำ Import user ใช้ทำ audience group map user ระบบกับ line ได้ เช่น VIP 
- [Done] ทำ LINE OA Settings ให้ดึงข้อมูลจาก DB มาถ้ามี Disabled ui ไว้เปลี่ยน concection และ test connected ได้
- [Done] ปรับหน้า Dashboard ให้ filter ข้อมูลตาม date picker ได้
- [Done] ทำ Skeleton loading หน้า Dashboard
- [Done] ทำ Skeleton loading หน้า Message template
- [Done] ทำ Skeleton loading หน้า Brodcast
- [Done] เพิ่ม เมนูจัดการ Stock Ecom Liff
- [Done] เพิ่ม Import user ใช้ Map กับ Line เพื่อจัดกลุ่ม Audience
- [Done] เพิ่ม Export excel ได้หลัง Brodcast แล้ว
- [Done] เพิ่มหน้าจัดการ Liff Content เช่น หน้า Ecom จัด layout ต่างๆ มี live preview เอา url ไปใส่ rich menu ได้
- [Done] ทำ Switching rich menu ได้
- [Done]เพิ่มหน้า Brodcast planner แบบ Calendar view คล่าวๆ
- [Done] เพิ่ม Unit test 
- [Done] เพิ่ม E2E Test
- [Done] ทำ Noti แจ้งเตือนผูกกับ user ตอบแชทได้, แจ้งเตือน message จากไลน์
- [Done] เพิ่มเมนู Liff builder จัดการหน้า Ecom สินค้าได้
- [Done] หน้า LINE Users เพิ่ม filter ตาม User Tier
- [Done] หน้า Create Audience preview แสดงรายชื่อ user ตัวอย่างที่ตรง filter
- [Done] หน้า Brodcast เพิ่ม TARGET specific audience แบบ ddl (ต้องไปสร้าง audienct มาก่อน)
- [Done] Inbox chat 1:1 assign agent ได้ให้คนนั้นตอบ Chat history Status: Open / Pending / Closed
- // เพิ่มการทำระบบ Coupoun สะสมแต้มจาก LineOA
- [Done] หน้า Brodcast มีให้เลือก custome audience 
- [Done] ทำ Tag เพิ่มจาก Liff Ecom ว่าใครคือลูกค้าใหม่, ซื้อซ้ำ x ครั้ง
- [Done] ทำ User Settings ให้มี defualt password Setup by Superadmin map กับ lineOA
- [Done] ปรับหน้า Dashboard design ใหม่ให้ดูข้อมูลได้หลากหลายมากขึ้น เพิ่ม Filter btn แบ่งตามกลุ่มของ User tracking (อยากให้มีส่วน block, active user ได้ด้วย), Sale Tracnking (เอาข้อมูลจาก EcomLiff), Brodcast Tracking (จากการ Brodcast)
- [Done] เพิ่ม LineOA mapping กับ user admin รองรับการทำงานหลาย LineOA และแสดง lineOA name บน Navbar
- [Done] ปรับ Navbar มีชื่อ user, role

<!-- ทำทีหลัง -->
- เปลี่ยน Toast ใช้ของ Sandui
- เพิ่ม Skeleton loading แต่ละเมนู
- เพิ่ม Animation frammer ui
- refc โหลดแต่ละหน้าให้ fetch api ไม่เบิ้ลกัน
- ทำ Chahing เพิ่ในแต่ละเมนู จะได้โหลดไวขึ้น
- เพิ่มเมนู Automation workflow เช่น User เพิ่มเพื่อน > ส่งข้อความ welcome > รอ 1 วัน > ส่ง Promotion



<!-- ข้ามไม่ทำ -->
- เมนูจัดการ นัดหมาย Clinic Liff
- เปลี่ยนเมนู จาก line user เป็น Customer Management กด View popup ดูข้อมูลละเอียดได้เพิ่ม เช่น Customer Info เบอร์, Mail, Address, ประวัติการสั่งซื้อ
- เพิ่มเมนู Liff builder จัดการหน้า Contents
- เพิ่มเมนู Liff builder จัดการหน้า นัดหมายได้
- หน้า Audience กด Recalculate / refresh member count ได้
- หน้า View Audience ดูรายชื่อสมาชิกในกลุ่มได้
- ทำระบบ Notification approve กระดิ่ง

