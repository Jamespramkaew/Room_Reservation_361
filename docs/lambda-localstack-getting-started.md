# เริ่มต้นกับ backend ตัวใหม่ (Lambda + LocalStack)

คู่มือนี้สำหรับคนที่ยังไม่เคยใช้ AWS Lambda หรือ LocalStack มาก่อน อ่านจบแล้วจะรัน backend ตัวใหม่บนเครื่องตัวเองได้ และรู้ว่าจะเพิ่ม endpoint ของตัวเองยังไง

ถ้าอยากดูคำสั่งอย่างเดียว ข้ามไปที่ [backend-lambda/README.md](../backend-lambda/README.md)

---

## 1. ภาพรวม

เดิม backend เป็น NestJS ตัวเดียว (`backend/`) รันเป็นเซิร์ฟเวอร์ที่เปิดค้างไว้ตลอด ตัวใหม่ (`backend-lambda/`) แตกเป็นฟังก์ชันย่อยที่ทำงานเฉพาะตอนมีคนเรียกเท่านั้น

```
Browser
   |
   v
API Gateway  (รับ HTTP แล้วดูว่า path นี้ควรส่งให้ใคร)
   |
   +-- /api/health      --> Lambda: roomres-health
   +-- /api/facilities  --> Lambda: roomres-facilities
   +-- (ต่อไป /api/rooms, /api/bookings, ...)
                              |
                              v
                        PostgreSQL
```

ของแต่ละคำเรียกสั้นๆ

- **Lambda function** คือโค้ดก้อนหนึ่งที่ AWS รันให้เมื่อมีคนเรียก ไม่มีคนเรียกก็ไม่เสียเงินและไม่มีอะไรรันอยู่ ทำงานเสร็จก็จบ
- **cold start** คือการเรียกครั้งแรกที่ AWS ต้องเตรียม container ใหม่ จึงช้ากว่าปกติเล็กน้อย ครั้งต่อๆ ไปจะเร็วเพราะใช้ตัวเดิมซ้ำ นี่คือเหตุผลที่โค้ดสร้าง connection ของ DB ไว้นอก handler เพื่อให้ใช้ซ้ำได้
- **handler** คือฟังก์ชันที่ Lambda เรียก ของเราคือ `index.handler` ในไฟล์ที่ esbuild bundle ออกมา
- **API Gateway** คือตัวรับ HTTP ที่อยู่หน้า Lambda เพราะ Lambda เพียวๆ ไม่มี URL ให้เรียก เราใช้แบบ REST (v1)
- **resource / `{proxy+}`** คือวิธีที่ API Gateway กำหนด path เช่น `/api/facilities` คือ resource หนึ่ง ส่วน `{proxy+}` แปลว่า "อะไรก็ได้ที่ต่อท้ายจากตรงนี้" ทำให้ `/api/facilities/<id>` เข้าฟังก์ชันเดียวกัน
- **stage** คือเวอร์ชันที่ deploy ออกไป ของเราใช้ชื่อ `dev` จึงเห็นคำว่า `/dev/` อยู่ใน URL
- **IAM role** คือสิทธิ์ที่ฟังก์ชันนั้นมี เช่น ฟังก์ชันที่ต้องอัปโหลดรูปเท่านั้นที่จะได้สิทธิ์เขียน S3

**ทำไมถึงแบ่งเป็นฟังก์ชันละ resource** เพราะ deploy, scale, สิทธิ์ และ log แยกกัน แก้ `facilities` แล้ว deploy เฉพาะตัวนั้นได้ ถ้าตัวหนึ่งพังก็ไม่ลากตัวอื่นไปด้วย แต่ก็ไม่ได้แตกถึงขั้น 1 endpoint ต่อ 1 ฟังก์ชัน เพราะจำนวนจะเยอะเกินไปจนดูแลยาก

---

## 2. LocalStack คืออะไร

