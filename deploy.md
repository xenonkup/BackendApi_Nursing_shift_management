# คู่มือการ Deploy Backend API ไปยัง Vercel

## 1. ติดตั้ง Vercel CLI
```bash
npm install -g vercel
```

## 2. Login เข้า Vercel
```bash
vercel login
```

## 3. Deploy Backend API
```bash
# ใน folder backend
vercel --prod
```

## 4. ตั้งค่า Environment Variables บน Vercel Dashboard

ไปที่ Vercel Dashboard > Project Settings > Environment Variables

เพิ่มตัวแปรต่อไปนี้:

### Production Environment Variables:
```
DATABASE_URL = mongodb+srv://korakot:jornjalee@cluster0.cth0v5k.mongodb.net/db_mediact?retryWrites=true&w=majority
SECRET_KEY = token
NODE_ENV = production
```

## 5. การตั้งค่าสำหรับ Frontend

ใน Frontend ให้เปลี่ยน API Base URL เป็น:

### Development (.env.local):
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Production (.env.production):
```
NEXT_PUBLIC_API_URL=https://your-backend-app.vercel.app
```

## 6. ตัวอย่างการเรียก API ใน Frontend

```javascript
// utils/api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // เพิ่ม Authorization header ถ้ามี token
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, config);
  return response.json();
};

// ตัวอย่างการใช้งาน
export const loginUser = async (email, password) => {
  return apiCall('/api/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const getShifts = async () => {
  return apiCall('/api/shifts/my-shifts');
};
```

## 7. ตรวจสอบการทำงาน

### API Endpoints ที่สามารถทดสอบได้:
- `GET /` - ตรวจสอบสถานะ API
- `POST /api/auth/signin` - เข้าสู่ระบบ
- `GET /api/auth/info` - ข้อมูลผู้ใช้ (ต้อง login)
- `GET /api/shifts/my-shifts` - ดูเวรของตัวเอง

### ข้อมูลทดสอบ:
**หัวหน้าพยาบาล:**
- Email: `test001`
- Password: `1234567890`

**พยาบาล:**
- Email: `test002`
- Password: `1234567890`

## 8. การแก้ไขปัญหาที่พบบ่อย

### ปัญหา CORS:
- ตรวจสอบว่าได้เพิ่ม Frontend URL ใน CORS configuration แล้ว
- ตรวจสอบว่า Frontend ส่ง credentials: true

### ปัญหา Database:
- ตรวจสอบ DATABASE_URL ใน Vercel Environment Variables
- ตรวจสอบว่า MongoDB Atlas อนุญาต IP Address ของ Vercel

### ปัญหา Authentication:
- ตรวจสอบ SECRET_KEY ใน Environment Variables
- ตรวจสอบการส่ง Authorization header ใน Frontend