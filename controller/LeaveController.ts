import { Response } from "express";
import { prisma } from "../server";

export const LeaveController = {
  // สร้างคำขอลาทั่วไป (ไม่ใช่จากเวรเฉพาะ)
  create: async (req: any, res: Response) => {
    try {
      const { startDate, endDate, reason } = req.body;
      const userId = req.user.id;

      const leaveRequest = await prisma.leaveRequest.create({
        data: {
          userId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          reason,
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      });

      res.json({ message: "ส่งคำขอลาสำเร็จ", leaveRequest });
    } catch (error) {
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  },

  // ดูคำขอลาทั้งหมด (รวมทั้งจากเวรและทั่วไป)
  list: async (req: any, res: Response) => {
    try {
      const { role, id: userId } = req.user;
      console.log("Fetching leave requests for user:", { role, userId });

      // ดึงคำขอลาทั่วไป (จาก LeaveRequest table)
      const where = role === "HEAD_NURSE" ? {} : { userId };
      const generalLeaveRequests = await prisma.leaveRequest.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      // ดึงคำขอลาจากเวร (จาก ShiftAssignment table)
      const shiftLeaveRequests = await prisma.shiftAssignment.findMany({
        where: {
          status: "LEAVE_REQUESTED",
          ...(role !== "HEAD_NURSE" && { userId }),
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
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
        orderBy: { updatedAt: "desc" },
      });

      // แปลงข้อมูลการขอลาจากเวรให้ตรงกับรูปแบบที่ frontend
      const formattedShiftLeaveRequests = shiftLeaveRequests.map(
        (assignment) => ({
          id: assignment.id,
          shiftId: assignment.shift.id,
          nurseId: assignment.user.id,
          nurseName: assignment.user.name,
          date: assignment.shift.date,
          startTime: assignment.shift.startTime,
          endTime: assignment.shift.endTime,
          department: assignment.shift.description || assignment.shift.name,
          status: "pending", // แปลง LEAVE_REQUESTED เป็น pending
          requestedAt: assignment.updatedAt,
          type: "shift_leave", // ระบุประเภทการขอลา
        })
      );

      // แปลงข้อมูลการขอลาทั่วไป
      const formattedGeneralLeaveRequests = generalLeaveRequests.map(
        (request) => ({
          id: request.id,
          nurseId: request.user.id,
          nurseName: request.user.name,
          startDate: request.startDate,
          endDate: request.endDate,
          reason: request.reason,
          status: request.status.toLowerCase(),
          requestedAt: request.createdAt,
          type: "general_leave", // ระบุประเภทการขอลา
        })
      );

      // รวมข้อมูลทั้งสองแบบ
      const allLeaveRequests = [
        ...formattedShiftLeaveRequests,
        ...formattedGeneralLeaveRequests,
      ].sort(
        (a, b) =>
          new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
      );

      console.log("Found leave requests:", {
        shiftLeave: formattedShiftLeaveRequests.length,
        generalLeave: formattedGeneralLeaveRequests.length,
        total: allLeaveRequests.length,
      });

      res.json(allLeaveRequests);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  },

  // อนุมัติคำขอลา (ตรวจสอบประเภทอัตโนมัติ)
  approve: async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const approvedBy = req.user.id;

      console.log("Approving leave request ID:", id);

      // ลองหาใน ShiftAssignment ก่อน
      const shiftAssignment = await prisma.shiftAssignment.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, name: true, email: true } },
          shift: true,
        },
      });

      if (shiftAssignment) {
        // เป็นการขอลาจากเวร
        const updatedAssignment = await prisma.shiftAssignment.update({
          where: { id },
          data: { status: "APPROVED_LEAVE" },
          include: {
            user: { select: { id: true, name: true, email: true } },
            shift: true,
          },
        });
        res.json({
          message: "อนุมัติการขอลาจากเวรสำเร็จ",
          assignment: updatedAssignment,
        });
      } else {
        // เป็นการขอลาทั่วไป
        const leaveRequest = await prisma.leaveRequest.update({
          where: { id },
          data: {
            status: "APPROVED",
            approvedBy: approvedBy,
            approvedAt: new Date(),
          },
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        });
        res.json({ message: "อนุมัติคำขอลาสำเร็จ", leaveRequest });
      }
    } catch (error) {
      console.error("Error approving leave:", error);
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  },

  // ปฏิเสธคำขอลา (ตรวจสอบประเภทอัตโนมัติ)
  reject: async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const approvedBy = req.user.id;

      console.log("Rejecting leave request ID:", id);

      // ลองหาใน ShiftAssignment ก่อน
      const shiftAssignment = await prisma.shiftAssignment.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, name: true, email: true } },
          shift: true,
        },
      });

      if (shiftAssignment) {
        // เป็นการขอลาจากเวร
        const updatedAssignment = await prisma.shiftAssignment.update({
          where: { id },
          data: { status: "ASSIGNED" }, // กลับไปเป็น assigned
          include: {
            user: { select: { id: true, name: true, email: true } },
            shift: true,
          },
        });
        res.json({
          message: "ปฏิเสธการขอลาจากเวรสำเร็จ",
          assignment: updatedAssignment,
        });
      } else {
        // เป็นการขอลาทั่วไป
        const leaveRequest = await prisma.leaveRequest.update({
          where: { id },
          data: {
            status: "REJECTED",
            approvedBy: approvedBy,
            approvedAt: new Date(),
          },
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        });
        res.json({ message: "ปฏิเสธคำขอลาสำเร็จ", leaveRequest });
      }
    } catch (error) {
      console.error("Error rejecting leave:", error);
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  },

  // อนุมัติการขอลาจากเวร
  approveShiftLeave: async (req: any, res: Response) => {
    try {
      const { id } = req.params; // ShiftAssignment ID

      const assignment = await prisma.shiftAssignment.update({
        where: { id },
        data: { status: "APPROVED_LEAVE" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          shift: true,
        },
      });

      res.json({ message: "อนุมัติการขอลาจากเวรสำเร็จ", assignment });
    } catch (error) {
      console.error("Error approving shift leave:", error);
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  },

  // ปฏิเสธการขอลาจากเวร
  rejectShiftLeave: async (req: any, res: Response) => {
    try {
      const { id } = req.params; // ShiftAssignment ID

      const assignment = await prisma.shiftAssignment.update({
        where: { id },
        data: { status: "ASSIGNED" }, // กลับไปเป็น assigned
        include: {
          user: { select: { id: true, name: true, email: true } },
          shift: true,
        },
      });

      res.json({ message: "ปฏิเสธการขอลาจากเวรสำเร็จ", assignment });
    } catch (error) {
      console.error("Error rejecting shift leave:", error);
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  },
};