LocalStack คือโปรแกรมที่จำลองบริการของ AWS ไว้ในเครื่องเรา รันเป็น Docker container ตัวเดียวที่เปิดพอร์ต 4566 แล้วรับคำสั่งหน้าตาเหมือน AWS ทุกอย่าง

ประโยชน์คือเราเทสได้ว่าโค้ดทำงานบน Lambda จริงๆ ได้ไหม โดยไม่ต้องมีบัญชี AWS ไม่เสียเงิน และไม่ไปยุ่งกับของจริง สคริปต์ deploy ที่เราใช้กับ LocalStack เป็นสคริปต์ตัวเดียวกับที่ใช้ deploy ขึ้น AWS จริง ต่างกันแค่ปลายทาง

**ในโปรเจกต์นี้เราใช้บริการเหล่านี้จาก LocalStack**

| บริการ | ใช้ทำอะไร |
|---|---|
| Lambda | รันโค้ดของแต่ละ resource จริงๆ ใน container แยก |
| API Gateway (REST) | ทำ URL และ map path ไปหาแต่ละ Lambda |
| IAM | สร้าง role ของแต่ละฟังก์ชัน |
| S3 | เก็บรูปห้อง (ยังไม่ได้ใช้จริงจนกว่าจะทำ room-photos) |
| CloudWatch Logs | เก็บ log ของแต่ละฟังก์ชัน ดูด้วยคำสั่ง `logs tail` |

**สิ่งที่ไม่ได้อยู่ใน LocalStack**

- **PostgreSQL** เรารันเป็น container ธรรมดา (`db` ใน docker-compose) ไม่ได้ใช้ RDS จำลอง เพราะ RDS อยู่ในแผนเสียเงิน ตอน deploy ขึ้น AWS จริงถึงจะเปลี่ยนไปใช้ RDS โดยแก้แค่ `DATABASE_URL`
- **ข้อมูลของ LocalStack ไม่ถูกเก็บข้ามการปิดเปิด** แผนฟรีไม่มี persistence ดังนั้นทุกครั้งที่ `docker compose up` ใหม่ ต้องรัน deploy ใหม่ (ข้อมูลใน Postgres ยังอยู่ ไม่หาย)
- **ตั้งแต่ มี.ค. 2026 LocalStack ต้องสมัครบัญชี** แผน Hobby ฟรีสำหรับใช้ส่วนตัวและเรียน แต่ต้องมี auth token ของตัวเอง

---

## 3. เตรียมเครื่อง

ต้องมี Docker, Node.js 20 ขึ้นไป, AWS CLI v2, `jq` และ `zip`
Windows ให้ทำทุกอย่างใน WSL เพราะสคริปต์เป็น bash

```bash
node -v
docker --version
aws --version
jq --version
```

ถ้ายังไม่มี AWS CLI ติดตั้งตาม https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
**ไม่ต้องมีบัญชี AWS และไม่ต้องรัน `aws configure`** เพราะตอนคุยกับ LocalStack สคริปต์ใส่ key ปลอมให้เองแล้ว

---

## 4. ตั้งค่าครั้งแรก

1. สมัคร LocalStack แผน Hobby (ฟรี) ที่ https://app.localstack.cloud แล้ว copy auth token จากหน้า workspace
2. สร้างไฟล์ตั้งค่าที่ root ของโปรเจกต์

   ```bash
   cp .env.example .env
   ```

   แล้วเปิด `.env` ใส่ token ของตัวเอง

   ```
   LOCALSTACK_AUTH_TOKEN=<token ของคุณ>
   DB_HOST_PORT=5432
   ```

   ถ้าพอร์ต 5432 ในเครื่องถูกใช้อยู่แล้ว (เช่นมี Postgres ของโปรเจกต์อื่น) ให้เปลี่ยนเป็น 5433

   **token เป็นของส่วนตัว ห้ามใส่ลงไฟล์ที่ commit ขึ้น git** ไฟล์ `.env` ถูก gitignore ไว้แล้ว ส่วน `.env.example` ไม่ใช่

