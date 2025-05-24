# คู่มือการพัฒนา ThaiSocial Platform

## 📋 ภาพรวมโครงการ

ThaiSocial เป็นแพลตฟอร์มโซเชียลมีเดียที่มีระบบการเงินแบบครบวงจร ออกแบบมาเพื่อสร้างชุมชนที่แข็งแกร่งและให้โอกาสทางการเงินที่ยุติธรรม โดยใช้ระบบ XP และการเลื่อนระดับเพื่อปลดล็อกสิทธิประโยชน์ต่างๆ

### 🎯 วัตถุประสงค์หลัก
- สร้างเครือข่ายสังคมที่มีคุณภาพ
- ให้บริการกู้เงินอัตราดอกเบี้ยต่ำตามระดับผู้ใช้
- สร้างแรงจูงใจในการมีส่วนร่วมผ่านระบบ XP
- ระบบจัดการที่ยืดหยุ่นสำหรับแอดมิน

## 🏗️ สถาปัตยกรรมระบบ

### Frontend (React + TypeScript)
```
client/
├── src/
│   ├── components/          # คอมโพเนนต์ UI
│   │   ├── ui/             # Base UI components (shadcn/ui)
│   │   ├── admin/          # ระบบแอดมิน
│   │   ├── lending/        # ระบบกู้เงิน
│   │   ├── post/           # ระบบโพสต์
│   │   └── layout/         # เลย์เอาต์
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # ยูทิลิตี้และการตั้งค่า
│   ├── pages/              # หน้าต่างๆ
│   └── main.tsx           # Entry point
```

### Backend (Express + TypeScript)
```
server/
├── index.ts               # Server entry point
├── routes.ts              # API routes
├── storage.ts             # Database operations
├── db.ts                  # Database connection
├── replitAuth.ts          # Authentication system
└── vite.ts               # Development server
```

### Database (PostgreSQL + Drizzle ORM)
```
shared/
└── schema.ts             # Database schema และ types
```

## 🗃️ โครงสร้างฐานข้อมูล

### ตารางหลัก

#### 1. Users (ผู้ใช้งาน)
```sql
users
├── id: string (Primary Key)
├── email: string
├── first_name: string
├── last_name: string
├── profile_image_url: string
├── xp: number (คะแนนประสบการณ์)
├── level: number (ระดับผู้ใช้ 1-4)
├── is_admin: boolean
├── membership_paid: boolean
├── created_at: timestamp
└── updated_at: timestamp
```

#### 2. Posts (โพสต์)
```sql
posts
├── id: serial (Primary Key)
├── user_id: string (Foreign Key)
├── content: text
├── created_at: timestamp
└── updated_at: timestamp
```

#### 3. Loans (เงินกู้)
```sql
loans
├── id: serial (Primary Key)
├── user_id: string (Foreign Key)
├── amount: decimal(10,2)
├── interest_rate: decimal(5,2)
├── total_amount: decimal(10,2)
├── status: string (pending, approved, rejected, active, repaid, overdue)
├── loan_purpose: text
├── due_date: timestamp
├── paid_at: timestamp
├── approved_at: timestamp
├── approved_by: string (Foreign Key)
├── rejected_at: timestamp
├── rejected_by: string (Foreign Key)
├── rejection_reason: text
├── admin_notes: text
├── loan_term_days: integer (default: 30)
└── created_at: timestamp
```

#### 4. System Settings (การตั้งค่าระบบ)
```sql
system_settings
├── id: serial (Primary Key)
├── key: string (Unique)
├── value: text
├── description: text
├── data_type: string (string, number, boolean, json)
├── category: string (general, lending, xp, levels)
├── updated_at: timestamp
└── updated_by: string (Foreign Key)
```

## 🎮 ระบบ XP และระดับ

### การได้รับ XP
- โพสต์เนื้อหา: +10 XP
- ไลค์โพสต์: +2 XP  
- คอมเมนต์: +5 XP
- ชำระเงินตรงเวลา: +50 XP
- ชำระเงินล่าช้า: -100 XP

### ระดับและสิทธิประโยชน์
| ระดับ | XP ที่ต้องการ | วงเงินกู้ | อัตราดอกเบี้ย |
|-------|---------------|-----------|---------------|
| 1     | 0-499        | ฿10,000   | 5%           |
| 2     | 500-1,499    | ฿20,000   | 3%           |
| 3     | 1,500-2,999  | ฿30,000   | 2%           |
| 4     | 3,000+       | ฿50,000   | 1%           |

