import { prisma } from '@/lib/prisma';
import { apiError } from '@/lib/utils';
import bcrypt from 'bcryptjs';

// POST /api/auth/register
export async function POST(request) {
  try {
    const { name, email, password, phone } = await request.json();

    if (!name || !email || !password) {
      return apiError('กรุณากรอกข้อมูลให้ครบ', 400);
    }
    if (password.length < 6) {
      return apiError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', 400);
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return apiError('อีเมลนี้ถูกใช้งานแล้ว', 409);
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email: email.toLowerCase(), password: hashed, phone: phone || '' },
    });

    return Response.json(
      { success: true, data: { id: user.id, name: user.name, email: user.email } },
      { status: 201 }
    );
  } catch (err) {
    return apiError(err.message, 400);
  }
}
