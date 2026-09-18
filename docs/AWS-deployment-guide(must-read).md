# AWS Deployment Guide (must read)

**ผู้รับผิดชอบ: เจมส์ และ ปูอัด**

สิ่งที่ต้องไปหามา มันคือ Issue ที่เราให้ไปลองสร้างไปลองเล่นดูด้วยตัวเอง
ของทั้งสองคน ไม่งั้นเราเอาขึ้น AWS ไม่ได้

---

## 1. สิ่งที่ต้องสร้างเองครั้งเดียว

เพราะเป็นของที่มีค่าใช้จ่ายและลบยาก

| # | สิ่งที่ต้องสร้าง | รายละเอียด |
|---|---|---|
| 1 | AWS account + IAM user | แล้วรัน `aws configure --profile roomres` ใส่ access key (ส่วนนี้ไม่เกี่ยวกับไฟล์ env) |
| 2 | RDS PostgreSQL 17 | เลือก `db.t4g.micro` ตั้ง master password ไว้ |
| 3 | Security group | ให้เข้าพอร์ต 5432 ได้ |

---

## 2. ค่าที่ต้อง copy จาก console มาใส่ `infra/env/aws.env`

| ค่าในไฟล์ | เอามาจากไหน |
|---|---|
| `AWS_PROFILE` | ชื่อ profile ที่ตั้งตอน `aws configure` |
| `FN_ENV_DATABASE_URL` | endpoint ของ RDS (หน้า RDS > Databases > Connectivity) + user/password ที่ตั้งไว้ + `?sslmode=require` |
| `VPC_SUBNET_IDS` | หน้า VPC > Subnets (ใส่ 2 อันคนละ AZ) |
| `VPC_SECURITY_GROUP_IDS` | security group ที่สร้างให้ Lambda |
| `FN_ENV_S3_BUCKET` | ตั้งชื่อเอง ต้องไม่ซ้ำกับคนทั้งโลก |
| `FN_ENV_ALLOWED_ORIGINS` | URL ของ frontend |

---

## 3. คำสั่ง

```bash
cp infra/env/aws.env.example infra/env/aws.env   # กรอกค่าจากตารางข้างบน

cd backend-lambda
npm run deploy:aws      # deploy ทุกฟังก์ชัน
npm run migrate:aws     # รัน migration
```

ตรวจว่าใช้ได้

```bash
curl https://<api-id>.execute-api.ap-southeast-1.amazonaws.com/dev/api/health
```
