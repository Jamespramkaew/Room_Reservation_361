# backend-lambda

Backend แบบ FaaS บน AWS Lambda: **1 resource = 1 Lambda function** แต่ละตัวเป็น Hono app เล็กๆ ใช้ Drizzle + Postgres และมี API Gateway REST (v1) อยู่ด้านหน้า
deploy ด้วยสคริปต์ AWS CLI ใน [`../infra/scripts`](../infra/scripts) (ยังไม่ใช้ SAM/CDK) สคริปต์ชุดเดียวกันใช้ได้ทั้ง LocalStack และ AWS จริง

```
functions.json            ← manifest: มี function อะไร, รับ route ไหน, memory/timeout/policies
src/functions/<name>/     ← 1 โฟลเดอร์ = 1 Lambda
  app.ts                  ← createApp('/api/<name>') + routes
  handler.ts              ← export const handler = handle(app)
  <name>.schema.ts        ← zod (body/params/query)
  <name>.service.ts       ← business rules, โยน HttpError
  <name>.repository.ts    ← query Drizzle
src/shared/               ← ใช้ร่วมกัน (bundle เข้าไปในทุก function)
  create-app.ts           ← CORS, request id, logger, error envelope
  db/schema.ts            ← schema (Drizzle เป็นเจ้าของ)
src/dev.ts                ← dev server: รวมทุก function ไว้ใน process เดียว
drizzle/migrations/       ← migration (commit ด้วย)
```

Response ทุกตัวใช้รูปแบบเดิม `{ success, message, data, pagination? }`

## ติดตั้งครั้งแรก

1. สมัครบัญชี LocalStack แผน Hobby (ฟรี) แล้วเอา Auth Token มาใส่ใน `../.env` (คัดลอกจาก `../.env.example`)
   - ถ้าพอร์ต 5432 ถูกใช้อยู่แล้ว ให้ตั้ง `DB_HOST_PORT` เป็นพอร์ตอื่น
2. `cp .env.example .env` (ถ้าเปลี่ยน `DB_HOST_PORT` ให้แก้พอร์ตใน `DATABASE_URL` ด้วย)
3. `npm install`
4. ต้องมี `aws` CLI v2, `jq`, `zip` (บน Windows ให้ใช้ WSL)

## ทำงานแบบวันต่อวัน

| ต้องการ | คำสั่ง |
|---|---|
| dev เร็ว (Node server, ไม่ผ่าน Lambda) | `docker compose up -d db` → `npm run db:migrate` → `npm run db:seed` → `npm run dev` → http://localhost:3000/api/health |
| เทสผ่าน Lambda + API Gateway จริงบน LocalStack | `docker compose up -d` → `npm run deploy:local` แล้ว curl URL ที่ได้ เช่น `http://roomres.execute-api.localhost.localstack.cloud:4566/dev/api/facilities` |
| deploy แค่บาง function | `npm run deploy:local -- facilities` |
| hot reload บน LocalStack | `HOT_RELOAD=1 npm run deploy:local` แล้วเปิดอีก terminal รัน `npm run build -- --watch` |
| ตรวจ type | `npm run typecheck` |
| ดู log ของ Lambda | `aws --endpoint-url http://localhost:4566 logs tail /aws/lambda/roomres-facilities --follow` |
| ลบทุกอย่างบน LocalStack | `npm run destroy:local` |

LocalStack แผน Hobby ไม่เก็บข้อมูลข้าม restart: หลัง `docker compose up` ต้องรัน `deploy:local` ใหม่ทุกครั้ง (ข้อมูลใน Postgres ยังอยู่)

## เพิ่ม resource ใหม่

1. copy `src/functions/facilities` ไปเป็น `src/functions/<name>` แล้วเปลี่ยน basePath ใน `app.ts`
2. เพิ่ม entry ใน `functions.json` เช่น
   `{ "name": "bookings", "routes": ["/api/bookings", "/api/bookings/{proxy+}"] }`
   ถ้าต้องใช้ S3 ให้ใส่ `"policies": ["s3"]` ส่วน memory/timeout จะใช้ค่า default ถ้าไม่ระบุ
3. `npm run dev` เพื่อเทสเร็ว → `npm run deploy:local -- <name>` → `npm run deploy:aws -- <name>`

**ข้อควรระวังของ API Gateway REST:** ใต้ path เดียวกันจะมี `{proxy+}` คู่กับ path variable อื่นไม่ได้
ตัวอย่าง: `/api/rooms/{proxy+}` ใช้คู่กับ `/api/rooms/{roomId}/photos` ไม่ได้
ถ้าต้องการให้ `room-photos` แยก function ให้ rooms ใช้ `/api/rooms`, `/api/rooms/{roomId}` และ `/api/rooms/{roomId}/{proxy+}` แทน (สคริปต์จะ error ตอนสร้าง resource ถ้าชนกัน)

ถ้าลบ route ออกจาก manifest resource เดิมจะยังค้างอยู่ใน API Gateway ให้ลบเองใน console หรือใช้ `destroy` แล้ว deploy ใหม่

path ที่ไม่มีใน manifest จะถูก API Gateway ตอบ `{"message": "Missing Authentication Token"}` (403) ตั้งแต่ก่อนถึง Lambda ซึ่งเป็นพฤติกรรมปกติของ REST API ไม่ใช่บั๊ก

## เปลี่ยน schema

1. แก้ `src/shared/db/schema.ts`
2. `npm run db:generate -- --name <what-changed>` แล้ว commit ไฟล์ใน `drizzle/migrations/`
3. local: `npm run db:migrate` / บน cloud: `npm run deploy:aws -- migrate && npm run migrate:aws`

ห้ามใช้ `drizzle-kit push` กับ DB ที่ใช้ร่วมกัน และ **ห้ามรัน `prisma migrate` ใน `backend/` อีก**
DB เดิมที่สร้างด้วย Prisma จะถูกบันทึกว่า baseline apply ไปแล้วให้อัตโนมัติในครั้งแรกที่รัน migrate

## Deploy ขึ้น AWS

สิ่งที่ต้องสร้างเองครั้งเดียว (ผ่าน console ก็ได้):
- RDS PostgreSQL 17 แบบ private
- security group ของ Lambda และ inbound 5432 ใน SG ของ RDS จาก SG ของ Lambda
- S3 Gateway VPC Endpoint (ฟรี) เพราะ Lambda ที่อยู่ใน VPC ออก internet ไม่ได้

จากนั้น:

```bash
cp ../infra/env/aws.env.example ../infra/env/aws.env   # ใส่ subnet, SG, DATABASE_URL (?sslmode=require), bucket
npm run deploy:aws
npm run migrate:aws
curl https://<api-id>.execute-api.ap-southeast-1.amazonaws.com/dev/api/health
```

`infra/env/aws.env` ถูก gitignore ไว้เพราะมีรหัสผ่าน DB
