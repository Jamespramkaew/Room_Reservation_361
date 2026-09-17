# AWS Deployment Guide (must read)

ภารกิจ: เอา backend ขึ้น AWS ให้ได้ด้วยตัวเอง

คู่มือนี้ไม่บอกคำตอบตรงๆ แต่ละด่านจะบอกแค่เป้าหมายกับเบาะแสว่าต้องไปหาที่ไหน
ลองหาเองก่อน ถ้าจนจริงค่อยกดเปิดเฉลยที่ซ่อนไว้ท้ายด่าน (คำว่า "เฉลย" กดได้)

กติกา
- ห้ามข้ามด่าน 0 เพราะจะพังตั้งแต่ด่านแรก
- ทุกด่านมี checkpoint ให้รันเพื่อพิสูจน์ว่าผ่านจริง
- ถ้าติดเกิน 30 นาที ให้ถามในกลุ่ม ไม่ต้องนั่งงมคนเดียว
- ก่อนเริ่ม ควรทำ [คู่มือ LocalStack](lambda-localstack-getting-started.md) ให้ผ่านมาก่อน ของที่เจอบน AWS จะคุ้นตาทั้งหมด

---

## ด่าน 0: กุญแจดอกแรก

**เป้าหมาย** ทำให้เครื่องคุณคุยกับ AWS ได้

**เบาะแส**
- ตอนเล่นกับ LocalStack สคริปต์ใส่ key ปลอมให้เอง แต่ของจริงไม่มีใครใส่ให้
- คำสั่งที่ต้องใช้อยู่ในตระกูล `aws configure`
- สร้าง IAM user ใน console แล้วขอ access key ชนิด CLI

**checkpoint**
```bash
aws sts get-caller-identity --profile <ชื่อ profile ที่คุณตั้ง>
```
ต้องได้เลข account 12 หลักกลับมา ไม่ใช่ `000000000000` (ถ้าได้เลขศูนย์ทั้งหมดแปลว่าคุณยังคุยกับ LocalStack อยู่)

<details>
<summary>เฉลย</summary>

```bash
aws configure --profile roomres
# ใส่ Access key ID, Secret access key, region = ap-southeast-1, output = json
```
ชื่อ profile นี้จะเอาไปใส่ในไฟล์ env ด่าน 4 ห้ามเอา access key ไปใส่ในไฟล์ env เด็ดขาด
</details>

---

## ด่าน 1: โค้ดเราหิวอะไรบ้าง

**เป้าหมาย** ตอบให้ได้ว่าฟังก์ชันของเราต้องการ environment variable อะไรบ้าง และตัวไหนที่ขาดไม่ได้

**เบาะแส**
- มีไฟล์เดียวในโปรเจกต์ที่ตรวจ env ทั้งหมดและจะโยน error ถ้าขาด
- อยู่ใน `backend-lambda/src/shared/`
- ไฟล์นั้นใช้ zod

<details>
<summary>เฉลย</summary>

`backend-lambda/src/shared/env.ts`
- `DATABASE_URL` ขาดไม่ได้ ไม่มีแล้วฟังก์ชันพังทันที
- `ALLOWED_ORIGINS` ถ้าไม่ใส่จะไม่มี origin ไหนผ่าน CORS เลย
- `STAGE`, `AWS_REGION` มีค่า default
- `AWS_ENDPOINT_URL` ใส่เฉพาะตอนใช้ LocalStack บน AWS จริงห้ามใส่
- `S3_BUCKET`, `S3_PUBLIC_URL` ใส่เมื่อเริ่มใช้งานรูปห้อง
</details>

---

## ด่าน 2: เลือกทางเดิน

**เป้าหมาย** ตัดสินใจว่าจะเอา Lambda เข้า VPC หรือไม่ แล้วจดไว้ว่าเลือกอะไร

มีสองทาง เลือกได้ทางเดียว

**ทาง A: ไม่เอาเข้า VPC** ตั้ง RDS ให้เข้าถึงได้จากภายนอก แล้วล็อกด้วย security group
- ง่ายกว่า ไม่ต้องทำ VPC endpoint และรัน migration จากเครื่องตัวเองได้
- เหมาะกับงานเรียนและการลองครั้งแรก

