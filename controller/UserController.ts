import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../server";

export const UserController = {
  // เข้าสู่ระบบ
  signIn: async (req: Request, res: Response) => {
    try {
      console.log("Full request body:", req.body);
      console.log("Request headers:", req.headers["content-type"]);

      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "ไม่มีข้อมูลในคำขอ" });
      }

      const { email, password, username, login } = req.body;
      const userEmail = email || username || login;

      console.log("Login attempt:", {
        email: userEmail,
        password: password ? "***" : "missing",
      });

      if (!userEmail || !password) {
        return res.status(400).json({ message: "กรุณากรอก email และ password" });
      }

      const user = await prisma.user.findFirst({
        where: { email: userEmail },
        select: { id: true, email: true, password: true, name: true, role: true },
      });

      console.log("User found:", user ? "Yes" : "No");

      if (!user) {
        return res.status(401).json({ message: "ไม่พบผู้ใช้" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      console.log("Password valid:", isValid);

      if (!isValid) {
        return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.SECRET_KEY!,
        { expiresIn: "7d" }
      );

      // ส่ง token และข้อมูลผู้ใช้กลับไป
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        redirect: user.role === "NURSE" ? "/nursedashboard" : "/headnursedashboard", // แนะนำเส้นทางไปหน้า backend
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        message: "เกิดข้อผิดพลาด",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // สมัครสมาชิก
  register: async (req: Request, res: Response) => {
    try {
      console.log("Full register body:", req.body);

      const { email, password, name, role, username } = req.body;
      const userEmail = email || username;

      console.log("Register attempt:", { email: userEmail, name, role });

      if (!userEmail || !password || !name) {
        return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
      }

      const existingUser = await prisma.user.findFirst({
        where: { email: userEmail },
      });

      if (existingUser) {
        return res.status(400).json({ message: "มี email นี้ในระบบแล้ว" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email: userEmail,
          password: hashedPassword,
          name,
          role: (role || "NURSE").toUpperCase(),
        },
        select: { id: true, email: true, name: true, role: true },
      });

      console.log("User created:", user);
      res.json({ message: "สมัครสมาชิกสำเร็จ", user });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({
        message: "เกิดข้อผิดพลาด",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // ดูข้อมูลผู้ใช้
  info: async (req: Request, res: Response) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: (req as any).user.id },
        select: { id: true, name: true, email: true, role: true },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ user });
    } catch (error) {
      console.error("Info error:", error);
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  },

  // ตรวจสอบบทบาท
  checkRole: (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const userRole = (req as any).user?.role;
      if (!userRole || !roles.includes(userRole)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      next();
    };
  },
};

// ส่งบทบาท ให้ตรงกับ หน้าบ้าน และ หลังบ้าน
export type UserRole = "nurse" | "head_nurse" | "NURSE" | "HEAD_NURSE";