import { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

// Middleware สำหรับตรวจสอบบทบาท HEAD_NURSE
export const isHeadNurse = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // ตรวจสอบว่า req.user มีค่าและมี role
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "ไม่มีข้อมูลผู้ใช้หรือบทบาท" });
    }

    // แปลง role เป็น uppercase เพื่อให้สอดคล้องกับ database
    const userRole = req.user.role.toUpperCase();
    if (userRole !== "HEAD_NURSE") {
      return res.status(403).json({ message: "ไม่มีสิทธิ์เข้าถึง: ต้องเป็น HEAD_NURSE" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์" });
  }
};

// Middleware ทั่วไปสำหรับตรวจสอบบทบาทหลายแบบ (ถ้าต้องการใช้ในอนาคต)
export const checkRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(403).json({ message: "ไม่มีข้อมูลผู้ใช้หรือบทบาท" });
      }

      const userRole = req.user.role.toUpperCase();
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: `ไม่มีสิทธิ์เข้าถึง: ต้องเป็น ${allowedRoles.join(" หรือ ")}` });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์" });
    }
  };
};