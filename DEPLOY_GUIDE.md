# 🚀 คู่มือ Deploy แอป ThaiSocial บน Vercel + Supabase (ฟรี)

## 📋 สิ่งที่ต้องเตรียม
- [ ] บัญชี GitHub
- [ ] บัญชี Vercel
- [ ] บัญชี Supabase

---

## ขั้นตอนที่ 1: เตรียม GitHub Repository

### 1.1 สร้าง Repository ใหม่
1. ไปที่ [github.com](https://github.com)
2. กด "New repository"
3. ตั้งชื่อ: `thai-social-platform`
4. เลือก "Public" (สำหรับแผนฟรี)
5. กด "Create repository"

### 1.2 อัปโหลดโค้ด
```bash
# ใน terminal ของ Replit
git init
git add .
git commit -m "Initial commit: Thai Social Platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/thai-social-platform.git
git push -u origin main
```

---

## ขั้นตอนที่ 2: ตั้งค่า Supabase Database

### 2.1 สร้าง Project
1. ไปที่ [supabase.com](https://supabase.com)
2. กด "Start your project"
3. เข้าสู่ระบบด้วย GitHub
4. กด "New project"
5. เลือก Organization
6. ตั้งชื่อ: `thai-social-db`
7. ใส่ password ที่แข็งแรง (จดไว้!)
8. เลือก region: Southeast Asia (Singapore)
9. กด "Create new project"

### 2.2 รอให้ Database พร้อม (2-3 นาที)

### 2.3 ดู Connection String
1. ไปที่ Settings → Database
2. ใน "Connection string" ให้เลือก "URI"
3. Copy URL (จะเหมือนนี้):
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

---

## ขั้นตอนที่ 3: Deploy บน Vercel

### 3.1 สร้างบัญชี Vercel
1. ไปที่ [vercel.com](https://vercel.com)
2. กด "Sign up"
3. เลือก "Continue with GitHub"

### 3.2 Import Project
1. ใน Vercel Dashboard กด "Add New..."
2. เลือก "Project"
3. หา repository `thai-social-platform`
4. กด "Import"

### 3.3 Configure Project
1. **Framework Preset**: Vite
2. **Root Directory**: `./` (ค่าเริ่มต้น)
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

### 3.4 ตั้งค่า Environment Variables
ใน Configure Project ให้เพิ่ม:

```env
DATABASE_URL = postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
NODE_ENV = production
REPL_ID = your-vercel-project-name
```

### 3.5 Deploy
กด "Deploy" และรอสักครู่

---

## ขั้นตอนที่ 4: ตั้งค่า Database Schema

### 4.1 Push Schema ไป Supabase
หลังจาก deploy สำเร็จ ให้รันคำสั่งนี้ใน local:

```bash
# แก้ไข .env file
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Push schema
npm run db:push
```

### 4.2 ตรวจสอบใน Supabase
1. ไปที่ Supabase Dashboard
2. เลือก "Table Editor"
3. จะเห็นตารางทั้งหมด: users, posts, loans, etc.

---

## ขั้นตอนที่ 5: ทดสอบแอป

### 5.1 เข้าใช้งาน
1. ไปที่ URL ที่ Vercel ให้ (เช่น `your-app.vercel.app`)
2. ลองเข้าสู่ระบบ
3. ทดสอบฟีเจอร์ต่างๆ

### 5.2 Custom Domain (Optional)
1. ใน Vercel ไปที่ Settings → Domains
2. เพิ่ม domain ที่ต้องการ
3. ตั้งค่า DNS ตามที่แนะนำ

---

## 🎯 ผลลัพธ์ที่ได้

✅ **แอปทำงานได้ 24/7**
✅ **ไม่มีค่าใช้จ่าย** (แผนฟรี)
✅ **เร็วกว่า Replit** มาก
✅ **ใช้งานบนมือถือ** ได้สมบูรณ์
✅ **ปัญหาการลบโพสต์หายไป**
✅ **Bottom navigation ทำงานเต็มประสิทธิภาพ**

---

## 📊 ข้อมูลการใช้งาน

### Vercel (ฟรี):
- 100GB bandwidth/เดือน
- 100GB-hours function execution
- Unlimited projects
- Custom domains

### Supabase (ฟรี):
- 500MB database
- 5GB bandwidth/เดือน
- Unlimited API requests
- 50MB file storage

---

## 🆘 แก้ปัญหา

### ปัญหา Build Error:
```bash
# ลองแก้ไข package.json
"build": "vite build --mode production"
```

### ปัญหา Database Connection:
1. ตรวจสอบ DATABASE_URL ใน Vercel
2. ใช้ connection pooling:
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:6543/postgres?pgbouncer=true
```

### ปัญหา API Routes:
1. ตรวจสอบว่า vercel.json ถูกต้อง
2. Redeploy project ใหม่

---

## 🎉 เสร็จสิ้น!

แอป ThaiSocial ของคุณพร้อมใช้งานแล้ว! 

**URL**: `https://your-project-name.vercel.app`

มีปัญหาหรือข้อสงสัยเพิ่มเติมไหมครับ?