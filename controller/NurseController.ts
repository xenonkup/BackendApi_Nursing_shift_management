import { Request, Response } from 'express';
import { prisma } from '../server';

export const NurseController = {
  // ดูรายชื่อพยาบาลทั้งหมด
  list: async (req: Request, res: Response) => {
    try {
      const nurses = await prisma.user.findMany({
        where: { role: 'NURSE' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        },
        orderBy: { name: 'asc' }
      });
      
      console.log('Found nurses:', nurses.length);
      
      // ส่งข้อมูลในรูปแบบที่ frontend คาดหวัง
      res.json(nurses);
    } catch (error) {
      console.error('Error fetching nurses:', error);
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  }
};