**ทาง B: เอาเข้า VPC** RDS อยู่ใน private subnet ไม่เปิดออก internet
- ปลอดภัยกว่า แต่มีของต้องสร้างเพิ่มและ deploy ครั้งแรกช้ากว่า
- มีกับดักหนึ่งอย่างรออยู่ที่ด่าน 6

**คำถามที่ต้องตอบให้ได้ก่อนไปต่อ** ถ้าเลือกทาง B แล้ว Lambda จะเรียก S3 ได้ยังไง ทั้งที่มันออก internet ไม่ได้

<details>
<summary>เฉลย</summary>

ต้องสร้าง S3 Gateway VPC Endpoint ซึ่งฟรี
ห้ามแก้ปัญหานี้ด้วย NAT Gateway เพราะคิดเงินรายชั่วโมงและเป็นตัวที่ทำให้บิลบานที่สุดในบรรดาของที่เราใช้
</details>

---

## ด่าน 3: สร้างที่เก็บข้อมูล

**เป้าหมาย** มี RDS PostgreSQL ที่ใช้งานได้ และถือ 3 อย่างนี้ไว้ในมือ endpoint, username, password

**เบาะแส**
- เวอร์ชันต้องตรงกับที่ใช้ใน docker-compose ไปดูว่า image คือ postgres เวอร์ชันอะไร
- instance class ที่อยู่ใน free tier ปีแรกคือรุ่นเล็กสุดตระกูล t4g
- endpoint หาได้ในหน้า RDS > Databases > ชื่อ DB > Connectivity & security
- ถ้าเลือกทาง A อย่าลืมเปิด Publicly accessible ตอนสร้าง

**checkpoint** (ทาง A เท่านั้น ทาง B จะต่อไม่ได้จากเครื่องตัวเอง ซึ่งถูกแล้ว)
```bash
psql "postgresql://<user>:<password>@<endpoint>:5432/postgres?sslmode=require" -c "select version()"
```

<details>
<summary>เฉลย</summary>

- PostgreSQL 17 ให้ตรงกับ `postgres:17-alpine` ใน `docker-compose.yml`
- `db.t4g.micro`, storage 20 GB gp3, ปิด Multi-AZ และปิด auto scaling เพื่อไม่ให้เกิน free tier
- ตั้งชื่อ database เป็น `platform` ให้ตรงกับที่ใช้บนเครื่อง
- ถ้าต่อไม่ได้ ปัญหาเกือบทั้งหมดอยู่ที่ security group ไม่ใช่ที่ RDS ไปต่อด่าน 4
</details>

---

## ด่าน 4: ประตูที่ต้องแง้มให้พอดี

**เป้าหมาย** ทำให้ Lambda (หรือเครื่องคุณ ถ้าเลือกทาง A) ต่อ RDS ได้ โดยไม่เปิดให้คนทั้งโลกต่อได้

**เบาะแส**
- Postgres ใช้พอร์ต 5432
- inbound rule ของ security group ใส่ต้นทางได้ 2 แบบ คือเป็น IP หรือเป็น security group อีกอัน
- ทาง A ต้นทางคือ IP ของคุณ ทาง B ต้นทางคือ security group ของ Lambda
- `0.0.0.0/0` คือคำตอบที่ผิดเสมอสำหรับด่านนี้

<details>
<summary>เฉลย</summary>

**ทาง A** ที่ security group ของ RDS เพิ่ม inbound rule: Type PostgreSQL, Port 5432, Source เลือก My IP
เน็ตบ้านเปลี่ยน IP ได้ ถ้าวันหนึ่งต่อไม่ได้ทั้งที่เคยได้ ให้กลับมาอัปเดต rule นี้

**ทาง B** สร้าง security group เปล่าอีกอันไว้ให้ Lambda (ไม่ต้องมี inbound rule)
แล้วที่ security group ของ RDS เพิ่ม inbound rule: Port 5432 และ Source เป็น security group ของ Lambda
จดไว้ทั้ง id ของ security group และ subnet id อย่างน้อย 2 อันคนละ AZ จะได้ใช้ด่านต่อไป
</details>

---

## ด่าน 5: เติมค่าลงแผนที่

**เป้าหมาย** มีไฟล์ตั้งค่าของ AWS ที่กรอกครบ

