# 🗄️ คู่มือตั้งค่า Supabase Database

## ขั้นตอนการตั้งค่า Supabase

### 1. สร้างบัญชี Supabase
1. ไปที่ [supabase.com](https://supabase.com)
2. สมัครด้วย GitHub account
3. สร้าง project ใหม่

### 2. ตั้งค่า Database
1. รอให้ Supabase สร้าง database (2-3 นาที)
2. ไปที่ Settings > Database
3. Copy `Connection string` (URI format)

### 3. เปลี่ยน Environment Variables
แทนที่ `DATABASE_URL` ในไฟล์ `.env`:

```env
# แทนที่ URL เดิม
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# ตัวอย่าง
DATABASE_URL=postgresql://postgres:your-password@db.abcdefghijklmnop.supabase.co:5432/postgres
```

### 4. Push Schema ไป Supabase
รันคำสั่งนี้เพื่อสร้างตารางในฐานข้อมูล:

```bash
npm run db:push
```

### 5. ตรวจสอบ Tables
ไปที่ Supabase Dashboard > Table Editor
จะเห็นตารางทั้งหมดที่สร้างแล้ว:
- users
- posts
- loans
- friendships
- theme_items
- และอื่นๆ

## 📊 ข้อมูลแผน Supabase ฟรี

- **Database**: 500MB
- **Bandwidth**: 5GB/เดือน
- **Realtime**: ไม่จำกัด
- **Authentication**: ไม่จำกัด users
- **Storage**: 1GB

## 🚀 Deploy บน Vercel + Supabase

### Vercel Settings:
```env
DATABASE_URL=your-supabase-connection-string
NODE_ENV=production
REPL_ID=your-vercel-project-name
REPLIT_DOMAINS=your-app.vercel.app
```

### Build Commands:
```bash
# Build Command
npm run build

# Output Directory  
dist

# Install Command
npm install
```

## ⚠️ สิ่งที่ต้องระวัง

1. **Password Security**: ใส่ password ที่แข็งแรง
2. **Row Level Security**: Supabase จะเปิดให้อัตโนมัติ
3. **Connection Limit**: ฟรีมี 60 connections
4. **Backup**: Supabase backup ให้อัตโนมัติ

## 🔧 การ Migrate จาก Replit

1. Export ข้อมูลจาก Replit (ถ้ามี):
```sql
pg_dump $DATABASE_URL > backup.sql
```

2. Import ไป Supabase:
```sql
psql "your-supabase-url" < backup.sql
```

## 📈 การ Scale Up

เมื่อผู้ใช้เยอะขึ้น สามารถอัปเกรดเป็น:
- **Pro Plan**: $25/เดือน (8GB database)
- **Team Plan**: $599/เดือน (unlimited)

## 🆘 การแก้ปัญหา

### ปัญหา Connection
```env
# ลองเปลี่ยนจาก connection string เป็น pooled connection
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:6543/postgres?pgbouncer=true
```

### ปัญหา Schema
```bash
# Reset และ push ใหม่
npm run db:drop  # ระวัง! จะลบข้อมูลทั้งหมด
npm run db:push
```

---

**🎯 พร้อมใช้งานแล้ว!** 
หลังตั้งค่าเสร็จ แอปจะทำงานได้เหมือนเดิม แต่เร็วและเสถียรกว่า!