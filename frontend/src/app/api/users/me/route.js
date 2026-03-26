import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { apiError, fmt } from '@/lib/utils';
import bcrypt from 'bcryptjs';

// GET /api/users/me
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return apiError('Unauthorized', 401);

  try {
    const user = await prisma.user.findUnique({
      where:  { email: session.user.email },
      select: { id: true, name: true, email: true, phone: true, address: true, avatar: true, role: true, createdAt: true },
    });
    if (!user) return apiError('User not found', 404);
    return Response.json({ success: true, data: fmt(user) });
  } catch (err) {
    return apiError(err.message);
  }
}

// PUT /api/users/me
export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return apiError('Unauthorized', 401);

  try {
    const { name, phone, address, avatar, currentPassword, newPassword } = await request.json();

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return apiError('User not found', 404);

    const data = {};
    if (name    !== undefined) data.name    = name;
    if (phone   !== undefined) data.phone   = phone;
    if (address !== undefined) data.address = address;
    if (avatar  !== undefined) data.avatar  = avatar;

    if (newPassword) {
      if (!currentPassword) return apiError('กรุณากรอกรหัสผ่านเดิม', 400);
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) return apiError('รหัสผ่านเดิมไม่ถูกต้อง', 400);
      if (newPassword.length < 6) return apiError('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร', 400);
      data.password = await bcrypt.hash(newPassword, 10);
    }

    const updated = await prisma.user.update({
      where:  { email: session.user.email },
      data,
      select: { id: true, name: true, email: true, phone: true, address: true, avatar: true, role: true },
    });

    return Response.json({ success: true, data: fmt(updated) });
  } catch (err) {
    return apiError(err.message, 400);
  }
}