**เบาะแส**
- ไฟล์ตัวอย่างอยู่ใน `infra/env/` ก็อปมาแล้วตัดคำว่า example ออก
- ตัวแปรที่ขึ้นต้นด้วย `FN_ENV_` มีความหมายพิเศษ ไปดูว่าสคริปต์ทำอะไรกับมัน (เบาะแสอยู่ใน `infra/scripts/lib.sh` ฟังก์ชันชื่อคล้ายกับ environment)
- `DATABASE_URL` ของ RDS ต้องมีอะไรต่อท้ายที่ของบนเครื่องไม่มี
- ถ้าเลือกทาง A มีสองบรรทัดที่ต้องปล่อยว่าง
- มีตัวแปรบางชื่อที่ Lambda จองไว้ ใส่แล้ว deploy จะ error ไปดูคอมเมนต์ในไฟล์ตัวอย่าง

**checkpoint**
```bash
grep -c FN_ENV_ infra/env/aws.env     # ต้องได้อย่างน้อย 3
git status --short infra/env/          # ต้องไม่เห็น aws.env โผล่มา
```

<details>
<summary>เฉลย</summary>

```bash
cp infra/env/aws.env.example infra/env/aws.env
```
- `FN_ENV_` แปลว่าตัวแปรนั้นจะถูกส่งเข้าไปเป็น environment variable ของ Lambda โดยตัด prefix ออก
- `FN_ENV_DATABASE_URL` ต้องลงท้ายด้วย `?sslmode=require` เพราะ RDS บังคับ SSL
- ทาง A ปล่อย `VPC_SUBNET_IDS` และ `VPC_SECURITY_GROUP_IDS` ว่าง สคริปต์จะข้ามส่วน VPC ให้เอง
- ห้ามใส่ `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` เพราะ Lambda จองชื่อพวกนี้ไว้ และ role ของฟังก์ชันให้สิทธิ์อยู่แล้ว
- `aws.env` ถูก gitignore ไว้เพราะมีรหัสผ่าน DB ถ้ามันโผล่ใน `git status` แปลว่าคุณวางผิดที่
</details>

---

## ด่าน 6: ยิงขึ้นฟ้า

**เป้าหมาย** มี Lambda และ API Gateway อยู่บน AWS จริง

**เบาะแส**
- ไม่ต้องกดสร้างอะไรใน console อีกแล้ว ทุกอย่างมีสคริปต์ทำให้
- ชื่อคำสั่งอยู่ใน `backend-lambda/package.json` ช่อง scripts มองหาตัวที่ลงท้ายด้วย aws
- deploy ทีละฟังก์ชันก็ได้ ลองหาดูว่าส่งชื่อฟังก์ชันต่อท้ายยังไง
- ถ้าเลือกทาง B ครั้งแรกจะช้าเป็นนาที เพราะ Lambda ต้องสร้าง network interface ของตัวเองใน VPC อย่าเพิ่งกด Ctrl+C

**checkpoint** สคริปต์จะพ่น URL ออกมาตอนจบ เก็บไว้ใช้ด่าน 8

<details>
<summary>เฉลย</summary>

```bash
cd backend-lambda
npm run deploy:aws
# เฉพาะบางตัว
npm run deploy:aws -- facilities
```
สคริปต์สร้าง IAM role ของแต่ละฟังก์ชัน, Lambda, S3 bucket, API Gateway และ stage ให้เอง
รันซ้ำได้ ของเดิมจะถูก update ไม่ใช่สร้างใหม่ซ้อน
</details>

---

## ด่าน 7: ปริศนาของตาราง

**เป้าหมาย** ทำให้ตารางใน RDS ครบ

**คำถามก่อนลงมือ** ถ้าเลือกทาง B เครื่องคุณต่อ RDS ไม่ได้เลย แล้วจะรัน migration ยังไง

**เบาะแส**
- ในโปรเจกต์มีฟังก์ชันหนึ่งที่ไม่มี route ใน `functions.json` ลองหาว่าตัวไหนและมีไว้ทำไม
- ดู `infra/scripts/migrate.sh` ว่ามันไปเรียกอะไร
- ทาง A มีทางลัดที่สั้นกว่านั้น

**checkpoint** หลังรันเสร็จต้องเห็นตัวเลขจำนวน migration ที่ apply แล้ว

<details>
<summary>เฉลย</summary>

