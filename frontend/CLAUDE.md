# CLAUDE.md — คู่มือโปรเจกต์ Made-to-Order Restaurant

> อ่านไฟล์นี้ทุกครั้งก่อนเริ่มงาน

---

## โครงสร้างหลัก (Single App)

```
Made-to-order-restaurant/
└── frontend/   ← Next.js (UI + Auth + API) — รันที่ port 3000
```

> ไม่มี backend แยกต่างหาก — ทุก API อยู่ใน Next.js App Router

### วิธีรัน
```bash
# จาก root folder (Made-to-order-restaurant/)
npm run dev     # proxy ไป frontend — port 3000

# หรือเข้า frontend โดยตรง
cd frontend && npm run dev
```

---

## Tech Stack

| ส่วน | เทคโนโลยี | Version |
|---|---|---|
| Framework | Next.js App Router | 14.2.0 |
| UI | React 18 + Tailwind CSS 3 | — |
| Auth | NextAuth v4 (Credentials + Google OAuth) | — |
| Database | PostgreSQL (Neon) + Prisma ORM | — |
| Language | JavaScript / JSX | — |

> ❌ ไม่ใช้ TypeScript
> ❌ ไม่มี Express backend

---

## โครงสร้าง frontend/

```
frontend/
├── prisma/
│   └── schema.prisma           # Prisma schema (User, Category, MenuItem, Order, Expense)
├── public/images/              # รูปเมนูทั้งหมด + พื้นหลังร้านอาหาร.jpg
├── src/
│   ├── app/
│   │   ├── layout.js           # Root layout
│   │   ├── globals.css         # Tailwind + custom animations
│   │   ├── page.js             # Landing page
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/route.js   # NextAuth handler
│   │   │   │   └── register/route.js        # สมัครสมาชิก
│   │   │   ├── categories/route.js + [id]/route.js
│   │   │   ├── menu/route.js + [id]/route.js
│   │   │   ├── orders/route.js + [id]/route.js
│   │   │   │            + stream/route.js (SSE admin)
│   │   │   │            + [id]/stream/route.js (SSE customer)
│   │   │   ├── expenses/route.js + [id]/route.js
│   │   │   ├── finance/route.js
│   │   │   ├── stats/route.js
│   │   │   ├── upload/route.js
│   │   │   ├── users/me/route.js
│   │   │   └── seed/route.js
│   │   ├── admin/              # Protected by middleware.js
│   │   ├── menu/page.js
│   │   ├── orders/
│   │   ├── login/page.js
│   │   ├── register/page.js
│   │   └── profile/page.js
│   ├── components/
│   │   ├── layout/Navbar.jsx
│   │   ├── menu/MenuCard.jsx + MenuForm.jsx
│   │   ├── order/Cart.jsx
│   │   ├── admin/AdminSidebar.jsx + OrderDetailModal.jsx
│   │   └── providers/SessionProvider.jsx
│   ├── lib/
│   │   ├── prisma.js           # Prisma client singleton
│   │   ├── authOptions.js      # NextAuth configuration
│   │   ├── autoProgress.js     # Auto-advance order status ตามเวลา
│   │   └── utils.js            # apiError, fmt, generateOrderNumber
│   └── middleware.js           # ป้องกัน /admin/*
├── .env.local                  # env vars
└── package.json
```

---

## Database (Prisma + PostgreSQL)

### Connection
```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

### คำสั่ง Prisma
```bash
# Generate client (ทำหลัง pull หรือ edit schema)
npx prisma generate

# Push schema ไป database (ครั้งแรก หรือหลัง schema เปลี่ยน)
npx prisma db push

# Seed ข้อมูลเมนู (ผ่าน HTTP)
curl -X POST http://localhost:3000/api/seed -H "Content-Type: application/json" -d '{"confirm":"seed"}'

