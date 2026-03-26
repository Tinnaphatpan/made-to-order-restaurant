import { prisma } from '@/lib/prisma';
import { fmt } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { autoProgressOrders } from '@/lib/autoProgress';

export const dynamic = 'force-dynamic';

// GET /api/orders/stream — SSE สำหรับ admin real-time
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'admin') {
    return new Response('Unauthorized', { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = async () => {
        try {
          // auto-advance สถานะออเดอร์ตามเวลาก่อน ค่อยส่งข้อมูล
          await autoProgressOrders();

          const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100,
          });
          const payload = `data: ${JSON.stringify({ orders: fmt(orders) })}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch {
          controller.enqueue(encoder.encode(': keep-alive\n\n'));
        }
      };

      send();
      const interval = setInterval(send, 3000);

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type':      'text/event-stream',
      'Cache-Control':     'no-cache, no-transform',
      'Connection':        'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