```bash
npm run migrate:aws     # ใช้ได้ทั้ง A และ B
```
มันไป invoke ฟังก์ชัน `roomres-migrate` ให้รัน migration จากข้างใน VPC ซึ่งเป็นวิธีเดียวที่ทำได้ในทาง B

ทาง A จะใช้ทางลัดนี้ก็ได้ โดยชี้ `DATABASE_URL` ใน `backend-lambda/.env` ไปที่ RDS แล้วรัน
```bash
npm run db:migrate
```
</details>

---

## ด่าน 8: พิสูจน์ว่ารอด

**เป้าหมาย** เรียก API บน AWS ได้จริง และดู log เป็น

**เบาะแส**
- URL หน้าตาประมาณ `https://<api-id>.execute-api.<region>.amazonaws.com/<stage>/api/...`
- เริ่มที่เส้นที่เบาที่สุดก่อน เส้นที่บอกว่า database ยังหายใจอยู่ไหม
- ถ้าได้ 502 หรือ Internal server error แปลว่าโค้ดข้างในพัง ไม่ใช่ที่ API Gateway
- ถ้าได้ `{"message": "Missing Authentication Token"}` แปลว่า path นั้นไม่มีอยู่จริง ไม่ใช่เรื่องสิทธิ์
- ที่เก็บ log ของ Lambda ชื่อขึ้นต้นด้วย `/aws/lambda/`

<details>
<summary>เฉลย</summary>

```bash
curl https://<api-id>.execute-api.ap-southeast-1.amazonaws.com/dev/api/health
curl https://<api-id>.execute-api.ap-southeast-1.amazonaws.com/dev/api/facilities

aws --profile roomres logs tail /aws/lambda/roomres-facilities --follow
```
ถ้า health ตอบว่า database ไม่ขึ้น ปัญหาอยู่ที่ security group (ด่าน 4) หรือ `DATABASE_URL` (ด่าน 5) เกือบทุกครั้ง
</details>

---

## ด่าน 9: กับดักที่ทำให้ตกม้าตาย

อ่านให้จบ ทุกข้อคือเรื่องที่เคยทำให้คนอื่นเสียเวลาหรือเสียเงินมาแล้ว

- **อย่า commit `infra/env/aws.env`** มันมีรหัสผ่าน DB ถ้าเผลอ push ขึ้นไปแล้ว ให้เปลี่ยนรหัสผ่าน RDS ทันที ไม่ใช่แค่ลบ commit
- **อย่าสร้าง NAT Gateway** ถ้าคิดว่าต้องใช้ แปลว่ากำลังแก้ปัญหาผิดจุด กลับไปอ่านด่าน 2
- **อย่าเปิด inbound `0.0.0.0/0`** ที่พอร์ต 5432 บอตสแกนเจอภายในไม่กี่ชั่วโมง
- **อย่ารัน `prisma migrate` ใน `backend/`** ตอนนี้ Drizzle เป็นเจ้าของ schema แล้ว
- **อย่าลืมปิดของเมื่อเลิกใช้** RDS คิดเงินแม้ไม่มีใครเรียก ต่างจาก Lambda ที่ไม่เรียกก็ไม่เสีย
- **ถ้า Lambda อยู่ใน VPC และไม่ถูกเรียก 14 วัน** สถานะจะกลายเป็น Inactive การเรียกครั้งถัดไปจะช้าเป็นพิเศษ ไม่ใช่ของพัง

---

## ผ่านครบหรือยัง

- [ ] `aws sts get-caller-identity` ได้เลข account จริง
- [ ] RDS ใช้งานได้ และรู้ endpoint, user, password
- [ ] security group เปิดเฉพาะต้นทางที่ควรเปิด
- [ ] `infra/env/aws.env` กรอกครบ และไม่โผล่ใน `git status`
- [ ] `npm run deploy:aws` ผ่าน และได้ URL มา
- [ ] migration รันแล้ว
- [ ] `curl .../api/health` ตอบ `"database":"up"`
- [ ] `curl .../api/facilities` ได้ข้อมูล
- [ ] ดู log ใน CloudWatch เป็น

ครบแล้วบอกในกลุ่มด้วยว่าเลือกทาง A หรือ B ไว้ คนต่อไปจะได้ไม่ต้องเดา
