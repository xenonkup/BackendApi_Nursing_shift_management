# 📚 คำสั่งสำหรับ Upload โค้ดไปยัง GitHub

## 🔧 Backend Repository

```bash
# 1. สร้าง repository ใหม่สำหรับ Backend
cd /workspace

# 2. ลบ Frontend directory ออกจาก Backend repo (ถ้ามี)
rm -rf Frontend_Nursing_shift_management

# 3. เพิ่มไฟล์ทั้งหมดใน Backend
git add .
git commit -m "Complete Backend API setup with Vercel deployment configuration"

# 4. เพิ่ม remote repository (เปลี่ยน URL เป็นของคุณ)
git remote add origin https://github.com/YOUR_USERNAME/Backend-Nursing-Shift-Management.git

# 5. Push ไปยัง GitHub
git push -u origin main
```

## 🌐 Frontend Repository

```bash
# 1. เข้าไปใน Frontend directory
cd /workspace/Frontend_Nursing_shift_management

# 2. Initialize Git (ถ้ายังไม่มี)
git init

# 3. เพิ่มไฟล์ทั้งหมด
git add .

# 4. Commit
git commit -m "Complete Frontend setup with API integration and Vercel deployment"

# 5. เพิ่ม remote repository (เปลี่ยน URL เป็นของคุณ)
git remote add origin https://github.com/YOUR_USERNAME/Frontend-Nursing-Shift-Management.git

# 6. สร้าง main branch และ push
git branch -M main
git push -u origin main
```

## 📋 ไฟล์สำคัญที่ควรมีใน Repository

### Backend Repository:
- ✅ `server.ts` - Main server file
- ✅ `package.json` - Dependencies และ scripts
- ✅ `prisma/schema.prisma` - Database schema
- ✅ `controller/` - API controllers
- ✅ `vercel.json` - Vercel configuration
- ✅ `api/index.ts` - Vercel entry point
- ✅ `.env.example` - Environment variables template
- ✅ `DEPLOYMENT.md` - Deployment guide

### Frontend Repository:
- ✅ `app/` - Next.js app directory
- ✅ `package.json` - Dependencies และ scripts
- ✅ `vercel.json` - Vercel configuration
- ✅ `app/utils/api.ts` - API utility
- ✅ `app/api/port/config.ts` - API configuration
- ✅ `.env.local` - Local environment variables
- ✅ `.env.production` - Production environment variables
- ✅ `DEPLOYMENT_FRONTEND.md` - Frontend deployment guide

## 🔗 หลังจาก Upload แล้ว

1. **Deploy Backend ไปยัง Vercel:**
   - ไปที่ [Vercel Dashboard](https://vercel.com/dashboard)
   - คลิก "New Project"
   - เลือก Backend repository
   - ตั้งค่า Environment Variables ตามที่ระบุใน `DEPLOYMENT.md`

2. **Deploy Frontend ไปยัง Vercel:**
   - สร้าง project ใหม่สำหรับ Frontend
   - เลือก Frontend repository
   - ตั้งค่า Environment Variables โดยใช้ Backend URL ที่ได้จากขั้นตอนก่อนหน้า

3. **อัปเดต Frontend Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL = https://your-backend-app.vercel.app
   NEXT_PUBLIC_API_BASE_URL = https://your-backend-app.vercel.app/api
   ```

## 🎯 ตัวอย่าง Repository Names:
- Backend: `Backend-Nursing-Shift-Management`
- Frontend: `Frontend-Nursing-Shift-Management`

## 📞 ข้อมูลติดต่อ:
หากมีปัญหาในการ deploy สามารถตรวจสอบได้จาก:
- Vercel deployment logs
- Browser developer console
- Network tab สำหรับ API calls