## 🔧 การตั้งค่าและติดตั้ง

### ข้อกำหนดระบบ
- Node.js 18+
- PostgreSQL 14+
- npm หรือ yarn

### การติดตั้ง
```bash
# 1. Clone repository
git clone <repository-url>
cd thaisocial

# 2. ติดตั้ง dependencies
npm install

# 3. ตั้งค่าฐานข้อมูล
npm run db:push

# 4. รันโปรเจกต์
npm run dev
```

### Environment Variables
```env
DATABASE_URL=postgresql://...
SESSION_SECRET=your-secret-key
REPL_ID=your-repl-id
REPLIT_DOMAINS=your-domain.replit.dev
ISSUER_URL=https://replit.com/oidc
```

## 💰 ระบบการกู้เงิน

### ขั้นตอนการขอกู้เงิน
1. **ผู้ใช้ส่งคำขอ**: กรอกฟอร์มขอกู้พร้อมเหตุผล
2. **คำนวณเงื่อนไข**: ระบบคำนวณอัตราดอกเบี้ยและวงเงินตามระดับ
3. **รอการอนุมัติ**: แอดมินพิจารณาอนุมัติหรือปฏิเสธ
4. **การชำระเงิน**: ผู้ใช้ชำระเงินแบบแมนนวล
5. **อัปเดต XP**: ได้รับหรือถูกหัก XP ตามการชำระ

### API Endpoints การกู้เงิน
```typescript
// คำนวณเงื่อนไขการกู้
POST /api/loans/calculate
{
  "amount": 15000,
  "termDays": 30
}

// ส่งคำขอกู้เงิน
POST /api/loans
{
  "amount": 15000,
  "loanTermDays": 30,
  "loanPurpose": "ค่าครองชีพ"
}

// ดูคำขอกู้ของตัวเอง
GET /api/loans
```

## 👑 ระบบแอดมิน

### หน้าที่ของแอดมิน
1. **จัดการคำขอกู้เงิน**: อนุมัติ/ปฏิเสธคำขอ
2. **ตั้งค่าระบบ**: ปรับวงเงิน, อัตราดอกเบี้ย, XP
3. **จัดการผู้ใช้**: ดูสถิติ, แบน/ปลดแบน
4. **ตรวจสอบการโกง**: ระบบป้องกันการฉ้อโกง

### API Endpoints แอดมิน
```typescript
// ดูคำขอกู้ทั้งหมด
GET /api/admin/loans

// อนุมัติคำขอกู้
POST /api/admin/loans/:id/approve
{
  "notes": "อนุมัติตามเงื่อนไข"
}

// ปฏิเสธคำขอกู้
POST /api/admin/loans/:id/reject
{
  "reason": "เอกสารไม่ครบถ้วน"
}

// ดูการตั้งค่าระบบ
GET /api/admin/settings

// อัปเดตการตั้งค่า
PUT /api/admin/settings
{
  "key": "max_loan_level_1",
  "value": "15000"
}
```

## 🎨 การใช้งาน UI Components

### ฟอร์มขอกู้เงิน
```tsx
import LoanRequestForm from "@/components/lending/loan-request-form";

<LoanRequestForm 
  userStats={userStats} 
  onClose={() => setShowForm(false)} 
/>
```

### หน้าจัดการแอดมิน
```tsx
import LoanManagement from "@/components/admin/loan-management";
import SystemSettings from "@/components/admin/system-settings";

// ในหน้าแอดมิน
<LoanManagement />
<SystemSettings />
```

## 🔒 ระบบความปลอดภัย

### การยืนยันตัวตน
- ใช้ Replit OAuth สำหรับการเข้าสู่ระบบ
- Session-based authentication
- Role-based access control (Admin/User)

### การป้องกันการโกง
- ตรวจสอบประวัติการชำระเงิน
- จำกัดจำนวนเงินกู้พร้อมกัน
- ระบบ Fraud List สำหรับผู้ใช้ที่มีปัญหา

## 📊 การตั้งค่าระบบที่ปรับแต่งได้

### การตั้งค่าระบบกู้เงิน
```javascript
// วงเงินกู้ตามระดับ
max_loan_level_1: "10000"
max_loan_level_2: "20000"
max_loan_level_3: "30000"
max_loan_level_4: "50000"

// อัตราดอกเบี้ยตามระดับ
interest_rate_level_1: "5.0"
interest_rate_level_2: "3.0"
interest_rate_level_3: "2.0"
interest_rate_level_4: "1.0"

// ระยะเวลากู้
max_loan_term_days: "90"
min_loan_term_days: "7"
```

