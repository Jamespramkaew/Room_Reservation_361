## 0. Start

```bash
node -v && docker --version && aws --version && jq --version && zip -v | head -1
```

## 1. Credentials

```bash
cp .env.example .env # root — ใช้โดย docker-compose
cp backend-lambda/.env.example backend-lambda/.env
cp frontend/.env.example frontend/.env
```

ใน `.env` ที่ root ใส่:

```env
LOCALSTACK_AUTH_TOKEN=<token ของคุณ>
DB_HOST_PORT=5432
```

## 2. Installation

```bash
docker compose up -d db # ที่ root

cd backend-lambda
npm install
npm run db:migrate # สร้างตาราง
npm run db:seed # ข้อมูลตัวอย่าง (rooms, facilities, bookings)

cd ../frontend && npm install
```

## 3. รันแบบแบบไม่ Deploy

```bash
cd backend-lambda && npm run dev # http://localhost:3000/api/health
```

```bash
cd frontend && npm run dev # http://localhost:5173
```

## 4. เช็คว่ารันบน Lambda

```bash
docker compose up -d # ที่ root — ขึ้น localstack ด้วย
cd backend-lambda && npm run deploy:local
curl http://roomres.execute-api.localhost.localstack.cloud:4566/dev/api/health
```