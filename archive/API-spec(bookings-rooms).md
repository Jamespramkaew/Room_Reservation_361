# API Spec: Booking schedule, Room detail, Room filter

**ถึง: ทีม backend และ frontend**

spec นี้ครอบคลุม 3 endpoint จาก Query Test Report ข้อ 1, 2, 4 และ 5
room list (`GET /api/rooms` แบบไม่มี filter) ทำเสร็จแล้ว จึงไม่อยู่ในเอกสารนี้

| # | Method | Path | ใช้กับ | Lambda function |
|---|---|---|---|---|
| 1 | GET | `/api/bookings` | ตารางการจอง รายวันหรือรายสัปดาห์ (report ข้อ 1, 2) | `bookings` (ใหม่) |
| 2 | GET | `/api/rooms/:id` | หน้า room detail (report ข้อ 4) | `rooms` (เดิม) |
| 3 | GET | `/api/rooms?...` | filter ห้อง (report ข้อ 5) | `rooms` (เดิม) |

---

## กติกาที่ใช้ร่วมกันทุก endpoint

- **Base URL**
  - dev server: `http://localhost:3000`
  - LocalStack: `http://roomres.execute-api.localhost.localstack.cloud:4566/dev`
- **Key ใน JSON** เป็น snake_case
- **เวลา**
  - response ส่งเป็น ISO 8601 แบบ UTC เช่น `2026-09-21T02:00:00.000Z` ซึ่งตรงกับ 09:00 เวลาไทย
  - query param ที่เป็นวันที่ (`YYYY-MM-DD`) ถือเป็นวันตามเวลาไทย (`Asia/Bangkok`)
- **Response ที่สำเร็จ**
  ```json
  { "success": true, "message": "...", "data": ... }
  ```
- **Response ที่ error**
  ```json
  { "success": false, "message": "..." หรือ ["...", "..."], "data": null }
  ```
  ถ้า input ผิดหลายจุด `message` จะเป็น array บอกทีละจุด ในรูปแบบ `"<field>: <ปัญหา>"`

**Error ที่เกิดได้กับทุก endpoint** (มาจาก `onError` ใน `src/shared/create-app.ts`)
| Status | message | เกิดเมื่อ |
|---|---|---|
| 404 | `Cannot GET /api/...` | path ไม่มีอยู่ |
| 503 | `The database is unavailable. Please try again shortly` | ต่อ DB ไม่ได้ |
| 503 | `The database took too long to respond. Please try again` | query นานเกิน 10 วินาที |
| 500 | `Internal server error` | บั๊กในโค้ด (ดูรายละเอียดจาก log ด้วย `X-Request-Id`) |

---

## 1. GET `/api/bookings`: ตารางการจอง

ดึงการจองในช่วงวันที่กำหนด ใช้ endpoint เดียวทั้งรายวันและรายสัปดาห์
- ดูวันเดียว: ส่ง `from` กับ `to` เป็นวันเดียวกัน
- ดูจันทร์ถึงศุกร์: ส่ง `from` เป็นวันจันทร์ และ `to` เป็นวันศุกร์

### Request

**Query parameters**
| Param | Type | Required | Default | คำอธิบาย |
|---|---|---|---|---|
| `from` | `YYYY-MM-DD` | ใช่ | | วันแรก นับตั้งแต่ 00:00 เวลาไทย |
| `to` | `YYYY-MM-DD` | ใช่ | | วันสุดท้าย รวมทั้งวันจนถึง 24:00 เวลาไทย ต้องไม่ก่อน `from` และห่างจาก `from` ไม่เกิน 31 วัน |
| `room_id` | string | ไม่ | ทุกห้อง | ดูเฉพาะห้องนี้ |
| `status` | CSV ของ `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED` | ไม่ | `PENDING,APPROVED` | ค่า default ตัดรายการที่ยกเลิกหรือถูกปฏิเสธออก |

การจองที่คาบเกี่ยวกับช่วงวันจะถูกนับด้วย เงื่อนไขคือ `start_time < ขอบท้าย AND end_time > ขอบหน้า`

**ตัวอย่าง**
```
GET /api/bookings?from=2026-09-21&to=2026-09-21
GET /api/bookings?from=2026-09-21&to=2026-09-25&room_id=8abeb9c5-...
```

### Response `200`

เรียงตาม `start_time` แล้วตามด้วย `room.room_name`
```json
{
  "success": true,
  "message": "Bookings retrieved successfully",
  "data": [
    {
      "id": "3f1c...",
      "title": "CS101 ปฏิบัติการ",
      "booking_type": "CLASS",
      "status": "APPROVED",
      "start_time": "2026-09-21T02:00:00.000Z",
      "end_time": "2026-09-21T05:00:00.000Z",
      "room": { "id": "8abe...", "room_name": "LC-101" }
    }
  ]
}
```