# Prisma Studio (GUI)
npx prisma studio
```

### Models
| Model | Fields หลัก |
|---|---|
| User | name, email, password (bcrypt), phone, address, avatar, role |
| Category | name, description, icon, isActive |
| MenuItem | name, description, price, categoryId, image, isAvailable, preparationTime, options (Json) |
| Order | orderNumber, orderType, tableNumber, customerName, customerPhone, items (Json), totalPrice, deliveryFee, grandTotal, status, delivery (Json), timeline (Json), userId |
| Expense | title, amount, category, date, note |

---

## Authentication

- **Admin** — credentials จาก `.env` (ไม่ผ่าน DB)
- **User** — PostgreSQL + bcrypt หรือ Google OAuth
- **NextAuth อยู่ใน `/api/auth/*`** เท่านั้น
- Google user ครั้งแรก → สร้าง User ใน PostgreSQL อัตโนมัติ
- `/admin/*` ป้องกันด้วย `middleware.js`

### JWT Session fields
```js
session.user: { id, name, email, role, avatar, phone }
```

---

## API Routes

| Method | Endpoint | หน้าที่ |
|---|---|---|
| POST | /api/auth/register | สมัครสมาชิก |
| GET/POST | /api/categories | หมวดหมู่ (?active=true) |
| PUT/DELETE | /api/categories/:id | แก้ไข/ลบ |
| GET/POST | /api/menu | เมนู (?available=true, ?category=id) |
| GET/PUT/DELETE | /api/menu/:id | เมนูเดี่ยว |
| GET/POST | /api/orders | ออเดอร์ (?status=, ?mine=true) |
| GET/PUT/DELETE | /api/orders/:id | ออเดอร์เดี่ยว (PUT/DELETE: admin only) |
| GET | /api/orders/stream | SSE real-time ทุกออเดอร์ (admin only) |
| GET | /api/orders/:id/stream | SSE real-time ออเดอร์เดี่ยว (customer) |
| GET/POST | /api/expenses | รายจ่าย |
| PUT/DELETE | /api/expenses/:id | รายจ่ายเดี่ยว |
| GET | /api/stats | สถิติ dashboard |
| GET | /api/finance | สรุปการเงิน |
| GET/PUT | /api/users/me | โปรไฟล์ user |
| POST | /api/upload | อัพโหลดรูปภาพ |
| POST | /api/seed | Seed ข้อมูลเมนู |

---

## Order Status Flow

### สถานะแยกตามประเภทออเดอร์
| ประเภท | Flow |
|---|---|
| dine-in | pending → confirmed → preparing → ready → completed |
| takeaway | pending → confirmed → preparing → ready → completed |
| delivery | pending → confirmed → preparing → ready → **delivering** → completed |

### Auto-Progress (`autoProgress.js`)
- ทำงานทุกครั้งที่ SSE tick (ทุก 3 วินาที) และทุก GET `/api/orders/:id`
- `pending` → `confirmed` หลัง **2 นาที**
- `confirmed` → `preparing` หลัง **30 วินาที**
- `preparing` → `ready` หลัง **preparationTime** ของเมนูที่นานที่สุดในออเดอร์

### Real-time SSE
- **Admin**: `/api/orders/stream` — ส่งออเดอร์ทั้งหมดทุก 3 วินาที
- **Customer**: `/api/orders/:id/stream` — ส่งออเดอร์เดี่ยวทุก 3 วินาที พร้อม green dot indicator

---

## .env.local

```env
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-here
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your-admin-password
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## Styling

### สี Theme
- Primary: `orange-500` (#f97316)
- Background: `gray-50`

### Custom Classes (globals.css)
```css
.btn-primary / .btn-secondary / .btn-danger
.card / .input / .badge-{pending|preparing|ready|completed|cancelled}
.page-header / .page-title
```

### Custom Animations
| Class | Effect |
|---|---|
| `animate-fade-up[-delay-1/2/3]` | Fade + slide up |
| `animate-fade-in[-delay-1/2/3/4]` | Fade in |
| `animate-scale-in[-delay-1~5]` | Scale 0.88→1 |
| `animate-float / animate-float-slow` | Float loop |
| `animate-pulse-glow` | Orange glow pulse |

---

## Deploy (Vercel + Neon)

```
1. สมัคร neon.tech → สร้าง database → copy DATABASE_URL
2. npx prisma db push  (push schema ไป Neon)
3. push code ขึ้น GitHub
4. สมัคร vercel.com → import repo → ใส่ env variables
5. Deploy
```

---

## สิ่งที่ต้องระวัง

- หน้าที่มี event handler → ต้องมี **`'use client'`** บรรทัดแรก
- ทุก API route ใช้ **Prisma** (`@/lib/prisma`) — ไม่มี Mongoose แล้ว
- `fmt()` จาก utils.js — ใช้ wrap ผลลัพธ์ Prisma เพื่อเพิ่ม `_id` alias (frontend ใช้ `_id`)
- Prisma PUT route — ต้อง strip `id, _id, createdAt, updatedAt` ออกก่อน update เสมอ
- Prisma CLI อ่าน `.env` ไม่ใช่ `.env.local` — `DATABASE_URL` ต้องอยู่ใน `.env` ด้วย
- ราคาตัวเลขเต็ม — `฿55` ไม่ใช่ `฿55.00`
- หลัง schema.prisma เปลี่ยน → ต้อง `npx prisma generate` ก่อน restart
- เบอร์โทรศัพท์ — เก็บเฉพาะตัวเลข ไม่เกิน 10 หลัก (sanitize ทั้ง frontend และ API)
- รายรับ/รายจ่าย — นับเฉพาะออเดอร์ที่ status = `completed` เท่านั้น
- Login — ระบบตรวจ role เองจาก session หลัง sign-in → admin ไป `/admin`, user ไป `/`
- สั่งออเดอร์สำเร็จ → auto-redirect ไป `/orders/:id` ทันที (ไม่ต้องนำทางเอง)

---

## สไตล์การทำงานของเจ้าของโปรเจกต์

- **ทำให้เลย** — ไม่ต้องถาม ถ้างานชัดเจน
- **ภาษาไทยทั้งหมด** — UI, label, placeholder, error message
- **เพิ่ม animation เสมอ** เมื่อสร้าง section/หน้าใหม่
- **ราคาตัวเลขเต็ม** — `฿55` ไม่ใช่ `฿55.00`
- **Simple & focused** — ทำแค่สิ่งที่ขอ ไม่ over-engineer
