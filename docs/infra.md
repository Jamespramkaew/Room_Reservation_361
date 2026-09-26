# Infrastructure Guide

เอกสารนี้อธิบายวิธีรันระบบแบบ local และทดลองใช้ Terraform กับ AWS โดยอิงจากโครงสร้างปัจจุบันของ repository

## สถานะปัจจุบัน

- Terraform source อยู่ใน `infra/terraform/` และสร้าง VPC, private subnets, security groups และ RDS PostgreSQL 17
- Lambda และ API Gateway จะจัดการด้วย AWS SAM ในขั้นถัดไป; Terraform ยังไม่สร้าง Lambda, API Gateway หรือ frontend
- S3 ยังไม่รวมใน Terraform รอบนี้ เพราะมี bucket อยู่แล้วและจะกำหนดค่าภายหลัง
- ยังไม่มี Terraform config สำหรับ LocalStack ดังนั้นคำว่า local ในคู่มือนี้หมายถึง Docker Compose + LocalStack ไม่ใช่การ provision AWS resources ด้วย Terraform
- Terraform และ local ใช้ PostgreSQL 17; ค่า minor version ที่ Terraform ตั้งไว้ต้องตรวจว่ามีให้บริการใน AWS region ที่เลือก

## Local: Docker Compose และ LocalStack

LocalStack ใช้ทดสอบ Lambda/API Gateway/S3 แบบ local; ไม่ต้องใช้ AWS credentials หรือ Terraform. บน Windows ให้ใช้ WSL ที่เชื่อมกับ Docker Desktop. ต้องเตรียม Docker, Node.js 22, AWS CLI v2, `jq`, `zip` และ LocalStack auth token.

จาก WSL ที่ root ของ repository สร้างไฟล์ env ถ้ายังไม่มี:

```bash
cp .env.example .env
cp backend-lambda/.env.example backend-lambda/.env
```

ใส่ `LOCALSTACK_AUTH_TOKEN` ใน root `.env`. ค่าเริ่มต้น `DB_HOST_PORT=5432`; ถ้าพอร์ตนี้ถูกใช้อยู่ ให้ตั้งเช่น `DB_HOST_PORT=5433` และเปลี่ยน port ใน `backend-lambda/.env` ให้ตรงกันด้วย จากนั้นเปิด PostgreSQL:

```bash
docker compose up -d db
cd backend-lambda
npm install
npm run db:migrate
npm run db:seed
```

เปิด LocalStack และ deploy Lambda/API Gateway:

```bash
cd ..
docker compose up -d
cd backend-lambda
npm run deploy:local
```

ทดสอบ API:

```bash
curl http://roomres.execute-api.localhost.localstack.cloud:4566/dev/api/health
```

ถ้าต้องการรูปตัวอย่างใน LocalStack S3 ให้รัน `npm run photos:local` หลัง migrate/seed และเปิด LocalStack แล้ว การดึงรูปอาจต้องใช้อินเทอร์เน็ต. Frontend อยู่ใน terminal แยก:

```bash
cd frontend
npm install
npm run dev
```

ถ้า frontend ต้องเรียก LocalStack ให้กำหนด `VITE_API_URL=http://roomres.execute-api.localhost.localstack.cloud:4566/dev/api` ใน `frontend/.env`; ถ้าใช้ backend dev server ให้ใช้ `http://localhost:3000/api` และรัน `npm run dev` ใน `backend-lambda` แทน. หลังเริ่ม LocalStack ใหม่ ให้ตรวจ health แล้วรัน `npm run deploy:local` อีกครั้งหาก Lambda/API resources หายไป.

## Cloud: Terraform แล้ว deploy Lambda

### ก่อนเริ่ม

ต้องมี AWS account, AWS CLI v2 และ Terraform. ตั้ง AWS credentials/profile ที่มีสิทธิ์สร้าง VPC, subnet, route table, security groups และ RDS. ตัวอย่างตั้ง profile:

```powershell
aws configure --profile roomreserve
$env:AWS_PROFILE = "roomreserve"
aws sts get-caller-identity --profile $env:AWS_PROFILE
```