| Field | Type | หมายเหตุ |
|---|---|---|
| `id` | string | |
| `title` | string \| null | |
| `booking_type` | `CLASS` \| `SCHEDULE` \| `SPECIAL_EVENT` \| `STUDENT_BOOKING` | |
| `status` | `PENDING` \| `APPROVED` \| `REJECTED` \| `CANCELLED` | |
| `start_time`, `end_time` | ISO 8601 (UTC) | |
| `room` | `{ id, room_name }` | frontend เอาไปวาดตารางได้โดยไม่ต้องเรียก API ห้องเพิ่ม |

ถ้าไม่มีการจองในช่วงนั้น จะได้ `data: []` ซึ่งไม่ถือว่าเป็น error

### Errors
| Status | message | เกิดเมื่อ |
|---|---|---|
| 400 | `from: Required` หรือ `to: Required` | ไม่ได้ส่ง `from` หรือ `to` |
| 400 | `from: Must be a date in YYYY-MM-DD format` | รูปแบบวันผิด หรือวันไม่มีจริง เช่น `2026-02-30` |
| 400 | `to: Must be on or after from` | `to` อยู่ก่อน `from` |
| 400 | `to: Range must not exceed 31 days` | ช่วงวันยาวเกินไป |
| 400 | `status: Must be one of PENDING, APPROVED, REJECTED, CANCELLED` | ส่งค่า status ที่ไม่รู้จัก |

`room_id` ที่ไม่มีอยู่จริงไม่ถือว่าเป็น error ระบบจะตอบ `200` พร้อม `data: []`

---

## 2. GET `/api/rooms/:id`: รายละเอียดห้อง

### Request

**Path parameters**
| Param | Type | คำอธิบาย |
|---|---|---|
| `id` | string | `Room.id` (UUID) |

```
GET /api/rooms/8abeb9c5-5e7f-4e6e-8bfd-d37f7443477f
```

### Response `200`

ใช้ field ชุดเดียวกับ room list และเพิ่ม `facilities` ที่มีรายละเอียดของอุปกรณ์ทุกชิ้น
```json
{
  "success": true,
  "message": "Room retrieved successfully",
  "data": {
    "id": "8abe...",
    "room_name": "LC-101",
    "description": "ห้องปฏิบัติการคอมพิวเตอร์ ...",
    "room_type": "LAB",
    "size": "LARGE",
    "status": "AVAILABLE",
    "seat_capacity": 39,
    "computers": 39,
    "projector": 1,
    "mic": 2,
    "facilities": [
      { "name": "คอมพิวเตอร์", "quantity": 39, "broken_quantity": 0, "note": null },
      { "name": "โปรเจกเตอร์", "quantity": 1, "broken_quantity": 0, "note": null },
      { "name": "ไมโครโฟน", "quantity": 2, "broken_quantity": 0, "note": null },
      { "name": "ไวท์บอร์ด", "quantity": 1, "broken_quantity": 0, "note": null },
      { "name": "เครื่องปรับอากาศ", "quantity": 3, "broken_quantity": 0, "note": null }
    ],
    "photos": [
      { "object_key": "Room1.jpg", "url": "http://localhost:4566/roomres-local-photos/Room1.jpg" }
    ]
  }
}
```

| Field | หมายเหตุ |
|---|---|
| `computers`, `projector`, `mic` | จำนวนรวม ถ้าห้องไม่มีจะเป็น `0` (เหมือน room list) |
| `facilities` | อุปกรณ์ทุกชนิดในห้อง เรียงตาม `RoomFacilities.sort_order` ไม่รวมรายการที่ถูก soft-delete ทั้งใน `RoomFacilities` และ `Facilities` |
| `photos` | เรียงตาม `RoomPhotos.sort_order` รูปแรกใช้เป็นรูปปก |
| `status` | ส่งค่าจริงไปเสมอ ถ้าเป็น `MAINTENANCE` ก็ยังตอบ `200` ให้ frontend แสดงว่าปิดปรับปรุง |

### Errors
| Status | message | เกิดเมื่อ |
|---|---|---|
| 404 | `Room with ID "<id>" not found` | ไม่มีห้องนี้ หรือห้องถูก soft-delete |

---

## 3. GET `/api/rooms?...`: filter ห้อง

เพิ่ม query param ให้ route `GET /api/rooms` เดิม
- ถ้าไม่ส่ง param เลย ระบบทำงานเหมือนเดิมทุกอย่าง
- response แต่ละห้องใช้โครงสร้างเดิมของ room list
- ส่งหลาย param พร้อมกันได้ ทุกเงื่อนไขต้องผ่านพร้อมกัน (AND)

