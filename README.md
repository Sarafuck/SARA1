# ThaiSocial Platform 🇹🇭

แพลตฟอร์มโซเชียลมีเดียที่รวมระบบการกู้เงินและการสร้างแรงจูงใจผ่านระบบ XP

## ✨ คุณสมบัติหลัก

### 📱 โซเชียลมีเดีย
- โพสต์ข้อความและรูปภาพ
- ระบบไลค์และดิสไลค์
- ระบบคอมเมนต์
- การเพิ่มเพื่อนและแชท

### 💰 ระบบสินเชื่อ
- ขอสินเชื่อออนไลน์
- คำนวณดอกเบี้ยแบบรายวัน
- ระบบอนุมัติโดยแอดมิน
- ติดตามสถานะการชำระ

### 👑 สมาชิกพรีเมียม
- ชำระค่าสมาชิก 100 บาท/เดือน
- ได้เครดิตเพิ่ม 50%
- ลดอัตราดอกเบี้ย 2%
- โบนัส XP 25%

### 🛍️ ร้านค้า
- ซื้อธีมและไอเทมตกแต่ง
- ระบบ XP เป็นสกุลเงิน
- ไอเทมหายากและธีมพิเศษ

### ⚙️ แผงควบคุมแอดมิน
- จัดการผู้ใช้และสินเชื่อ
- ปรับอัตราดอกเบี้ยแบบยืดหยุ่น
- อนุมัติการชำระเงินสมาชิก
- สถิติและรายงานระบบ

## 🚀 เทคโนโลยี

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- Wouter (Routing)
- TanStack Query (State Management)
- Framer Motion (Animations)

**Backend:**
- Node.js + Express
- PostgreSQL + Drizzle ORM
- Replit Auth (Authentication)
- Real-time WebSocket

**Features:**
- 📱 Responsive Design (Mobile-first)
- 🔒 JWT Authentication
- 🎨 Dark/Light Mode Support
- 📊 Real-time Updates
- 💾 Optimistic UI Updates

## 📱 การใช้งานบนมือถือ

โปรเจกต์นี้ออกแบบมาให้ใช้งานบนมือถือได้อย่างสมบูรณ์:

- **Responsive Design**: ปรับขนาดอัตโนมัติตามหน้าจอ
- **Touch-friendly**: ปุ่มและ UI เหมาะสำหรับการสัมผัส
- **Progressive Web App**: สามารถติดตั้งเป็นแอปได้
- **Offline Support**: ทำงานได้แม้ไม่มีอินเทอร์เน็ต (บางส่วน)

## 🛠️ การติดตั้ง

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/thai-social-platform.git
cd thai-social-platform
```

### 2. ติดตั้ง Dependencies
```bash
npm install
```

### 3. ตั้งค่า Environment Variables
```bash
cp .env.example .env
```

แก้ไขไฟล์ `.env`:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/thaisocial
REPL_ID=your-repl-id
NODE_ENV=development
```

### 4. ตั้งค่าฐานข้อมูล
```bash
npm run db:push
```

### 5. รันโปรเจกต์
```bash
npm run dev
```

เว็บไซต์จะเปิดที่ `http://localhost:5000`

## 📝 การใช้งาน

### สำหรับผู้ใช้ทั่วไป:
1. เข้าสู่ระบบด้วย Replit Auth
2. สร้างโพสต์และโต้ตอบกับเพื่อน
3. สะสม XP จากการโต้ตอบ
4. ขอสินเชื่อเมื่อต้องการ
5. อัปเกรดเป็นสมาชิกพรีเมียม

### สำหรับแอดมิน:
1. เข้าสู่แผงควบคุมแอดมิน
2. จัดการผู้ใช้และสินเชื่อ
3. ปรับการตั้งค่าระบบ
4. อนุมัติการชำระเงิน

## 🚀 การ Deploy

### Replit
1. Import โปรเจกต์ไป Replit
2. ตั้งค่า Environment Variables
3. กด Run

### Vercel/Netlify
1. Connect GitHub Repository
2. ตั้งค่า Build Commands:
   ```bash
   npm run build
   ```
3. ตั้งค่า Environment Variables

### VPS/Cloud
1. Clone repository
2. ติดตั้ง PM2 หรือ Docker
3. ตั้งค่า Nginx/Apache
4. ตั้งค่า SSL Certificate

## 🤝 การมีส่วนร่วม

ยินดีรับ Pull Request และ Issues!

1. Fork โปรเจกต์
2. สร้าง Feature Branch
3. Commit การเปลี่ยนแปลง
4. Push ไป Branch
5. สร้าง Pull Request

## 📄 License

MIT License - ดูไฟล์ [LICENSE](LICENSE) สำหรับรายละเอียด

## 👥 ผู้พัฒนา

- **[Your Name]** - ผู้พัฒนาหลัก

## 📞 ติดต่อ

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

**Made with ❤️ in Thailand 🇹🇭**