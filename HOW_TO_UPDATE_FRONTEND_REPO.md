# 🔄 วิธีอัปเดต Frontend Repository

## 📋 ไฟล์ที่ได้รับการเปลี่ยนแปลง/เพิ่มใหม่:

### ✅ ไฟล์ที่แก้ไข:
1. `app/api/port/config.ts` - เพิ่ม environment variable support
2. `app/signin/page.tsx` - ใช้ API utility ใหม่
3. `app/headnursedashboard/page.tsx` - API integration
4. `app/nursedashboard/page.tsx` - API integration

### 📁 ไฟล์ใหม่ที่เพิ่ม:
1. `app/utils/api.ts` - API utility สำหรับจัดการ HTTP requests
2. `vercel.json` - Vercel deployment configuration
3. `DEPLOYMENT_FRONTEND.md` - คู่มือการ deploy
4. `.env.local` - Environment variables สำหรับ development
5. `.env.production` - Environment variables สำหรับ production
6. `.env.example` - Template สำหรับ environment variables

## 🚀 วิธีการอัปเดต Repository:

### วิธีที่ 1: Manual Update (แนะนำ)

1. **Download ไฟล์ที่เปลี่ยนแปลง:**
   - ไปที่ repository: https://github.com/xenonkup/Frontend_Nursing_shift_management
   - Clone หรือ pull repository ล่าสุด

2. **เพิ่มไฟล์ใหม่เหล่านี้:**

**📄 สร้างไฟล์ `app/utils/api.ts`:**
```typescript
import axios, { AxiosResponse } from 'axios';
import { config } from '../api/port/config';

// Create axios instance with default configuration
const apiClient = axios.create({
    baseURL: config.apiUrl,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        if (typeof window !== 'undefined') {
            const user = localStorage.getItem('user');
            if (user) {
                try {
                    const userData = JSON.parse(user);
                    if (userData.token) {
                        config.headers.Authorization = \`Bearer \${userData.token}\`;
                    }
                } catch (error) {
                    console.error('Error parsing user data:', error);
                }
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid, redirect to login
            if (typeof window !== 'undefined') {
                localStorage.removeItem('user');
                window.location.href = '/signin';
            }
        }
        return Promise.reject(error);
    }
);

// API methods
export const api = {
    // Authentication
    signin: (email: string, password: string) => 
        apiClient.post('/auth/signin', { email, password }),
    
    register: (name: string, email: string, password: string, role: string = 'NURSE') => 
        apiClient.post('/auth/register', { name, email, password, role }),
    
    getUserInfo: () => 
        apiClient.get('/auth/info'),

    // Shifts
    getMyShifts: () => 
        apiClient.get('/shifts/my-shifts'),
    
    getAllShifts: () => 
        apiClient.get('/shifts/all'),
    
    createShift: (shiftData: object) => 
        apiClient.post('/shifts', shiftData),
    
    assignShift: (assignmentData: object) => 
        apiClient.post('/shift-assignments', assignmentData),
    
    requestLeave: (shiftId: string) => 
        apiClient.post(\`/shifts/\${shiftId}/request-leave\`),

    // Nurses
    getNurses: () => 
        apiClient.get('/nurses'),

    // Leave Requests
    createLeaveRequest: (leaveData: object) => 
        apiClient.post('/leave-requests', leaveData),
    
    getLeaveRequests: () => 
        apiClient.get('/leave-requests'),
    
    approveLeaveRequest: (id: string) => 
        apiClient.patch(\`/leave-requests/\${id}/approve\`),
    
    rejectLeaveRequest: (id: string) => 
        apiClient.patch(\`/leave-requests/\${id}/reject\`),
    
    approveShiftLeave: (id: string) => 
        apiClient.patch(\`/shift-leave/\${id}/approve\`),
    
    rejectShiftLeave: (id: string) => 
        apiClient.patch(\`/shift-leave/\${id}/reject\`),

    // Debug endpoints
    debugUser: () => 
        apiClient.get('/debug/user'),
    
    debugNurses: () => 
        apiClient.get('/debug/nurses'),
};

export default apiClient;
```

**📄 สร้างไฟล์ `vercel.json`:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["sin1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "@next_public_api_url",
    "NEXT_PUBLIC_API_BASE_URL": "@next_public_api_base_url"
  }
}
```

**📄 สร้างไฟล์ `.env.local`:**
```env
# Environment Variables for Frontend Development
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api

# For local development, connect to Backend on port 3001
```

**📄 สร้างไฟล์ `.env.production`:**
```env
# Environment Variables for Frontend Production
NEXT_PUBLIC_API_URL=https://backend-nursing-shift-management.vercel.app
NEXT_PUBLIC_API_BASE_URL=https://backend-nursing-shift-management.vercel.app/api

# For production, connect to Backend deployed on Vercel
# Replace with your actual Backend Vercel URL
```

**📄 สร้างไฟล์ `.env.example`:**
```env
# Environment Variables Template for Frontend

# API URLs for connecting to Backend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api

# Production URLs (update after deploying Backend)
# NEXT_PUBLIC_API_URL=https://your-backend-app.vercel.app
# NEXT_PUBLIC_API_BASE_URL=https://your-backend-app.vercel.app/api

# Instructions:
# 1. For local development, copy this to .env.local
# 2. For production, update URLs in Vercel dashboard
# 3. Make sure Backend is deployed first to get the correct URLs
```

3. **แก้ไขไฟล์เดิม:**

**🔧 อัปเดต `app/api/port/config.ts`:**
```typescript
// API Configuration with Environment Variable support
export const config = {
    // Use environment variable if available, fallback to localhost for development
    apiUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
}

// กำหนด URL ของ Backend API ที่รองรับทั้ง development และ production
```

4. **อัปเดตไฟล์ component:**
   - ใน `app/signin/page.tsx`, `app/headnursedashboard/page.tsx`, `app/nursedashboard/page.tsx`
   - เพิ่ม import: `import { api } from "../utils/api";`
   - เปลี่ยนจาก `axios.post()` เป็น `api.signin()`, `api.getAllShifts()` เป็นต้น

5. **Commit และ Push:**
```bash
git add .
git commit -m "🚀 Complete Frontend integration with Backend API - Added API utility, environment variables, and Vercel deployment configuration"
git push origin main
```

## 🎯 ผลลัพธ์ที่จะได้:

✅ **API Integration:** ระบบจัดการ API ที่ครบถ้วน  
✅ **Environment Variables:** รองรับทั้ง development และ production  
✅ **Authentication:** JWT token management อัตโนมัติ  
✅ **Error Handling:** จัดการ error และ redirect อัตโนมัติ  
✅ **Vercel Ready:** พร้อม deploy ไปยัง Vercel  
✅ **Type Safety:** TypeScript support เต็มรูปแบบ  

## 🔗 หลังจากอัปเดตแล้ว:

Repository จะมีไฟล์ครบถ้วนสำหรับ:
- 🌐 Deploy ไปยัง Vercel
- 🔗 เชื่อมต่อกับ Backend API
- 🔐 Authentication system
- 📱 Responsive UI
- 🚀 Production ready