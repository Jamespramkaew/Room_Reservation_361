# Room_Reservation_361
Room Reservation &amp; Utilization Management System

# Room Reservation & Utilization Management System

ระบบจองห้องและบริหารการใช้งานห้องเรียน (CS361 Project) — เว็บแอปพลิเคชันสำหรับให้นักศึกษาค้นหา/ดูรายละเอียดห้อง และให้ผู้ดูแลระบบจัดการข้อมูลห้อง อุปกรณ์ประจำห้อง รูปภาพห้อง และการจอง

ประกอบด้วย 2 ส่วนหลักใน monorepo เดียว:

- **`backend/`** — REST API ด้วย NestJS 11 + Prisma 7 + PostgreSQL 17 + AWS S3
- **`frontend/`** — Single Page Application ด้วย React 19 + Vite + TypeScript + Tailwind CSS 4

---

## สารบัญ

- [Tech Stack](#tech-stack)
- [โครงสร้างโปรเจกต์](#โครงสร้างโปรเจกต์)
- [Data Model](#data-model)
- [API Endpoints](#api-endpoints)
- [รูปแบบ Response](#รูปแบบ-response)
- [การติดตั้งและใช้งาน](#การติดตั้งและใช้งาน)
- [Environment Variables](#environment-variables)
- [Scripts ที่ใช้บ่อย](#scripts-ที่ใช้บ่อย)
- [สถาปัตยกรรม Backend](#สถาปัตยกรรม-backend)
- [สถาปัตยกรรม Frontend](#สถาปัตยกรรม-frontend)
- [สถานะการพัฒนา](#สถานะการพัฒนา)

---

## Tech Stack

### Backend

| หมวด | เทคโนโลยี |
|---|---|
| Framework | NestJS 11 (Express platform) |
| ภาษา | TypeScript 5.7 |
| ORM | Prisma 7.9 (`prisma-client` generator + `@prisma/adapter-pg` driver adapter) |
| ฐานข้อมูล | PostgreSQL 17 |
| Storage | AWS S3 (`@aws-sdk/client-s3`) |
| Validation | `class-validator` + `class-transformer` (ผ่าน Global `ValidationPipe`) |
| Security | `helmet`, `cookie-parser`, CORS แบบกำหนด origin |
| Auth (เตรียมไว้) | `@nestjs/jwt`, `bcrypt` |
| Upload | `multer` (`FileInterceptor`) |
| Testing | Jest + Supertest |

### Frontend

| หมวด | เทคโนโลยี |
|---|---|
| Framework | React 19 (+ React Compiler ผ่าน Babel plugin) |
| Build tool | Vite 8 |
| Routing | React Router 7 (`createBrowserRouter`) |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) + inline style objects |
| HTTP | Axios (มี interceptor สำหรับ token และ error handling) |
| Form | React Hook Form |
| UI อื่น ๆ | Swiper (แกลเลอรีรูป), Lucide React (ไอคอน) |

### DevOps / Tooling

- Docker Compose สำหรับ PostgreSQL และ Prisma Studio
- ESLint 9/10 + Prettier
- Prisma Migrate สำหรับ schema versioning

---

## โครงสร้างโปรเจกต์

```
Room_Reservation_361/
├── docker-compose.yml            # PostgreSQL 17 + Prisma Studio (profile: studio)
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         # นิยาม data model ทั้งหมด
│   │   ├── migrations/           # 3 migrations
│   │   └── seed.ts               # ข้อมูลตัวอย่าง (users, rooms, facilities, bookings)
│   ├── prisma.config.ts          # Prisma 7 config file
│   └── src/
│       ├── main.ts               # Bootstrap: helmet, CORS, ValidationPipe, prefix /api
│       ├── app.module.ts         # รวมทุกโมดูล + ผูก middleware
│       ├── common/
│       │   ├── filters/          # Global exception filter
│       │   ├── interfaces/       # ApiResponse<T>, Pagination
│       │   ├── middlewares/      # ตรวจ Content-Type และ body ว่าง
│       │   └── utils/            # successResponse helper
│       ├── prisma/               # PrismaService (connect with retry) + base repository
│       ├── rooms/                # โมดูลหลัก: controller / service / repositories / dto
│       ├── room-photos/          # จัดการรูปภาพห้อง (อัปโหลดขึ้น S3)
│       ├── facilities/           # CRUD อุปกรณ์/สิ่งอำนวยความสะดวก
│       ├── s3/                   # S3Service (upload / delete)
│       └── example/              # โมดูลตัวอย่างเป็น template ของ pattern
└── frontend/
    └── src/
        ├── router/index.tsx      # นิยาม routes
        ├── layouts/MainLayout.tsx
        ├── pages/                # Rooms, RoomDetail, AdminConsole
        ├── components/           # NavBar, RoomCard, SearchFilter, RoomGallery ฯลฯ
        ├── config/axios.ts       # Axios instance + interceptors
        ├── services/api.ts       # get / post / put / deleteRequest แบบ generic
        ├── data/rooms.ts         # ข้อมูล mock ที่ยังใช้อยู่ตอนนี้
        └── types/room.ts
```

> หมายเหตุ: โฟลเดอร์ `backend/.claude/`, `backend/.windsurf/` และ `backend/.agents/` เป็นชุด skill files ของ Prisma สำหรับ AI coding agent ไม่เกี่ยวกับ runtime ของแอป

---

## Data Model

Schema อยู่ที่ `backend/prisma/schema.prisma` ใช้ PostgreSQL และ UUID เป็น primary key ทุกตาราง

### Enums

| Enum | ค่า |
|---|---|
| `UserRole` | `STUDENT`, `ADMIN` |
| `RoomStatus` | `AVAILABLE`, `MAINTENANCE`, `RESERVED` |
| `RoomSize` | `SMALL`, `MEDIUM`, `LARGE` |
| `RoomType` | `LAB`, `LECTURE`, `MEETING` |
| `BookingType` | `CLASS`, `SCHEDULE`, `SPECIAL_EVENT`, `STUDENT_BOOKING` |
| `BookingStatus` | `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED` |

### ตารางหลัก

**`User`** — ผู้ใช้ระบบ เก็บ `username` (unique), `password_hash` (bcrypt), `role`, `email` มีความสัมพันธ์ 2 เส้นกับ `Booking` คือรายการที่ตัวเองจอง (`UserBookings`) และรายการที่ตัวเองเป็นคนยกเลิก (`CancelledByUser`)

**`Room`** — ห้อง เก็บ `room_name` (unique), `description`, `seat_capacity`, `status`, `size`, `room_type` รองรับ soft delete ผ่าน `deleted_at`

**`Booking`** — การจอง เชื่อม `user_id` และ `room_id` เก็บช่วงเวลา `start_time`/`end_time`, `booking_type`, `status` (ค่าเริ่มต้น `PENDING`) และข้อมูลการยกเลิก (`cancelled_by`, `cancel_reason`, `cancelled_at`)

**`Facilities`** — รายการอุปกรณ์กลาง เช่น คอมพิวเตอร์ โปรเจกเตอร์ ไมโครโฟน ชื่อเป็น unique และรองรับ soft delete

**`RoomFacilities`** — ตารางเชื่อม Room ↔ Facilities แบบ many-to-many พร้อมข้อมูลเพิ่ม: `quantity` (จำนวนทั้งหมด), `broken_quantity` (จำนวนที่ชำรุด), `sort_order`, `note` มี unique constraint `[room_id, facility_id]` เพื่อกันข้อมูลซ้ำ

**`RoomPhotos`** — รูปภาพห้อง เก็บเฉพาะ `object_key` ของไฟล์บน S3 (ไม่เก็บ URL เต็ม) พร้อม `caption` และ `sort_order` ลบตาม Room แบบ cascade

**`Example`** — ตารางตัวอย่างสำหรับทดสอบ pattern ไม่ได้ใช้งานจริง

### ความสัมพันธ์โดยสรุป

```
User 1──* Booking *──1 Room
                      │
                      ├──* RoomPhotos
                      └──* RoomFacilities *──1 Facilities
```

### Migrations

| Migration | รายละเอียด |
|---|---|
| `20260824135250_initial` | สร้างตารางและ enum ทั้งหมด |
| `20260825150541_add_deleted_at_to_facilities` | เพิ่ม soft delete ให้ Facilities |
| `20260826045909_add_room_type_to_room` | เพิ่มฟิลด์ `room_type` ให้ Room |

---

## API Endpoints

ทุก endpoint มี global prefix `/api` (ตั้งค่าที่ `main.ts`) ยังไม่มี authentication guard บังคับใช้ในเวอร์ชันปัจจุบัน

### Rooms — `/api/rooms`

| Method | Path | คำอธิบาย |
|---|---|---|
| `GET` | `/api/rooms` | ดึงรายการห้องพร้อม pagination และ filter |
| `GET` | `/api/rooms/:roomId` | ดึงรายละเอียดห้องรายตัว (รวม facilities และรูปภาพ) |
| `POST` | `/api/rooms` | สร้างห้องใหม่ (คืน `201 Created`) |
| `PATCH` | `/api/rooms/:roomId` | แก้ไขข้อมูลห้องบางส่วน |
| `DELETE` | `/api/rooms/:roomId` | ลบห้องแบบ soft delete (คืน `id` และ `deleted_at`) |

**Query parameters ของ `GET /api/rooms`** (นิยามใน `QueryRoomsDto`)

| Parameter | ชนิด | ค่าเริ่มต้น | เงื่อนไข |
|---|---|---|---|
| `page` | integer | `1` | ต้อง ≥ 1 |
| `limit` | integer | `10` | 1–100 |
| `search` | string | – | ค้นหาจากชื่อห้อง (ตัดช่องว่างหัวท้ายอัตโนมัติ) |
| `status` | enum | – | `AVAILABLE` / `MAINTENANCE` / `RESERVED` |
| `capacity` | integer | – | ต้อง ≥ 1 |
| `facilities` | string[] | – | รับค่าเดี่ยวหรือ array ก็ได้ |
| `size` | enum | – | `SMALL` / `MEDIUM` / `LARGE` |
| `room_type` | enum | – | `LAB` / `LECTURE` / `MEETING` |

**Body ของ `POST /api/rooms`**

```jsonc
{
  "room_name": "LC-101",          // required, unique
  "capacity": 39,                  // required, >= 1
  "status": "AVAILABLE",           // required, RoomStatus
  "size": "LARGE",                 // required, RoomSize
  "room_type": "LAB",              // required, RoomType
  "description": "ห้องแลปคอมพิวเตอร์",  // optional
  "facilities": [                  // optional
    {
      "facilityId": "uuid",        // required
      "quantity": 39,              // required, >= 1
      "broken_quantity": 0,        // optional, default 0
      "sort_order": 1,             // required, >= 1
      "note": null                 // optional
    }
  ]
}
```

### Room Photos — `/api/rooms/:roomId/photos`

| Method | Path | คำอธิบาย |
|---|---|---|
| `GET` | `/api/rooms/:roomId/photos` | ดึงรูปทั้งหมดของห้อง |
| `POST` | `/api/rooms/:roomId/photos` | อัปโหลดรูปขึ้น S3 (`multipart/form-data`) |
| `PATCH` | `/api/rooms/:roomId/photos/:photoId` | แก้ `caption` และ/หรือ `sortOrder` |
| `DELETE` | `/api/rooms/:roomId/photos/:photoId` | ลบรูป |

**ข้อกำหนดการอัปโหลด**

- field name ของไฟล์คือ `file`
- ชนิดที่รองรับ: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- ขนาดสูงสุด 25 MB
- object key ที่สร้างขึ้นมีรูปแบบ `rooms/{roomId}/{timestamp}-{originalname}`
- ถ้าบันทึกลงฐานข้อมูลไม่สำเร็จหลังอัปโหลด ระบบจะลบไฟล์บน S3 ทิ้งเพื่อไม่ให้เกิดไฟล์กำพร้า
- route นี้ถูก exclude ออกจาก `RequestValidationMiddleware` เพราะไม่ได้ส่งเป็น JSON

### Facilities — `/api/facilities`

| Method | Path | คำอธิบาย |
|---|---|---|
| `GET` | `/api/facilities` | ดึงรายการอุปกรณ์ทั้งหมด |
| `GET` | `/api/facilities/:id` | ดึงอุปกรณ์รายตัว |
| `POST` | `/api/facilities` | สร้างอุปกรณ์ใหม่ (คืน `201 Created`) |
| `PATCH` | `/api/facilities/:id` | แก้ไขอุปกรณ์ |
| `DELETE` | `/api/facilities/:id` | ลบอุปกรณ์ |

### อื่น ๆ

| Method | Path | คำอธิบาย |
|---|---|---|
| `GET` | `/api` | health check พื้นฐาน (คืนข้อความจาก `AppService`) |
| — | `/api/example` | โมดูลตัวอย่างสำหรับอ้างอิง pattern |

---

## รูปแบบ Response

ทุก response ผ่าน helper `successResponse()` และ `HttpExceptionFilter` ทำให้มีโครงสร้างเดียวกันทั้งระบบ

**สำเร็จ**

```json
{
  "success": true,
  "message": "Rooms fetched successfully.",
  "data": [ /* ... */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "total_pages": 5
  }
}
```

`pagination` จะมีเฉพาะ endpoint ที่รองรับการแบ่งหน้า

**ผิดพลาด**

```json
{
  "success": false,
  "message": "Room not found",
  "data": null
}
```

`HttpExceptionFilter` ใช้ `@Catch()` แบบไม่ระบุชนิด จึงจับได้ทั้ง `HttpException` และ error ที่ไม่คาดคิด กรณีหลังจะถูก log ลง console และคืน status `500`

---

## การติดตั้งและใช้งาน

### ความต้องการเบื้องต้น

- Node.js 22 ขึ้นไป
- Docker และ Docker Compose (หรือ PostgreSQL 17 ที่ติดตั้งเอง)
- บัญชี AWS พร้อม S3 bucket (จำเป็นเฉพาะฟีเจอร์อัปโหลดรูป)

### 1. Clone และเตรียมฐานข้อมูล

```bash
git clone https://github.com/Jamespramkaew/Room_Reservation_361.git
cd Room_Reservation_361

# เปิด PostgreSQL ด้วย Docker
docker compose up -d db
```

ฐานข้อมูลจะรันที่ `localhost:5432` ด้วยค่า `postgres` / `password` / database `platform` และเก็บข้อมูลถาวรใน volume ชื่อ `postgres_data`

### 2. ตั้งค่าและรัน Backend

```bash
cd backend
cp .env.example .env        # แล้วแก้ค่าตามต้องการ
npm install

npx prisma generate         # สร้าง Prisma Client ไปที่ src/generated/prisma
npx prisma migrate dev      # รัน migration ทั้งหมด
npm run prisma:seed         # ใส่ข้อมูลตัวอย่าง (ไม่บังคับ)

npm run start:dev
```

API จะรันที่ `http://localhost:3000/api`

### 3. ตั้งค่าและรัน Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

เว็บจะรันที่ `http://localhost:5173` ซึ่งตรงกับค่า `CORS_ORIGIN` ฝั่ง backend อยู่แล้ว

### 4. เปิด Prisma Studio (ไม่บังคับ)

```bash
# วิธีที่ 1: ผ่าน npm script
cd backend && npm run prisma:studio

# วิธีที่ 2: ผ่าน Docker profile
docker compose --profile studio up -d
```

เข้าใช้งานได้ที่ `http://localhost:5555`

---

## Environment Variables

### `backend/.env`

| ตัวแปร | ตัวอย่าง | คำอธิบาย |
|---|---|---|
| `PORT` | `3000` | พอร์ตของ API server |
| `NODE_ENV` | `development` | โหมดการทำงาน |
| `DATABASE_URL` | `postgresql://postgres:password@localhost:5432/platform` | connection string ของ PostgreSQL |
| `CORS_ORIGIN` | `http://localhost:5173` | origin ที่อนุญาตให้เรียก API |
| `S3_PUBLIC_URL` | `https://<bucket>.s3.<region>.amazonaws.com` | base URL สำหรับประกอบเป็น URL รูปเต็ม |
| `JWT_SECRET` | – | เตรียมไว้สำหรับระบบ auth |
| `JWT_EXPIRES_IN` | `1d` | อายุของ token |
| `AWS_REGION` | `ap-southeast-1` | region ของ S3 |
| `AWS_ACCESS_KEY_ID` | – | credential ของ AWS |
| `AWS_SECRET_ACCESS_KEY` | – | credential ของ AWS |
| `AWS_S3_BUCKET` | – | ชื่อ bucket ที่ใช้เก็บรูป |

> ⚠️ ตัวแปรกลุ่ม `AWS_*` ถูกอ่านใน `S3Service` แต่ยังไม่ได้ระบุไว้ใน `.env.example` ต้องเพิ่มเองก่อนใช้ฟีเจอร์อัปโหลดรูป มิฉะนั้น service จะสร้าง S3 client ด้วยค่าว่าง

### `frontend/.env`

| ตัวแปร | ค่าเริ่มต้น | คำอธิบาย |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000/api` | base URL ของ API |
| `VITE_API_TIMEOUT` | `30000` | timeout ของ axios (มิลลิวินาที) |
| `VITE_APP_NAME` | `Room Reservation System` | ชื่อแอป |
| `VITE_APP_VERSION` | `0.0.1` | เวอร์ชัน |
| `VITE_ENV` | `development` | environment |
| `VITE_ENABLE_DEBUG` | `false` | เปิด log request/response ใน console |

---

## Scripts ที่ใช้บ่อย

### Backend

| คำสั่ง | หน้าที่ |
|---|---|
| `npm run start:dev` | รันแบบ watch mode |
| `npm run start:debug` | รันพร้อม debugger |
| `npm run build` | build ด้วย Nest CLI |
| `npm run start:prod` | รันไฟล์ที่ build แล้ว (`dist/main`) |
| `npm run lint` | ESLint พร้อม `--fix` |
| `npm run format` | จัดรูปแบบโค้ดด้วย Prettier |
| `npm test` | unit test |
| `npm run test:cov` | test พร้อม coverage |
| `npm run test:e2e` | end-to-end test |
| `npm run prisma:seed` | รัน seed script |
| `npm run prisma:studio` | เปิด Prisma Studio |

### Frontend

| คำสั่ง | หน้าที่ |
|---|---|
| `npm run dev` | dev server ของ Vite |
| `npm run build` | type-check แล้ว build production |
| `npm run preview` | ดูตัวอย่าง production build |
| `npm run lint` | ESLint |

---

## สถาปัตยกรรม Backend

### Layered Architecture

โปรเจกต์ใช้รูปแบบ **Controller → Service → Repository** อย่างสม่ำเสมอทุกโมดูล

- **Controller** — รับ request, ผูก DTO, ห่อ response ด้วย `successResponse()` ไม่มี business logic
- **Service** — business logic ทั้งหมด รวมถึงการตรวจสอบความถูกต้อง, การแปลงข้อมูลเป็น response shape (`RoomResponse`, `RoomDetailResponse`) และการเรียก transaction
- **Repository** — เข้าถึงฐานข้อมูลผ่าน Prisma โมดูล `rooms` แยก repository ย่อยเป็น `rooms.repository.ts`, `repositories/facility.repository.ts` และ `repositories/room-facility.repository.ts`

### PrismaService

`PrismaService` extends `PrismaClient` และใช้ driver adapter `@prisma/adapter-pg` กับ `pg.Pool` มีจุดเด่นคือ:

- ตรวจสอบว่ามี `DATABASE_URL` ตั้งแต่ constructor ถ้าไม่มีจะ throw ทันที
- `connectWithRetry()` พยายามเชื่อมต่อสูงสุด 3 ครั้ง เว้นระยะ 2 วินาที และยิง `SELECT 1` เพื่อยืนยัน ถ้าล้มเหลวครบจะพิมพ์ checklist แล้ว `process.exit(1)`
- ปิด connection อัตโนมัติผ่าน `onModuleDestroy`
- มี `checkConnection()` สำหรับ health check

### Global Pipeline

ลำดับการทำงานของ request ตั้งค่าไว้ใน `main.ts` และ `app.module.ts`:

1. **Helmet** — ตั้ง security headers
2. **Cookie Parser** — อ่าน cookie
3. **CORS** — อนุญาตเฉพาะ `CORS_ORIGIN` พร้อม `credentials: true`
4. **RequestValidationMiddleware** — สำหรับ `POST`/`PUT`/`PATCH` บังคับให้ `Content-Type` เป็น `application/json` และ body ต้องไม่ว่าง (ข้าม `GET`/`DELETE` และ route อัปโหลดรูป)
5. **ValidationPipe** — `whitelist: true` ตัด property ที่ไม่ได้ประกาศใน DTO ทิ้งเงียบ ๆ, `transform: true` พร้อม `enableImplicitConversion` สำหรับแปลง query string เป็นตัวเลข/enum
6. **HttpExceptionFilter** — แปลงทุก exception เป็น response format เดียวกัน

### การจัดการรูปภาพ

ฐานข้อมูลเก็บเฉพาะ `object_key` ไม่เก็บ URL เต็ม แล้วประกอบ URL ตอน response โดยใช้ `S3_PUBLIC_URL` วิธีนี้ทำให้เปลี่ยน bucket หรือย้าย CDN ได้โดยไม่ต้องแก้ข้อมูลเดิม

---

## สถาปัตยกรรม Frontend

### Routing

`src/router/index.tsx` ใช้ `createBrowserRouter` โดยมี `MainLayout` เป็น layout ครอบทุกหน้า

| Path | Component | คำอธิบาย |
|---|---|---|
| `/` | `Rooms` | หน้าแรก แสดงรายการห้องแบบ grid 3 คอลัมน์ พร้อมค้นหาและกรอง |
| `/rooms/:id` | `RoomDetail` | รายละเอียดห้อง แกลเลอรีรูป อุปกรณ์ และกฎการจอง |
| `/admin/console` | `AdminConsole` | หน้าผู้ดูแลระบบ (ยังเป็น placeholder) |

> `src/App.tsx` ถูกแทนที่ด้วยสถาปัตยกรรม router แล้ว เหลือไว้เป็นคอมเมนต์อธิบายเท่านั้น

### Components

| Component | หน้าที่ |
|---|---|
| `NavBar` | แถบนำทางด้านบน |
| `SearchFilter` | ช่องค้นหา + dropdown กรองประเภทห้องและอุปกรณ์ พร้อม click-outside handler |
| `RoomCard` | การ์ดแสดงห้องในหน้ารายการ |
| `RoomGallery` | แกลเลอรีรูปในหน้ารายละเอียด (ใช้ Swiper) |
| `EquipmentBar` | แสดงอุปกรณ์ที่มีในห้อง |
| `BookingRules` | แสดงกฎ/เงื่อนไขการจอง |
| `EmptyState` | แสดงเมื่อค้นหาไม่พบผลลัพธ์ |

### ชั้นเรียก API

`src/config/axios.ts` สร้าง axios instance พร้อม interceptor:

- **Request** — แนบ `Authorization: Bearer <token>` จาก `localStorage` อัตโนมัติถ้ามี และ log request เมื่อเปิด debug
- **Response** — เจอ `401` จะล้าง token แล้ว redirect ไป `/login`, เจอ `403`/`404`/`5xx` จะ log error แยกประเภท

`src/services/api.ts` ห่อ axios เป็นฟังก์ชัน `get` / `post` / `put` / `deleteRequest` ที่คืนค่าเป็น `{ success, data }` หรือ `{ success, error }` เสมอ ทำให้ไม่ต้อง try-catch ซ้ำในทุกคอมโพเนนต์

---

## สถานะการพัฒนา

### ทำเสร็จแล้ว

- ออกแบบ schema ครบทุกตาราง พร้อม migration 3 ชุด
- CRUD ห้องเรียนแบบเต็ม พร้อม pagination, ค้นหา และกรองหลายเงื่อนไข
- CRUD อุปกรณ์ และการผูกอุปกรณ์เข้ากับห้องพร้อมจำนวน/จำนวนที่ชำรุด
- อัปโหลด/แก้ไข/ลบรูปภาพห้องผ่าน S3 พร้อม validation และ rollback
- Response format และ error handling แบบรวมศูนย์
- Seed script สร้างข้อมูลตัวอย่างครบทุกตาราง
- UI หน้ารายการห้องและหน้ารายละเอียดห้อง

### ยังไม่เสร็จ / งานที่เหลือ

- **Authentication & Authorization** — ติดตั้ง `@nestjs/jwt` และ `bcrypt` ไว้แล้ว มีตัวแปร JWT ใน env แต่ยังไม่มีโมดูล auth, guard หรือ route login
- **Booking API** — มีโมเดล `Booking` ครบใน schema แต่ยังไม่มี controller/service/repository ที่เกี่ยวข้อง
- **Frontend ยังใช้ข้อมูล mock** — หน้า `Rooms` และ `RoomDetail` อ่านจาก `src/data/rooms.ts` ยังไม่ได้ต่อกับ API จริง (ชั้น axios/service เตรียมไว้พร้อมแล้ว)
- **Type mismatch ระหว่างฝั่ง** — `frontend/src/types/room.ts` ใช้ชื่อฟิลด์แบบ mock (`name`, `desc`, `seats`, `size: 'Small'`) ต่างจาก response ของ API (`room_name`, `description`, `capacity`, `size: 'SMALL'`) ต้องปรับให้ตรงกันตอนเชื่อม API
- **หน้า Admin Console** — ยังเป็น placeholder
- **Test coverage** — มีเพียง `app.controller.spec.ts` และ e2e spec ตั้งต้น
- **`docker-compose.yml`** — service `prisma-studio` mount โฟลเดอร์ `./server` ซึ่งไม่มีอยู่ในรีโป ควรแก้เป็น `./backend`
- **`.env.example` ของ backend** — ยังขาดตัวแปร `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`

---

## แนวทางการพัฒนาต่อ

โปรเจกต์ใช้ branch naming แบบ `fe/feature/*` และ `be/feature/*` แล้วเปิด Pull Request เข้า `main`

เมื่อจะเพิ่มโมดูลใหม่ในฝั่ง backend แนะนำให้ยึดโครงสร้างเดียวกับโมดูล `rooms`:

```
src/<module>/
├── dto/
│   ├── create-<module>.dto.ts
│   ├── update-<module>.dto.ts
│   ├── query-<module>.dto.ts
│   └── index.ts
├── <module>.controller.ts
├── <module>.service.ts
├── <module>.repository.ts
├── <module>.module.ts
└── index.ts
```

จากนั้นลงทะเบียนโมดูลใน `app.module.ts` โมดูล `example/` เป็นเทมเพลตขนาดเล็กที่ดูเป็นตัวอย่างได้

---

## License

UNLICENSED — โปรเจกต์เพื่อการศึกษา รายวิชา CS361
