import { prisma } from '@/lib/prisma';
import { apiError, fmt } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { autoProgressOrders } from '@/lib/autoProgress';

const ORDER_STATUS_LABELS = {
  pending:    { label: 'รอยืนยัน' },
  confirmed:  { label: 'ยืนยันแล้ว' },
  preparing:  { label: 'กำลังทำ' },
  ready:      { label: 'พร้อมเสิร์ฟ' },
  delivering: { label: 'กำลังจัดส่ง' },
  completed:  { label: 'เสร็จสิ้น' },
  cancelled:  { label: 'ยกเลิก' },
};

export async function GET(_, { params }) {
  try {
    await autoProgressOrders();
    const order = await prisma.order.findUnique({ where: { id: params.id } });
    if (!order) return apiError('Order not found', 404);
    return Response.json({ success: true, data: fmt(order) });
  } catch (err) {
    return apiError(err.message);
  }
}

// PUT — admin เท่านั้น
export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') {
    return apiError('ไม่มีสิทธิ์เปลี่ยนสถานะออเดอร์', 403);
  }

  try {
    const body  = await request.json();
    const order = await prisma.order.findUnique({ where: { id: params.id } });
    if (!order) return apiError('Order not found', 404);

    const data = { ...body };
    delete data.timeline;
    delete data.orderNumber;
    delete data.id;
    delete data._id;

    // เพิ่ม timeline entry ถ้าสถานะเปลี่ยน
    if (body.status && body.status !== order.status) {
      const info = ORDER_STATUS_LABELS[body.status];
      const currentTimeline = Array.isArray(order.timeline) ? order.timeline : [];
      data.timeline = [
        ...currentTimeline,
        {
          status:    body.status,
          message:   body.timelineMessage || info?.label || body.status,
          timestamp: new Date().toISOString(),
        },
      ];
    }

    const updated = await prisma.order.update({ where: { id: params.id }, data });
    return Response.json({ success: true, data: fmt(updated) });
  } catch (err) {
    return apiError(err.message, 400);
  }
}

// DELETE — admin เท่านั้น
export async function DELETE(_, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') {
    return apiError('ไม่มีสิทธิ์ลบออเดอร์', 403);
  }

  try {
    await prisma.order.delete({ where: { id: params.id } });
    return Response.json({ success: true, message: 'Order deleted' });
  } catch (err) {
    if (err.code === 'P2025') return apiError('Order not found', 404);
    return apiError(err.message);
  }
}