3. ตั้งค่าของ backend

   ```bash
   cd backend-lambda
   cp .env.example .env
   npm install
   ```

   ถ้าข้อ 2 เปลี่ยนพอร์ตเป็น 5433 ให้แก้พอร์ตใน `DATABASE_URL` ของไฟล์นี้ด้วย

4. เปิด database แล้วลงตารางกับข้อมูลตัวอย่าง

   ```bash
   cd ..
   docker compose up -d db
   cd backend-lambda
   npm run db:migrate
   npm run db:seed
   ```

---

## 5. การทำงานมี 2 โหมด

### โหมดที่ 1: dev server (ใช้ตอนเขียนโค้ดปกติ)

รวมทุกฟังก์ชันไว้ใน Node process เดียว ไม่มี Lambda ไม่มี API Gateway แก้โค้ดแล้วรีสตาร์ทเองอัตโนมัติ

```bash
npm run dev
curl http://localhost:3000/api/health
curl http://localhost:3000/api/facilities
```

เร็วที่สุดและไม่ต้องเปิด LocalStack ใช้โหมดนี้ตอนเขียน business logic

### โหมดที่ 2: LocalStack (ใช้ตอนจะเช็คว่ามันรันบน Lambda ได้จริง)

```bash
cd ..
docker compose up -d
cd backend-lambda
npm run deploy:local
```

สคริปต์จะ build, zip, สร้าง IAM role, สร้าง Lambda, ต่อ API Gateway แล้วบอก URL มา

```bash
curl http://roomres.execute-api.localhost.localstack.cloud:4566/dev/api/health
curl http://roomres.execute-api.localhost.localstack.cloud:4566/dev/api/facilities
```

ใช้โหมดนี้ก่อนเปิด PR หรือเวลาจะเช็คว่า path, CORS, สิทธิ์ และการต่อ DB จาก Lambda ทำงานจริง

**ควรเทสโหมดนี้อย่างน้อยหนึ่งครั้งก่อนส่งงาน** เพราะมีปัญหาบางอย่างที่เจอได้เฉพาะตอนรันจริง เช่น path ชนกัน หรือลืมเพิ่มฟังก์ชันใน manifest

---

## 6. คำสั่งที่ใช้บ่อย

| อยากทำอะไร | คำสั่ง |
|---|---|
| รัน dev server | `npm run dev` |
| deploy ทุกฟังก์ชันขึ้น LocalStack | `npm run deploy:local` |
| deploy เฉพาะตัวเดียว | `npm run deploy:local -- facilities` |
| แก้โค้ดแล้วเห็นผลทันทีบน LocalStack | `HOT_RELOAD=1 npm run deploy:local` แล้วเปิดอีก terminal รัน `npm run build -- --watch` |
| ดู log ของฟังก์ชัน | `aws --endpoint-url http://localhost:4566 logs tail /aws/lambda/roomres-facilities --follow` |
| ดูรายชื่อฟังก์ชันที่ deploy ไป | `aws --endpoint-url http://localhost:4566 lambda list-functions --query "Functions[].FunctionName"` |
| ตรวจ type | `npm run typecheck` |
| ลงตารางใหม่หลัง pull โค้ดมา | `npm run db:migrate` |
| ล้าง DB แล้วเริ่มใหม่ | `npm run db:fresh` |
| ลบของทั้งหมดบน LocalStack | `npm run destroy:local` |

---

## 7. เพิ่ม endpoint ของตัวเอง

สมมติจะทำ `bookings`

1. copy โฟลเดอร์ `src/functions/facilities` เป็น `src/functions/bookings` แล้วเปลี่ยนชื่อไฟล์ข้างในกับ basePath ใน `app.ts` เป็น `/api/bookings`
2. เพิ่มใน `functions.json`

   ```json
   { "name": "bookings", "routes": ["/api/bookings", "/api/bookings/{proxy+}"] }
   ```