รัน `terraform plan/apply` ใน PowerShell session เดียวกันหลังตั้ง `$env:AWS_PROFILE`; ค่า environment นี้มีผลเฉพาะ session ปัจจุบัน. Terraform จะใช้ profile จาก environment นี้ ไม่จำเป็นต้องใส่ Account ID เอง. ถ้า deploy SAM ใน WSL ภายหลัง ต้องตั้ง credentials/profile ใน WSL แยกด้วย เพราะ AWS CLI credentials/config ของ Windows และ WSL ไม่ได้ใช้ไฟล์เดียวกัน. การสร้าง RDS/VPC มีค่าใช้จ่ายต่อเนื่องจนกว่าจะ destroy resources; ตรวจราคาและ region ก่อน apply.

### ความปลอดภัยก่อน init/plan

Terraform ใช้ S3 backend ที่ `roomres-terraform-state-568318158381-us-east-1/room-reservation/terraform.tfstate` พร้อม S3 lockfile. ไฟล์ state อาจมีข้อมูลลับ; ห้าม commit, ดาวน์โหลดไปแชร์ หรือแก้ไขด้วยมือ. `db_password` เป็น sensitive เพียงเพื่อซ่อนค่าจาก output ไม่ได้เอาค่าออกจาก state.

สร้างไฟล์ local สำหรับรหัสผ่านจากตัวอย่าง แล้วแก้ค่า placeholder:

```powershell
Copy-Item infra/terraform/terraform.tfvars.example infra/terraform/terraform.tfvars
```

### ตรวจและสร้าง AWS resources

รันจาก PowerShell ที่ root ของ repository:

```powershell
Push-Location infra/terraform
terraform fmt
terraform init
terraform validate
terraform plan
```

อ่านแผนให้ครบก่อนยืนยันสร้าง resources. เมื่อ apply เสร็จแล้ว ให้อ่านค่า outputs ขณะยังอยู่ใน `infra/terraform`:

```powershell
terraform apply
terraform output
terraform output -raw vpc_id
terraform output -json private_subnet_ids
terraform output -raw lambda_security_group_id
terraform output -raw rds_address
terraform output -raw rds_port
terraform output -raw rds_database_name
Pop-Location
```

### ให้เพื่อนดูหรือทำงานกับ Terraform

เพื่อนต้อง checkout โค้ดที่มี Terraform files และ `.terraform.lock.hcl`, มี AWS credentials ของตัวเองใน account เดียวกัน และได้รับสิทธิ์อ่าน S3 state bucket/key กับตรวจดู AWS resources ที่ Terraform จัดการ. ห้ามส่ง AWS access keys หรือไฟล์ state ให้กัน.

ครั้งแรกให้เพื่อนตั้ง profile ของตัวเองและ initialize backend จาก PowerShell ที่ root ของ repository:

```powershell
aws configure --profile <profile-ของเพื่อน>
$env:AWS_PROFILE = "<profile-ของเพื่อน>"
aws sts get-caller-identity
Push-Location infra/terraform
terraform init
```

นี่เป็น backend ที่ใช้อยู่แล้ว จึงใช้ `terraform init` ปกติ ไม่ใช้ `-migrate-state` (ตัวเลือกนั้นใช้ย้าย state เท่านั้น). ถ้าเพื่อนต้องการแค่ดู managed resources/outputs ก็ใช้:

```powershell
terraform state list
terraform output
Pop-Location
```

เพื่อนไม่ต้องรัน `terraform apply` เพื่อดูหรือใช้ข้อมูล infrastructure ที่มีอยู่. `terraform plan` เป็นการอ่าน/คำนวณแผนและไม่สร้าง resources แต่ต้องมีสิทธิ์อ่าน AWS resources และค่าตัวแปรที่ตรงกับ environment; การเข้าถึง backend อาจสร้างและปลด lock ชั่วคราว. ให้ใช้ `plan` เมื่อต้องตรวจ change ที่เสนอเท่านั้น.

ให้ `apply` ทำโดยผู้รับผิดชอบ infrastructure หลังทีม review plan และตกลงเปลี่ยนแปลงแล้วเท่านั้น. ก่อน apply ต้องแน่ใจว่าใช้ workspace, account, region และตัวแปรชุดเดียวกับ shared environment; ห้ามเพื่อน apply เองเพียงเพื่อ refresh state หรือดูผล.

