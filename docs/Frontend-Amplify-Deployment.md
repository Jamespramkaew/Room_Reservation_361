# 🚀 คู่มือ Deploy Frontend ไปยัง AWS Amplify

คู่มือนี้จะแนะนำวิธีการ deploy **React + Vite + TypeScript Frontend** ขึ้น **AWS Amplify Hosting** แบบ step-by-step

---

## 📋 สิ่งที่ต้องเตรียม

- [ ] บัญชี AWS (Free Tier ใช้งานได้)
- [ ] Repository บน GitHub/GitLab/Bitbucket (หรือใช้ Manual deploy ก็ได้)
- [ ] Backend API URL ที่ใช้งานได้แล้ว (Lambda API Gateway URL)
- [ ] Frontend ที่ทำงานบน local แล้ว

---

## 🎯 วิธีที่ 1: Deploy ผ่าน Git Repository (แนะนำ)

### ขั้นตอนที่ 1: Push โค้ดขึ้น Git

```bash
# ตรวจสอบว่า Frontend อยู่ใน Git แล้ว
cd c:\Users\Panup\Room_Reservation_361
git status

# ถ้ายังไม่ commit ให้ commit ก่อน
git add .
git commit -m "Prepare frontend for Amplify deployment"
git push origin main
```

---

### ขั้นตอนที่ 2: เข้า AWS Amplify Console