### การตั้งค่า XP
```javascript
// XP จากกิจกรรม
xp_post_create: "10"
xp_post_like: "2"
xp_comment_create: "5"
xp_loan_repay_ontime: "50"
xp_loan_repay_late: "-100"

// XP สำหรับเลื่อนระดับ
level_2_required_xp: "500"
level_3_required_xp: "1500"
level_4_required_xp: "3000"
```

## 🚀 การ Deploy

### Replit Deployment
1. ตรวจสอบให้แน่ใจว่าทุกอย่างทำงานในโหมด development
2. กด Deploy button ใน Replit
3. ระบบจะ build และ deploy อัตโนมัติ

### การ Monitor
- ตรวจสอบ logs ผ่าน Replit console
- ดู error logs ใน browser console
- ใช้ Replit database viewer สำหรับ debug

## 🐛 การแก้ไขปัญหาที่พบบ่อย

### ปัญหาการเชื่อมต่อฐานข้อมูล
```bash
# ตรวจสอบการเชื่อมต่อ
npm run db:push

# รีเซ็ตฐานข้อมูล (ระวัง: จะลบข้อมูลทั้งหมด)
npm run db:reset
```

### ปัญหา Authentication
- ตรวจสอบ Environment Variables
- ลองล็อกเอาต์แล้วล็อกอินใหม่
- ตรวจสอบ session ใน browser storage

### ปัญหา UI ไม่แสดงผล
- ตรวจสอบ browser console สำหรับ errors
- ลอง refresh หน้าเว็บ
- ตรวจสอบ network tab สำหรับ failed requests

## 📝 การเพิ่มฟีเจอร์ใหม่

### ขั้นตอนการพัฒนา
1. **วางแผนฟีเจอร์**: กำหนดวัตถุประสงค์และขอบเขต
2. **ออกแบบฐานข้อมูล**: เพิ่มตารางหรือฟิลด์ใหม่ใน schema.ts
3. **สร้าง API**: เพิ่ม endpoints ใน routes.ts
4. **พัฒนา UI**: สร้างคอมโพเนนต์ใหม่
5. **ทดสอบ**: ตรวจสอบการทำงานและ edge cases
6. **Deploy**: อัปเดตระบบ production

### ตัวอย่างการเพิ่มฟีเจอร์ "ระบบแชท"
```typescript
// 1. เพิ่มใน schema.ts
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: varchar("sender_id").references(() => users.id),
  receiverId: varchar("receiver_id").references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. เพิ่มใน storage.ts
async createMessage(message: InsertMessage): Promise<Message> {
  // implementation
}

// 3. เพิ่มใน routes.ts
app.post('/api/messages', isAuthenticated, async (req, res) => {
  // implementation
});

// 4. สร้าง component
// client/src/components/chat/chat-box.tsx
```

## 📚 เอกสารเพิ่มเติม

### Technologies ที่ใช้
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **shadcn/ui**: UI component library
- **Express**: Backend framework
- **Drizzle ORM**: Database ORM
- **PostgreSQL**: Database
- **Replit Auth**: Authentication

### การอ้างอิง
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Drizzle ORM](https://orm.drizzle.team/docs)
- [shadcn/ui](https://ui.shadcn.com)

## 🤝 การร่วมพัฒนา

### Code Style
- ใช้ TypeScript สำหรับ type safety
- ตั้งชื่อตัวแปรและฟังก์ชันเป็นภาษาอังกฤษ
- เขียนคอมเมนต์เป็นภาษาไทยเพื่อความเข้าใจ
- ใช้ ESLint และ Prettier สำหรับ code formatting

### Git Workflow
```bash
# สร้าง branch ใหม่สำหรับฟีเจอร์
git checkout -b feature/new-feature

# Commit changes
git add .
git commit -m "เพิ่มฟีเจอร์ใหม่: ระบบแชท"

# Push และสร้าง Pull Request
git push origin feature/new-feature
```

---

## 🎉 สรุป

ThaiSocial Platform เป็นระบบที่ออกแบบมาให้มีความยืดหยุ่นและขยายตัวได้ง่าย ด้วยสถาปัตยกรรมที่ดีและการใช้เทคโนโลยีที่ทันสมัย ทำให้สามารถพัฒนาและบำรุงรักษาได้อย่างมีประสิทธิภาพ

**Happy Coding! 🚀**