### Request

**Query parameters**
| Param | Type | ตัวอย่าง | เงื่อนไข |
|---|---|---|---|
| `q` | string (1-100 ตัวอักษร) | `lc-10` | `room_name ILIKE '%q%'` ไม่สนตัวพิมพ์เล็กใหญ่ |
| `room_type` | CSV ของ `LAB`, `LECTURE`, `MEETING`, `COWORKING` | `LAB,MEETING` | ห้องต้องเป็นหนึ่งในประเภทที่ส่งมา |
| `facilities` | CSV ของ `computers`, `projector`, `mic` | `projector,mic` | ห้องต้องมี**ครบทุกอย่าง**ที่ส่งมา โดยแต่ละอย่างต้องมี `quantity >= 1` |
| `start` | ISO 8601 พร้อม offset | `2026-09-21T13:00:00+07:00` | ใช้คู่กับ `end` |
| `end` | ISO 8601 พร้อม offset | `2026-09-21T15:00:00+07:00` | ใช้คู่กับ `start` |

**เมื่อส่ง `start` และ `end`**
- ตัดห้องที่มี booking สถานะ `PENDING` หรือ `APPROVED` ซ้อนกับช่วงเวลานั้นออก เงื่อนไขคือ `b.start_time < end AND b.end_time > start`
- ช่วงที่ต่อกันพอดีไม่นับว่าซ้อน เช่น booking 09:00-12:00 กับช่วงค้นหา 12:00-13:00
- ตัดห้องที่ `status` ไม่ใช่ `AVAILABLE` ออกด้วย เพราะห้องเหล่านั้นจองไม่ได้
- ถ้าไม่ส่งเวลา ห้อง `MAINTENANCE` จะยังแสดงเหมือน room list เดิม

**ตัวอย่าง:** หาห้อง lecture ที่มีโปรเจกเตอร์และว่างวันจันทร์ 13:00-15:00
```
GET /api/rooms?room_type=LECTURE&facilities=projector&start=2026-09-21T13:00:00%2B07:00&end=2026-09-21T15:00:00%2B07:00
```
ใน URL ต้องเข้ารหัส `+` เป็น `%2B` ไม่งั้นจะกลายเป็นช่องว่าง ถ้าสร้าง URL ด้วย `URLSearchParams` หรือ `params` ของ axios ตัว library จะเข้ารหัสให้เอง

### Response `200`
เหมือน room list ทุกอย่าง มีเฉพาะห้องที่ผ่านทุกเงื่อนไข ถ้าไม่มีห้องที่ตรงเงื่อนไข จะได้ `data: []`

### Errors
| Status | message | เกิดเมื่อ |
|---|---|---|
| 400 | `q: Must be 1-100 characters` | `q` ว่างหรือยาวเกินไป |
| 400 | `room_type: Must be one of LAB, LECTURE, MEETING, COWORKING` | ประเภทห้องไม่ถูกต้อง |
| 400 | `facilities: Must be one of computers, projector, mic` | ชื่ออุปกรณ์ไม่ถูกต้อง |
| 400 | `start: Must be an ISO 8601 datetime with offset` | รูปแบบเวลาผิด หรือไม่มี offset (`Z` หรือ `+07:00`) |
| 400 | `start and end must be sent together` | ส่งมาแค่ตัวเดียว |
| 400 | `end: Must be after start` | `end <= start` |

---

## หมายเหตุสำหรับคนทำ

- **ลงทะเบียน function `bookings`** ใน `backend-lambda/functions.json` ด้วย route `["/api/bookings", "/api/bookings/{proxy+}"]`
- **`GET /api/rooms/:id` ไม่ต้องเพิ่ม route** เพราะ `/api/rooms/{proxy+}` ของ function `rooms` รับไว้แล้ว
- **ตรวจ input ด้วย `validate('query', schema)`** จาก `src/shared/http/validate.ts` และตั้ง message ใน zod ให้ตรงกับตาราง Errors ด้านบน
- **ชื่อ facility กับ key ที่ใช้ใน API** map กันใน `rooms.service.ts` (`คอมพิวเตอร์` → `computers` เป็นต้น) ถ้าเพิ่มอุปกรณ์ที่ต้องการให้ filter ได้ ให้เพิ่มใน map นั้นก่อน
- **เรื่องที่ยังเปิดอยู่: `GET /api/bookings` ยังไม่มี auth** ทุกคนจะเห็น `title` ของการจองของนักศึกษาทุกคน ถ้าไม่ต้องการแบบนั้น ให้ซ่อน `title` ของ `STUDENT_BOOKING` ไว้จนกว่าจะมีระบบ login