1. เข้า [AWS Console](https://console.aws.amazon.com/)
2. ค้นหา **"Amplify"** ในช่องค้นหา
3. คลิก **"AWS Amplify"**
4. คลิก **"New app" → "Host web app"**

---

### ขั้นตอนที่ 3: เชื่อม Git Repository

1. เลือก Git provider ของคุณ:
   - **GitHub** (แนะนำ)
   - GitLab
   - Bitbucket
   - AWS CodeCommit

2. คลิก **"Connect branch"**

3. เลือก repository: `Room_Reservation_361`

4. เลือก branch ที่ต้องการ deploy (เช่น `main`)

5. คลิก **"Next"**

---

### ขั้นตอนที่ 4: Configure Build Settings

**สำคัญ:** Repository นี้เป็น **monorepo** ต้องตั้งค่าเป็นพิเศษ

#### Option A: ใช้ `amplify.yml` ที่มีอยู่แล้ว (แนะนำ)

ที่ root มีไฟล์ `amplify.yml` พร้อมใช้แล้ว:

```yaml
version: 1
applications:
  - appRoot: frontend
    frontend:
      phases:
        preBuild:
          commands:
            - node --version
            - npm --version
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: dist
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
```

AWS Amplify จะอ่านไฟล์นี้อัตโนมัติ ✅

#### Option B: แก้ใน Console

ถ้า Amplify ไม่อ่าน `amplify.yml` ให้แก้ Build settings ใน Console:

1. **App root directory:** `frontend`
2. **Build command:** `npm run build`
3. **Base directory:** `dist`
4. **Cache folder:** `node_modules`

**ถ้า Build fail เรื่อง Node version:**
เพิ่มใน preBuild phase:
```yaml
- nvm use 20
- node --version
```

---

### ขั้นตอนที่ 5: ตั้งค่า Environment Variables (สำคัญมาก!)

คลิก **"Advanced settings"** แล้วเพิ่ม Environment Variables:

> ⚠️ **ห้าม hardcode URL ลงในโค้ด และห้าม commit ไฟล์ .env ที่มีค่าจริง**

| Key | Value | คำอธิบาย |
|-----|-------|---------|
| `VITE_API_URL` | `https://<api-id>.execute-api.ap-southeast-1.amazonaws.com/dev/api` | **URL ของ Backend Lambda API Gateway** |
| `VITE_API_TIMEOUT` | `30000` | Timeout (milliseconds) |
| `VITE_APP_NAME` | `Room Reservation System` | ชื่อแอป |
| `VITE_APP_VERSION` | `1.0.0` | เวอร์ชัน |
| `VITE_ENV` | `production` | Environment |
| `VITE_ENABLE_DEBUG` | `false` | Debug mode (ปิดใน production) |

**วิธีหา API Gateway URL:**
```bash
# ใน backend-lambda หลัง deploy แล้วจะได้ URL
cd backend-lambda
npm run deploy:aws
# ดู output: "API endpoint: https://xxxxx.execute-api.ap-southeast-1.amazonaws.com/dev/api"
```

**หรือใน AWS Console:**
1. เข้า API Gateway Console
2. เลือก API ชื่อ `roomres-dev`
3. คัดลอก "Invoke URL"

---

### ขั้นตอนที่ 6: Review และ Deploy

1. ตรวจสอบการตั้งค่าทั้งหมด
2. คลิก **"Save and deploy"**
3. รอ Amplify build และ deploy (ประมาณ 3-5 นาที)

Amplify จะทำสิ่งเหล่านี้อัตโนมัติ:
- ✅ Clone repository
- ✅ Install dependencies (`npm ci`)
- ✅ Build project (`npm run build`)
- ✅ Deploy ไปยัง CDN
- ✅ Setup HTTPS certificate

---

### ขั้นตอนที่ 7: ดู URL ของ Frontend

หลัง deploy เสร็จจะได้ URL แบบนี้:
```
https://main.xxxxxxxxxxxxx.amplifyapp.com
```

คลิกเข้าไปทดสอบได้เลย! 🎉

---

## 🎯 วิธีที่ 2: Manual Deploy (ไม่ผ่าน Git)

### ขั้นตอนที่ 1: Build Frontend ใน Local

```bash
cd c:\Users\Panup\Room_Reservation_361\frontend

# สร้าง .env สำหรับ production
echo VITE_API_URL=https://<your-api-gateway-url>/dev/api > .env.production
echo VITE_API_TIMEOUT=30000 >> .env.production
echo VITE_ENV=production >> .env.production
echo VITE_ENABLE_DEBUG=false >> .env.production

# Build
npm run build
```

ไฟล์ที่ build แล้วจะอยู่ใน `frontend/dist/`

---

### ขั้นตอนที่ 2: Zip ไฟล์

```powershell
# ใน PowerShell
cd frontend\dist
Compress-Archive -Path * -DestinationPath ..\frontend-build.zip
```

---

### ขั้นตอนที่ 3: Upload ไปยัง Amplify

1. เข้า AWS Amplify Console
2. คลิก **"New app" → "Deploy without Git provider"**
3. ตั้งชื่อ app: `room-reservation-frontend`
4. ตั้งชื่อ environment: `production`
5. Upload file `frontend-build.zip`
6. คลิก **"Save and deploy"**

---

## 🔧 ตั้งค่าเพิ่มเติม

### 1. Custom Domain (ถ้ามี Domain เป็นของตัวเอง)

1. ใน Amplify Console → เลือก App
2. คลิก **"Domain management"** → **"Add domain"**
3. ใส่ domain (เช่น `roomres.example.com`)
4. ทำตาม instruction เพื่อ setup DNS

---

### 2. Redirect Rules (สำหรับ React Router) - สำคัญมาก!

เนื่องจาก Frontend ใช้ **React Router** ต้องตั้งค่า rewrites เพื่อให้ทุก path ชี้กลับไปที่ `index.html`

**ไม่งั้น refresh หน้าเว็บหรือเข้า URL ตรงๆ จะ 404**

1. ใน Amplify Console → เลือก App
2. คลิก **"Rewrites and redirects"**
3. คลิก **"Edit"**
4. เพิ่ม rule นี้ (แบบง่าย แนะนำ):

```json
[
  {
    "source": "/<*>",
    "target": "/index.html",
    "status": "200",
    "condition": null
  }
]
```

**คำอธิบาย:**
- `source: "/<*>"` = ทุก path ที่ไม่ใช่ไฟล์จริง
- `target: "/index.html"` = ส่งไปที่ index.html
- `status: "200"` = **Rewrite** (ไม่ใช่ redirect 301/302)
- นี่จะทำให้ `/rooms/1`, `/admin/console` ทำงานได้ถูกต้อง

**ทดสอบหลังตั้งค่า:**
- เปิด `https://your-app.amplifyapp.com/rooms/1` (direct link)
- กด F5 (refresh) ต้องไม่ 404
- Navigate ผ่าน React Router ต้องทำงานปกติ

---

### 3. CORS Configuration (ถ้า Backend ยังไม่ตั้งค่า)

Backend Lambda ต้องอนุญาต CORS จาก Amplify URL:

แก้ไขใน `backend-lambda/src/shared/create-app.ts`:

```typescript
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://main.xxxxxxxxxxxxx.amplifyapp.com', // เพิ่ม Amplify URL
      'https://your-custom-domain.com' // ถ้ามี custom domain
    ],
    credentials: true,
  })
);
```

แล้ว deploy Backend Lambda ใหม่:
```bash
cd backend-lambda
npm run deploy:aws
```

---

## 🐛 Troubleshooting

### ปัญหา: Build Failed

**สาเหตุ:** Build path ไม่ถูกต้อง

**แก้:** ตรวจสอบ `amplify.yml`:
```yaml
baseDirectory: frontend/dist  # ต้องมี frontend/ ด้านหน้า
```

---

### ปัญหา: API Call ไม่ทำงาน (CORS Error)

**สาเหตุ:** Backend ไม่อนุญาต origin จาก Amplify

**แก้:** 
1. เพิ่ม Amplify URL ใน CORS config ของ Backend
2. Deploy Backend ใหม่
3. Clear cache ของ Frontend แล้ว deploy ใหม่

---

### ปัญหา: Environment Variables ไม่ทำงาน

**สาเหตุ:** Vite ต้อง rebuild เพื่อใช้ env vars ตัวใหม่

**แก้:**
1. ตั้งค่า env vars ใน Amplify Console
2. Redeploy app (Amplify → Redeploy this version)

---

### ปัญหา: React Router 404 Error

**สาเหตุ:** ไม่มี rewrite rules

**แก้:** ตั้งค่า Rewrites and redirects ตามข้างต้น

---

## 📊 เปรียบเทียบ Git Deploy vs Manual Deploy

| ฟีเจอร์ | Git Deploy | Manual Deploy |
|---------|-----------|---------------|
| Auto deploy on push | ✅ | ❌ |
| Rollback version | ✅ | ❌ |
| Preview deployments | ✅ | ❌ |
| Build ใน cloud | ✅ | ❌ Build local |
| ความเร็ว | กลาง | เร็ว |
| แนะนำสำหรับ | Production | Testing |

---

## 🔄 Auto Deploy on Push

เมื่อใช้ Git Deploy, Amplify จะ auto deploy ทุกครั้งที่ push code ใหม่:

```bash
# แก้โค้ด
cd frontend/src/pages
# แก้ไฟล์ต่างๆ

# Commit และ push
git add .
git commit -m "Update frontend UI"
git push origin main

# Amplify จะ auto build และ deploy ภายใน 3-5 นาที
```

---

## 💰 ค่าใช้จ่าย AWS Amplify

**Free Tier (12 เดือนแรก):**
- Build time: 1,000 นาที/เดือน
- Hosting: 15 GB served/เดือน
- 5 GB storage

**หลัง Free Tier:**
- Build: $0.01/นาที
- Hosting: $0.15/GB
- Storage: $0.023/GB/เดือน

สำหรับโปรเจค Frontend ขนาดนี้ (ประมาณ 5-10 MB) จะไม่เกิน **$1-2/เดือน** 💵

---

## ✅ Checklist สุดท้าย

- [ ] Frontend build สำเร็จใน local
- [ ] Backend Lambda API URL ใช้งานได้
- [ ] Push code ขึ้น Git repository
- [ ] สร้าง App ใน Amplify Console
- [ ] ตั้งค่า Environment Variables
- [ ] Configure build settings (`amplify.yml`)
- [ ] Deploy สำเร็จ
- [ ] ทดสอบ URL ที่ได้
- [ ] ตั้งค่า Rewrites สำหรับ React Router
- [ ] ตั้งค่า CORS ใน Backend
- [ ] ทดสอบ API calls จาก Frontend

---

## 🎉 เสร็จแล้ว!

ตอนนี้ Frontend ของคุณถูก deploy ไปยัง AWS Amplify แล้ว พร้อมใช้งาน 24/7 บน HTTPS และ CDN ทั่วโลก! 🚀

**URL ตัวอย่าง:**
- Frontend: `https://main.xxxxxxxxxxxxx.amplifyapp.com`
- Backend API: `https://<api-id>.execute-api.ap-southeast-1.amazonaws.com/dev/api`

**Resources ที่เป็นประโยชน์:**
- [AWS Amplify Docs](https://docs.aws.amazon.com/amplify/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [React Router Documentation](https://reactrouter.com/)

---

**หมายเหตุ:** ถ้ามีปัญหาหรือข้อสงสัย สามารถดู Amplify build logs ได้ใน Console → App → Build history → คลิกที่ build → ดู logs
