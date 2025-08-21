// ===== IMPORTS =====
import express, { Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "./generated/prisma";
import { UserController } from "./controller/UserController";
import { HeadNurseController } from "./controller/HeadNurseController";
import { NurseController } from "./controller/NurseController";
import { LeaveController } from "./controller/LeaveController";
import { auth } from "./controller/middleware"; // ตรวจสอบ JWT Token
import { isHeadNurse } from "./controller/middleware"; // ตรวจสอบสิทธิ์หัวหน้าพยาบาล

// config env
dotenv.config(); // โหลดตัวแปรจาก .env file

const app = express();
const prisma = new PrismaClient(); // เชื่อมต่อฐานข้อมูล MongoDB
const port = process.env.PORT || 3001; // พอร์ตที่ server จะรัน

// ===== MIDDLEWARE =====
// อนุญาตให้ Frontend เรียก API ข้าม domain
app.use(
  cors({
    origin: [
      "http://localhost:3000", 
      "http://127.0.0.1:3000",
      "https://frontend-nursing-shift-management.vercel.app",
      "https://*.vercel.app" // อนุญาต Vercel domains
    ], 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json()); // แปลง JSON request body

// AUTH ROUTES (การล็อกอิน/สมัครสมาชิก)
app.post("/api/auth/register", UserController.register); // สมัครสมาชิก
app.post("/api/auth/signin", UserController.signIn); // เข้าสู่ระบบ
app.get("/api/auth/info", auth, UserController.info); // ดูข้อมูลผู้ใช้ (ต้อง login)

// =SHIFT ROUTES (การจัดการเวร)
app.post("/api/shifts", auth, isHeadNurse, HeadNurseController.create); // สร้างเวร (หัวหน้าเท่านั้น)
app.get("/api/shifts/all", auth, isHeadNurse, HeadNurseController.list); // ดูเวรทั้งหมด (หัวหน้าเท่านั้น)
app.get("/api/shifts/my-shifts", auth, HeadNurseController.myShifts); // ดูเวรตัวเอง (พยาบาล)
app.post("/api/shift-assignments",auth,isHeadNurse,HeadNurseController.assign); // จัดเวรให้พยาบาล (หัวหน้าเท่านั้น)
app.post("/api/shifts/:shiftId/request-leave", auth,HeadNurseController.requestLeave); // ขอลาจากเวร (พยาบาล)

//NURSE ROUTES (การจัดการพยาบาล)
app.get("/api/nurses", auth, isHeadNurse, NurseController.list); // ดูรายชื่อพยาบาล (หัวหน้าเท่านั้น)

//LEAVE ROUTES (การจัดการคำขอลา)
app.post("/api/leave-requests", auth, LeaveController.create); // ขอลาทั่วไป (พยาบาล)
app.get("/api/leave-requests", auth, LeaveController.list); // ดูคำขอลา (หัวหน้า=ทั้งหมด, พยาบาล=ตัวเอง)
app.patch("/api/leave-requests/:id/approve", auth, isHeadNurse,LeaveController.approve); // อนุมัติคำขอลา (หัวหน้าเท่านั้น)
app.patch("/api/leave-requests/:id/reject",auth,isHeadNurse,LeaveController.reject); // ปฏิเสธคำขอลา (หัวหน้าเท่านั้น)

// SHIFT LEAVE ROUTES (การขอลาจากเวรเฉพาะ)
app.patch("/api/shift-leave/:id/approve",auth,isHeadNurse,LeaveController.approveShiftLeave); // อนุมัติการขอลาจากเวร
app.patch("/api/shift-leave/:id/reject",auth,isHeadNurse,LeaveController.rejectShiftLeave); // ปฏิเสธการขอลาจากเวร

// Check
app.get("/", (req, res) => {
  res.json({ message: "Nurse Scheduling API is running!" }); // ตรวจสอบว่า server ทำงาน
});

// Debug: ตรวจสอบข้อมูลผู้ใช้และสิทธิ์
app.get("/api/debug/user", auth, (req: any, res: Response) => {
  res.json({
    user: req.user,
    isHeadNurse: req.user?.role?.toUpperCase() === "HEAD_NURSE",
    timestamp: new Date().toISOString(),
  });
});

// Debug: ทดสอบ API พยาบาลโดยไม่ตรวจสอบสิทธิ์
app.get("/api/debug/nurses", auth, async (req: any, res: Response) => {
  try {
    const nurses = await prisma.user.findMany({
      where: { role: "NURSE" },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json({
      user: req.user,
      nursesCount: nurses.length,
      nurses: nurses,
    });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

//START SERVER
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export { prisma }; // ส่งออก prisma เพื่อใช้ใน controllers
export default app; // Export app สำหรับ Vercel