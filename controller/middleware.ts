import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// ===== MIDDLEWARE: ตรวจสอบ JWT Token =====
export const auth = (req: any, res: Response, next: NextFunction) => {
  try {
    // ดึง token จาก Authorization header (Bearer token)
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: "ไม่พบ Token" });
    }
    
    // ตรวจสอบและถอดรหัส token
    const decoded = jwt.verify(token, process.env.SECRET_KEY!) as any;
    req.user = decoded; // เก็บข้อมูลผู้ใช้ใน request
    console.log('Authenticated user:', { id: decoded.id, email: decoded.email, role: decoded.role });
    next(); // ผ่านไปขั้นตอนต่อไป
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: "Token ไม่ถูกต้อง" });
  }
};

// ===== MIDDLEWARE: ตรวจสอบสิทธิ์หัวหน้าพยาบาล =====
export const isHeadNurse = (req: any, res: Response, next: NextFunction) => {
  try {
    console.log('Checking HEAD_NURSE permission for user:', req.user);
    
    // ตรวจสอบว่ามีข้อมูลผู้ใช้และ role
    if (!req.user || !req.user.role) {
      console.log('No user or role found');
      return res.status(403).json({ message: "ไม่มีข้อมูลผู้ใช้หรือบทบาท" });
    }

    // แปลง role เป็น uppercase เพื่อเปรียบเทียบ
    const userRole = req.user.role.toUpperCase();
    console.log('User role (uppercase):', userRole);
    
    // ตรวจสอบว่าเป็น HEAD_NURSE หรือไม่
    if (userRole !== "HEAD_NURSE") {
      console.log('Access denied: not HEAD_NURSE');
      return res.status(403).json({ 
        message: "ไม่มีสิทธิ์เข้าถึง: ต้องเป็น HEAD_NURSE",
        currentRole: userRole 
      });
    }

    console.log('HEAD_NURSE permission granted');
    next(); // อนุญาตให้เข้าถึงได้
  } catch (error) {
    console.error('Role check error:', error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์" });
  }
};