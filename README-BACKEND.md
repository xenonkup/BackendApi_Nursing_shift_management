# Backend API - ระบบจัดการเวรพยาบาล

## คุณสมบัติ Backend
- JWT Authentication & Authorization
- User Management (NURSE/HEAD_NURSE roles)
- Shift Management (สร้าง/จัด/ดูเวร)
- Leave Request Management (ขอลา/อนุมัติ/ปฏิเสธ)
- MongoDB Database with Prisma ORM

## เทคโนโลยี
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **ORM**: Prisma
- **Authentication**: JWT + bcryptjs
- **Validation**: Custom middleware

## วิธีการรัน Backend

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. ตั้งค่า Environment Variables
สร้างไฟล์ `.env`:
```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database"
SECRET_KEY="your-secret-key"
```

### 3. Generate Prisma Client
```bash
npm run db:generate
```

### 4. รัน Development Server
```bash
npm run dev
```
Server จะรันที่: `http://localhost:3001`

## ข้อมูลทดสอบ

### หัวหน้าพยาบาล
- **Email**: `test001`
- **Password**: `1234567890`
- **Redirect**: `/headnursedashboard`

### พยาบาล
- **Email**: `test002`
- **Password**: `1234567890`
- **Redirect**: `/nursedashboard`

- **Email**: `nurse.test@hospital.com`
- **Password**: `123456`
- **Redirect**: `/nursedashboard`

## API Endpoints

### Authentication
```
POST /api/auth/register    # สมัครสมาชิก
POST /api/auth/signin      # เข้าสู่ระบบ
GET  /api/auth/info        # ดูข้อมูลผู้ใช้ (ต้อง login)
```

### Shift Management
```
POST /api/shifts                    # สร้างเวร (HEAD_NURSE เท่านั้น)
GET  /api/shifts/all               # ดูเวรทั้งหมด (HEAD_NURSE เท่านั้น)
GET  /api/shifts/my-shifts         # ดูเวรตัวเอง (NURSE)
POST /api/shift-assignments        # จัดเวรให้พยาบาล (HEAD_NURSE เท่านั้น)
POST /api/shifts/:id/request-leave # ขอลาจากเวร (NURSE)
```

### User Management
```
GET /api/nurses    # ดูรายชื่อพยาบาล (HEAD_NURSE เท่านั้น)
```

### Leave Requests
```
POST  /api/leave-requests           # ขอลาทั่วไป (NURSE)
GET   /api/leave-requests           # ดูคำขอลา (HEAD_NURSE=ทั้งหมด, NURSE=ตัวเอง)
PATCH /api/leave-requests/:id/approve # อนุมัติ (HEAD_NURSE เท่านั้น)
PATCH /api/leave-requests/:id/reject  # ปฏิเสธ (HEAD_NURSE เท่านั้น)
```

## Database Schema

### Users Table
- `id` - MongoDB ObjectId
- `email` - อีเมล (unique)
- `password` - รหัสผ่าน (hashed)
- `name` - ชื่อ-นามสกุล
- `role` - NURSE | HEAD_NURSE

### Shifts Table
- `id` - MongoDB ObjectId
- `name` - ชื่อเวร
- `date` - วันที่ทำงาน
- `startTime` - เวลาเริ่ม
- `endTime` - เวลาสิ้นสุด
- `department` - แผนก

### ShiftAssignments Table
- `id` - MongoDB ObjectId
- `userId` - ID ของพยาบาล
- `shiftId` - ID ของเวร
- `status` - assigned | LEAVE_REQUESTED | APPROVED_LEAVE

### LeaveRequests Table
- `id` - MongoDB ObjectId
- `userId` - ID ของผู้ขอลา
- `startDate` - วันที่เริ่มลา
- `endDate` - วันที่สิ้นสุดลา
- `reason` - เหตุผล
- `status` - PENDING | APPROVED | REJECTED

## Scripts
```bash
npm run dev        # รัน development server
npm run start      # รัน production server
npm run db:generate # Generate Prisma client
npm run db:push    # Push schema ไป database
```

## Security Features
- JWT Token Authentication
- Password Hashing (bcryptjs)
- Role-based Access Control
- CORS Protection
- Input Validation
