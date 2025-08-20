import { Request, Response } from "express";
import { prisma } from "../server";

export const HeadNurseController = {
  // สร้างเวรใหม่และจัดเวรให้พยาบาลทันที
  create: async (req: Request, res: Response) => {
    try {
      console.log("Create shift request body:", req.body);

      const { nurseId, date, startTime, endTime, department } = req.body;

      // ตรวจสอบข้อมูลที่จำเป็น
      if (!nurseId || !date || !startTime || !endTime || !department) {
        return res.status(400).json({
          message: "กรุณากรอกข้อมูลให้ครบถ้วน",
          missing: {
            nurseId: !nurseId,
            date: !date,
            startTime: !startTime,
            endTime: !endTime,
            department: !department,
          },
        });
      }

      // สร้างเวรใหม่ในฐานข้อมูล
      const shift = await prisma.shift.create({
        data: {
          name: `เวร ${department}`,
          startTime,
          endTime,
          date: new Date(date),
          description: department,
        },
      });

      // จัดเวรให้พยาบาลที่เลือกทันที
      const assignment = await prisma.shiftAssignment.create({
        data: {
          userId: nurseId,
          shiftId: shift.id,
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          shift: true,
        },
      });

      res.json({
        message: "สร้างเวรและจัดเวรสำเร็จ",
        shift,
        assignment,
      });
    } catch (error) {
      console.error("Error creating shift:", error);
      res.status(500).json({
        message: "เกิดข้อผิดพลาด",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  // ดูเวรทั้งหมด (สำหรับหัวหน้าพยาบาล) 
  list: async (req: Request, res: Response) => {
    try {
      const shifts = await prisma.shift.findMany({
        include: {
          assignments: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { date: "asc" },
      });

      // แปลงข้อมูลให้ตรงกับที่ frontend 
      const formattedShifts = shifts.map((shift) => ({
        id: shift.id,
        date: shift.date,
        startTime: shift.startTime,
        endTime: shift.endTime,
        department: shift.description || shift.name,
        nurseId: shift.assignments[0]?.user?.id || null,
        nurseName: shift.assignments[0]?.user?.name || "ไม่ได้จัดเวร",
        status: shift.assignments[0]?.status || "assigned",
      }));

      console.log("Formatted shifts:", formattedShifts.length);
      res.json(formattedShifts);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  },

  // ดูเวรของตัวเอง (สำหรับพยาบาล)
  myShifts: async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      console.log("Fetching shifts for user ID:", userId);

      const assignments = await prisma.shiftAssignment.findMany({
        where: { userId },
        include: {
          shift: {
            select: {
              id: true,
              date: true,
              startTime: true,
              endTime: true,
              description: true,
              name: true,
            },
          },
        },
        orderBy: { shift: { date: "asc" } },
      });

      console.log("Found assignments:", assignments.length);

      const schedule = assignments.map((a) => ({
        id: a.shift.id,
        date: a.shift.date,
        startTime: a.shift.startTime,
        endTime: a.shift.endTime,
        department: a.shift.description || a.shift.name || "ไม่ระบุ",
        status: a.status || "assigned",
      }));

      console.log("Formatted schedule:", schedule);

      // ส่งในรูปแบบที่ frontend คาดหวัง
      res.json({ schedule });
    } catch (error) {
      console.error("Error fetching my shifts:", error);
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  },

  // ขอลาจากเวรเฉพาะ (สำหรับพยาบาล)
  requestLeave: async (req: any, res: Response) => {
    try {
      const { shiftId } = req.params;
      const userId = req.user.id;
      const assignment = await prisma.shiftAssignment.findFirst({
        where: { shiftId, userId },
      });
      if (!assignment) {
        return res.status(404).json({ message: "ไม่พบการมอบหมายเวร" });
      }
      await prisma.shiftAssignment.update({
        where: { id: assignment.id },
        data: { status: "LEAVE_REQUESTED" },
      });
      res.json({ message: "ส่งคำขอลาสำเร็จ" });
    } catch (error) {
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  },

  // จัดเวรให้พยาบาล (แยกจากการสร้างเวร)
  assign: async (req: Request, res: Response) => {
    try {
      const { userId, shiftId } = req.body;
      const assignment = await prisma.shiftAssignment.create({
        data: { userId, shiftId },
        include: {
          user: { select: { id: true, name: true, email: true } },
          shift: true,
        },
      });
      res.json({ message: "จัดเวรสำเร็จ", assignment });
    } catch (error) {
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  },
};