3. เขียนงานจริงใน 3 ไฟล์
   - `bookings.schema.ts` ตรวจ input ด้วย zod
   - `bookings.service.ts` ใส่กฎทางธุรกิจ ถ้าผิดให้ `throw notFound(...)` หรือ `conflict(...)` แล้วระบบจะแปลงเป็น status ให้เอง
   - `bookings.repository.ts` query ด้วย Drizzle
4. เทส `npm run dev` แล้วตามด้วย `npm run deploy:local -- bookings`

**ถ้าต้องแก้ตาราง** ให้แก้ `src/shared/db/schema.ts` แล้วรัน `npm run db:generate -- --name <ชื่อสิ่งที่เปลี่ยน>` จากนั้น commit ไฟล์ใน `drizzle/migrations/` ไปด้วย เพื่อนที่ pull โค้ดไปจะได้รัน `npm run db:migrate` ตามได้

**ห้ามรัน `prisma migrate` ใน `backend/` อีก** ตอนนี้ Drizzle เป็นเจ้าของ schema แล้ว ทั้งสองตัวชี้ DB เดียวกัน ถ้ารันทั้งคู่จะตีกัน

---

## 8. ปัญหาที่เจอบ่อย

**`docker compose up` แล้ว LocalStack ไม่ขึ้น**
ดู log ด้วย `docker compose logs localstack` ถ้าบ่นเรื่อง token แปลว่า `.env` ที่ root ยังไม่มี `LOCALSTACK_AUTH_TOKEN` หรือใส่ผิด

**`deploy:local` บอกว่า LocalStack is not reachable**
container ยังไม่พร้อม รอสักครู่แล้วลองใหม่ เช็คด้วย `curl http://localhost:4566/_localstack/health`

**เรียก URL แล้วได้ `{"message": "Missing Authentication Token"}`**
ไม่ใช่เรื่องสิทธิ์ แต่แปลว่า path นั้นไม่มีอยู่ใน API Gateway ให้เช็คว่าใส่ route ใน `functions.json` แล้วและ deploy ใหม่หรือยัง

**ขึ้น 502 หรือ Internal server error**
โค้ดใน Lambda พัง ดู log ด้วย `logs tail` ตามตารางข้างบน

**Lambda ต่อ database ไม่ได้ แต่ dev server ต่อได้**
ในมุมมองของ Lambda ชื่อ host ของ database คือ `db` ไม่ใช่ `localhost` ค่านี้อยู่ใน `infra/env/local.env` ไม่ใช่ `backend-lambda/.env`

**ปิดเปิด docker แล้วเรียก API ไม่ได้**
LocalStack แผนฟรีไม่เก็บของข้ามการปิดเปิด ให้รัน `npm run deploy:local` อีกครั้ง

**สร้าง resource ใน API Gateway ไม่ได้**
API Gateway REST ไม่ยอมให้ path เดียวกันมีทั้ง `{proxy+}` และตัวแปรอื่น เช่น `/api/rooms/{proxy+}` จะใช้คู่กับ `/api/rooms/{roomId}/photos` ไม่ได้ ต้องออกแบบ path ใหม่ ดูรายละเอียดใน README ของ backend-lambda

---

## 9. ตอนขึ้น AWS จริงต่างจากนี้ยังไง

โค้ดไม่ต้องแก้เลย ที่ต่างคือ database เปลี่ยนเป็น RDS, ต้องกรอกค่าใน `infra/env/aws.env` และคำสั่ง deploy เปลี่ยนเป็น `npm run deploy:aws`

รายละเอียดทั้งหมดอยู่ใน [AWS Deployment Guide (must read)](AWS-deployment-guide%28must-read%29.md) ซึ่งเขียนเป็นด่านให้ลองหาคำตอบเองทีละขั้น

ปกติจะมีคนเดียวหรือสองคนในทีมที่ทำส่วนนี้ คนอื่นทำงานบน LocalStack พอ แต่แนะนำให้อ่านไว้ทุกคน