หลัง Terraform apply ขั้นถัดไปคือสร้าง/ตั้งค่า SAM template (repository ยังไม่มี SAM template และยังไม่มีคำสั่ง SAM deploy ในตอนนี้). นำ `private_subnet_ids` และ `lambda_security_group_id` ไปใส่ใน `VpcConfig` ของ Lambda resources. RDS security group อนุญาต TCP 5432 จาก Lambda security group นี้เท่านั้น. Lambda execution role ต้องมี `AWSLambdaVPCAccessExecutionRole` หรือสิทธิ์จัดการ network interfaces ที่เทียบเท่า.

ตั้ง `DATABASE_URL` ของ Lambda จาก RDS outputs และรหัสผ่านที่ใช้ตอนสร้าง RDS:

```text
postgresql://<db_username>:<db_password>@<rds_address>:<rds_port>/<rds_database_name>?sslmode=require
```

ตรวจเวอร์ชัน PostgreSQL 17 ที่ AWS region รองรับก่อน apply; เปลี่ยน `db_engine_version` ใน tfvars หาก `17.4` ไม่มีให้บริการใน region นั้น. `terraform apply` สร้างเฉพาะ VPC/RDS; ยังไม่ deploy application และยังไม่สร้างหรือแก้ S3 bucket. อย่าใช้ `infra/scripts/deploy.sh` เป็น AWS SAM deployment.

เมื่อต้องการลบ environment ทดลอง ให้ตรวจ resource และผลกระทบก่อน แล้วสั่ง `terraform destroy` จาก directory เดียวกับ module. คำสั่งนี้ลบ RDS และข้อมูลในนั้นด้วย; export/สำรองข้อมูลที่ต้องเก็บก่อนเสมอ.

## สิ่งที่ยังขาดหรือควรแก้ก่อนใช้งานจริง

1. **State และ version pinning:** local state ใช้ทดลองได้ แต่ทีมควรตั้ง remote backend ที่เข้ารหัสและมี locking; ควร commit `.terraform.lock.hcl` และ pin Terraform CLI version
2. **ตรวจ PostgreSQL version:** config ตั้ง PostgreSQL 17.4 ให้ตรง major version กับ local PostgreSQL 17 แต่ต้องตรวจ minor version ที่ AWS region รองรับก่อน apply
3. **Application networking ผ่าน SAM:** SAM ต้องใช้ subnet และ Lambda security group outputs ใน `VpcConfig`, และ execution role ต้องมีสิทธิ์จัดการ VPC network interfaces. Private subnets ไม่มี NAT; Lambda ใน VPC จึงออก internet/AWS public endpoints ไม่ได้ เว้นแต่เพิ่ม NAT หรือ VPC endpoints ตามบริการที่ต้องเรียก
4. **S3 ถูกพักไว้ก่อน:** Terraform รอบนี้ไม่สร้างหรือแก้ bucket. ก่อนเปิดใช้งานฟังก์ชันรูป ให้ระบุ bucket ที่มีอยู่, IAM permissions และ URL/access policy ของรูปให้ชัดเจน
5. **กำหนด lifecycle/backup:** RDS เปิด `skip_final_snapshot`; ค่าดังกล่าวเหมาะกับ sandbox เท่านั้นและการ destroy จะลบข้อมูลถาวร
6. **ข้อมูลเริ่มต้นบน AWS:** `db:seed` ต่อฐานข้อมูลโดยตรง แต่ RDS เป็น private. หากต้องการข้อมูลตัวอย่าง ให้รัน seed จากเครื่องที่เชื่อม VPC ได้หรือเพิ่ม one-off job ใน VPC; อย่าเปิด RDS สาธารณะเพียงเพื่อ seed

Terraform ในขอบเขตปัจจุบันจัดการเฉพาะ VPC และ RDS; output จะเป็น input สำหรับ SAM ที่ใช้ deploy Lambda/API Gateway ในขั้นถัดไป. S3 ยังไม่รวมในรอบนี้.