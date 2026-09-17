# LocalStack Quickstart

**ถึง: ทุกคน**

รัน backend ตัวใหม่บนเครื่องตัวเอง โดยไม่ต้องมีบัญชี AWS และไม่เสียเงิน
LocalStack คือตัวจำลอง AWS ที่รันใน Docker ทำให้เราลอง Lambda กับ API Gateway ได้เหมือนของจริง แต่จะไม่มี RDS แต่ไม่เป็นไร manual เอาชิลล์ๆ

อยากรู้ลึกกว่านี้อ่าน [คู่มือฉบับเต็ม](lambda-localstack-getting-started.md)

---

## 1. สิ่งที่ต้องมีในเครื่อง

| # | ของที่ต้องมี | หมายเหตุ |
|---|---|---|
| 1 | Docker | ต้องเปิดอยู่ตอนใช้งาน |
| 2 | Node.js 20 ขึ้นไป | |
| 3 | AWS CLI v2, jq, zip | ไม่ต้องมีบัญชี AWS และไม่ต้องรัน `aws configure` |
| 4 | LocalStack auth token | สมัครแผน Hobby ฟรีที่ https://app.localstack.cloud แล้ว copy token จากหน้า workspace |

Windows ให้ทำทุกอย่างใน WSL เพราะสคริปต์เป็น bash

---

## 2. ตั้งค่าครั้งแรก

| # | ทำอะไร | คำสั่ง |
|---|---|---|
| 1 | สร้างไฟล์ env ที่ root แล้วใส่ token | `cp .env.example .env` |
| 2 | สร้างไฟล์ env ของ backend | `cd backend-lambda && cp .env.example .env` |
| 3 | ลง dependency | `npm install` |
| 4 | เปิด database | `cd .. && docker compose up -d db` |
| 5 | ลงตารางและข้อมูลตัวอย่าง | `cd backend-lambda && npm run db:migrate && npm run db:seed` |

ในไฟล์ `.env` ที่ root ใส่ 2 ค่านี้

```
LOCALSTACK_AUTH_TOKEN=<token ของคุณ>
DB_HOST_PORT=5432
```

ถ้าพอร์ต 5432 ถูกใช้อยู่แล้วให้เปลี่ยนเป็น 5433 แล้วแก้พอร์ตใน `DATABASE_URL` ของ `backend-lambda/.env` ตามด้วย

token เป็นของส่วนตัว อย่าใส่ใน `.env.example` เพราะไฟล์นั้นขึ้น git

---

## 3. คำสั่ง

เขียนโค้ดปกติ ใช้ dev server ไม่ต้องเปิด LocalStack

```bash
cd backend-lambda
npm run dev
curl http://localhost:3000/api/health
```

เช็คว่ารันบน Lambda ได้จริง ก่อนเปิด PR

```bash
docker compose up -d        # ที่ root
cd backend-lambda
npm run deploy:local
curl http://roomres.execute-api.localhost.localstack.cloud:4566/dev/api/health
```

---

## 4. คำสั่งที่ใช้บ่อย

| อยากทำอะไร | คำสั่ง |
|---|---|
| deploy เฉพาะฟังก์ชันเดียว | `npm run deploy:local -- facilities` |
| แก้โค้ดแล้วเห็นผลทันที | `HOT_RELOAD=1 npm run deploy:local` แล้วอีก terminal รัน `npm run build -- --watch` |
| ดู log ของฟังก์ชัน | `aws --endpoint-url http://localhost:4566 logs tail /aws/lambda/roomres-facilities --follow` |
| ตรวจ type | `npm run typecheck` |
| ลงตารางใหม่หลัง pull โค้ด | `npm run db:migrate` |
| ล้าง DB เริ่มใหม่ | `npm run db:fresh` |
| ลบของทั้งหมดบน LocalStack | `npm run destroy:local` |

---

## 5. ติดปัญหา

| อาการ | สาเหตุ |
|---|---|
| LocalStack ไม่ขึ้น | `.env` ที่ root ยังไม่มี token หรือใส่ผิด ดูด้วย `docker compose logs localstack` |
| deploy บอกว่า LocalStack is not reachable | container ยังไม่พร้อม เช็ค `curl http://localhost:4566/_localstack/health` |
| ได้ `{"message": "Missing Authentication Token"}` | path นั้นไม่มีใน API Gateway ต้องเพิ่ม route ใน `functions.json` แล้ว deploy ใหม่ |
| ได้ 502 หรือ Internal server error | โค้ดใน Lambda พัง ดู log ตามตารางข้างบน |
| Lambda ต่อ DB ไม่ได้ แต่ dev server ต่อได้ | ในมุมของ Lambda ชื่อ host คือ `db` ไม่ใช่ `localhost` ค่าอยู่ใน `infra/env/local.env` |
| ปิดเปิด docker แล้วเรียก API ไม่ได้ | LocalStack แผนฟรีไม่เก็บของข้ามการปิดเปิด รัน `npm run deploy:local` ใหม่ |

---

## 6. จะเขียนโค้ด

ให้ดูจากไฟล์ Facilities มาว่าเราทำยังไง มันก็ยังคงความเป็น Robustness ไว้ กล่าวคือมี repo, schema, service, handler แยกโซน
CRUD ของ facilities เป็นโดเมนที่เราสร้างขึ้นมาเผื่อ ก็อปไปใช้เป็นแม่แบบได้เลย

`backend-lambda/src/functions/facilities/`

| ไฟล์ | หน้าที่ |
|---|---|
| `app.ts` | ประกาศ route ทั้งหมดของโดเมนนี้ |
| `handler.ts` | จุดที่ Lambda เรียก มีบรรทัดเดียว |
| `facilities.schema.ts` | กฎของ input ตรวจด้วย zod |
| `facilities.service.ts` | business rule ผิดเมื่อไหร่ก็ `throw notFound(...)` หรือ `conflict(...)` |
| `facilities.repository.ts` | query ด้วย Drizzle |

ทำโดเมนใหม่

| # | ทำอะไร |
|---|---|
| 1 | ก็อปโฟลเดอร์ `facilities` เป็นชื่อโดเมนของคุณ แล้วแก้ basePath ใน `app.ts` |
| 2 | เพิ่มใน `functions.json` เช่น `{ "name": "bookings", "routes": ["/api/bookings", "/api/bookings/{proxy+}"] }` |
| 3 | เทสด้วย `npm run dev` แล้วตามด้วย `npm run deploy:local -- <ชื่อโดเมน>` |

ถ้าต้องแก้ตาราง ให้แก้ `src/shared/db/schema.ts` แล้วรัน `npm run db:generate -- --name <ชื่อสิ่งที่เปลี่ยน>` และ commit ไฟล์ใน `drizzle/migrations/` ไปด้วย
