# 🚀 คู่มือการ Deploy ThaiSocial Platform

## วิธีการย้ายจาก Replit ไป GitHub

### 1. เตรียม Repository บน GitHub

```bash
# สร้าง repository ใหม่บน GitHub
# ตั้งชื่อ: thai-social-platform
# เลือก Public หรือ Private ตามต้องการ
```

### 2. Copy ไฟล์จาก Replit

1. ดาวน์โหลดไฟล์ทั้งหมดจาก Replit
2. ลบไฟล์ที่ไม่จำเป็น:
   - `.replit`
   - `replit.nix`
   - `.upm/`

### 3. ตั้งค่า Git Repository

```bash
git init
git add .
git commit -m "Initial commit: Thai Social Platform"
git branch -M main
git remote add origin https://github.com/yourusername/thai-social-platform.git
git push -u origin main
```

## การ Deploy บนแพลตฟอร์มต่างๆ

### 🔵 Vercel (แนะนำสำหรับ Frontend + API)

1. **เชื่อมต่อ GitHub**
   - ไปที่ vercel.com
   - เชื่อมต่อ GitHub account
   - Import repository

2. **ตั้งค่า Build**
   ```bash
   # Build Command
   npm run build
   
   # Output Directory
   dist
   
   # Install Command
   npm install
   ```

3. **Environment Variables**
   ```env
   DATABASE_URL=your-postgres-url
   NODE_ENV=production
   REPL_ID=your-vercel-project-id
   REPLIT_DOMAINS=your-app.vercel.app
   ```

### 🟣 Railway (แนะนำสำหรับ Full-stack)

1. **Deploy ผ่าน GitHub**
   - ไปที่ railway.app
   - เชื่อมต่อ GitHub
   - เลือก repository

2. **ตั้งค่า Database**
   ```bash
   # Railway จะสร้าง PostgreSQL ให้อัตโนมัติ
   # Copy DATABASE_URL จาก Railway Dashboard
   ```

3. **ตั้งค่า Environment Variables**
   - ไปที่ Variables tab
   - เพิ่ม environment variables ที่จำเป็น

### 🟠 Heroku

1. **สร้าง Heroku App**
   ```bash
   heroku create thai-social-platform
   heroku addons:create heroku-postgresql:hobby-dev
   ```

2. **ตั้งค่า Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set REPL_ID=your-heroku-app-name
   heroku config:set REPLIT_DOMAINS=your-app.herokuapp.com
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### 🟢 Netlify (สำหรับ Static Hosting + Functions)

1. **Build Settings**
   ```bash
   # Build command
   npm run build
   
   # Publish directory
   dist
   ```

2. **Netlify Functions** (สำหรับ API)
   - สร้างโฟลเดอร์ `netlify/functions/`
   - ย้าย API routes ไปเป็น serverless functions

## การตั้งค่าฐานข้อมูล

### 🐘 PostgreSQL Options

1. **Supabase** (แนะนำ)
   - ฟรี 500MB
   - Real-time subscriptions
   - Built-in Auth

2. **PlanetScale**
   - MySQL-compatible
   - Serverless
   - ฟรี 5GB

3. **Railway PostgreSQL**
   - $5/เดือน
   - ไม่จำกัดการใช้งาน

4. **Heroku Postgres**
   - ฟรี 10,000 rows
   - $9/เดือน สำหรับ unlimited

## การปรับแต่งสำหรับมือถือ

### 📱 PWA Setup

เพิ่มไฟล์ `public/manifest.json`:
```json
{
  "name": "ThaiSocial Platform",
  "short_name": "ThaiSocial",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6"
}
```

### 🎨 Responsive Design

ปรับ CSS ใน `index.css`:
```css
/* Mobile-first approach */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    position: fixed;
    bottom: 0;
    height: 60px;
  }
}
```

### ⚡ Performance Optimization

1. **Code Splitting**
   ```typescript
   // ใช้ lazy loading สำหรับ pages
   const AdminPage = lazy(() => import('./pages/admin'));
   ```

2. **Image Optimization**
   ```typescript
   // ใช้ WebP format
   // Lazy load images
   // Compress images
   ```

## การ Monitor และ Analytics

### 📊 Monitoring Tools

1. **Vercel Analytics** - ฟรี
2. **Google Analytics** - ฟรี
3. **Sentry** - Error tracking
4. **Uptime Robot** - Uptime monitoring

### 🔍 Performance Monitoring

```javascript
// Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

## การรักษาความปลอดภัย

### 🔒 Security Checklist

- [ ] HTTPS เท่านั้น
- [ ] Environment variables secure
- [ ] Rate limiting
- [ ] Input validation
- [ ] SQL injection protection
- [ ] XSS protection
- [ ] CORS configuration

### 🛡️ Best Practices

1. **Never commit secrets**
2. **Use environment variables**
3. **Enable 2FA on all accounts**
4. **Regular security updates**
5. **Monitor for vulnerabilities**

## การ Backup และ Recovery

### 💾 Database Backup

```bash
# PostgreSQL backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### 📁 Code Backup

- GitHub เป็น primary backup
- ตั้งค่า automated backups บน cloud provider
- Export ข้อมูลสำคัญเป็น JSON

## ค่าใช้จ่ายประมาณ (ต่อเดือน)

| Service | ราคา | หมายเหตุ |
|---------|------|-----------|
| Vercel Pro | $20 | Unlimited projects |
| Railway | $5 | Database + hosting |
| Domain | $12/ปี | .com domain |
| **รวม** | **~$27** | สำหรับ production |

### ตัวเลือกฟรี

- Vercel Hobby (จำกัด)
- Railway $5 credit
- Supabase 500MB
- **รวม: ฟรี** (มีข้อจำกัด)

## การ Scale Up

เมื่อผู้ใช้เยอะขึ้น:

1. **Database**: อัปเกรดเป็น dedicated instance
2. **CDN**: ใช้ Cloudflare หรือ AWS CloudFront  
3. **Caching**: เพิ่ม Redis
4. **Load Balancer**: กระจายโหลด
5. **Microservices**: แยก services

---

**📞 ต้องการความช่วยเหลือ?**
- GitHub Issues
- Discord Community
- Email Support