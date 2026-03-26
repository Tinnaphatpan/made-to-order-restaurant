import { prisma } from '@/lib/prisma';
import { fmt } from '@/lib/utils';
import { autoProgressOrders } from '@/lib/autoProgress';

export const dynamic = 'force-dynamic';

// GET /api/orders/:id/stream — SSE สำหรับลูกค้าติดตามออเดอร์แบบ real-time
export async function GET(request, { params }) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = async () => {
        try {
          await autoProgressOrders();
          const order = await prisma.order.findUnique({ where: { id: params.id } });
          if (!order) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'ไม่พบออเดอร์' })}\n\n`));
            return;
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ order: fmt(order) })}\n\n`));
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
