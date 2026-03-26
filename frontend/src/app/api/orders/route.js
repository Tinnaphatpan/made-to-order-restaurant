import { prisma } from '@/lib/prisma';
import { apiError, fmt, generateOrderNumber } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// GET /api/orders?status=pending&table=1&mine=true
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const where = {};

    if (searchParams.get('status')) where.status      = searchParams.get('status');
    if (searchParams.get('table'))  where.tableNumber = searchParams.get('table');

    if (searchParams.get('mine') === 'true') {
      const session = await getServerSession(authOptions);
      if (session?.user?.id && session.user.id !== 'admin') {
        where.userId = session.user.id;
      }
    }

    const orders = await prisma.order.findMany({ where, orderBy: { createdAt: 'desc' } });
    return Response.json({ success: true, data: fmt(orders) });
  } catch (err) {
    return apiError(err.message);
  }
}

// POST /api/orders
export async function POST(request) {
  try {
    const body = await request.json();

    // Validate
    if (!body.items?.length)        return apiError('ไม่มีรายการอาหาร', 400);
    if (!body.customerName?.trim()) return apiError('กรุณากรอกชื่อผู้สั่ง', 400);

    // Sanitize phone — เก็บเฉพาะตัวเลข ไม่เกิน 10 หลัก
    if (body.customerPhone) {
      body.customerPhone = body.customerPhone.replace(/\D/g, '').slice(0, 10);
    }

    const session = await getServerSession(authOptions);
    let userId = null;
    if (session?.user?.id && session.user.id !== 'admin') {
      const exists = await prisma.user.findUnique({ where: { id: session.user.id } });
      userId = exists ? session.user.id : null;
    }

    const totalPrice  = body.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = body.deliveryFee || 0;
    const grandTotal  = totalPrice + deliveryFee;

    const count       = await prisma.order.count();
    const orderNumber = generateOrderNumber(count + 1);

    const timeline = [{ status: 'pending', message: 'รับออเดอร์แล้ว', timestamp: new Date().toISOString() }];

    const order = await prisma.order.create({
      data: {
        ...body,
        userId,
        totalPrice,
        deliveryFee,
        grandTotal,
        orderNumber,
        timeline,
      },
    });

    return Response.json({ success: true, data: fmt(order) }, { status: 201 });
  } catch (err) {
    return apiError(err.message, 400);
  }
}
