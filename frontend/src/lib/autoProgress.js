import { prisma } from '@/lib/prisma';

// เวลาที่ใช้ก่อน auto-advance แต่ละสถานะ (มิลลิวินาที)
const AUTO_ADVANCE = {
  pending:   2 * 60 * 1000,  // 2 นาที → confirmed
  confirmed: 30 * 1000,       // 30 วินาที → preparing
  // preparing → ready : คำนวณจาก preparationTime ของเมนูในออเดอร์
};

const NEXT_STATUS = {
  pending:   'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
};

const AUTO_MESSAGES = {
  confirmed: 'ยืนยันออเดอร์อัตโนมัติ',
  preparing: 'เริ่มเตรียมอาหาร',
  ready:     'อาหารพร้อมเสิร์ฟแล้ว',
};

// คำนวณเวลา prep จาก items ในออเดอร์ (หน่วย ms)
async function getPrepTime(order) {
  try {
    const ids = (order.items || [])
      .map(i => i.menuItem || i.menuItemId)
      .filter(Boolean);

    if (ids.length === 0) return 15 * 60 * 1000; // default 15 นาที

    const menuItems = await prisma.menuItem.findMany({
      where:  { id: { in: ids } },
      select: { preparationTime: true },
    });

    const maxMin = Math.max(...menuItems.map(m => m.preparationTime || 15));
    return maxMin * 60 * 1000;
  } catch {
    return 15 * 60 * 1000;
  }
}

// เรียกฟังก์ชันนี้จาก SSE stream ทุก 3 วินาที
export async function autoProgressOrders() {
  try {
    const orders = await prisma.order.findMany({
      where: { status: { in: ['pending', 'confirmed', 'preparing'] } },
    });

    for (const order of orders) {
      const timeline = Array.isArray(order.timeline) ? order.timeline : [];

      // หาเวลาที่เข้าสถานะปัจจุบัน (timeline entry ล่าสุด)
      const lastEntry = [...timeline].reverse().find(t => t.status === order.status);
      if (!lastEntry) continue;

      const enteredAt = new Date(lastEntry.timestamp).getTime();
      const elapsed   = Date.now() - enteredAt;

      let waitTime;
      if (order.status === 'preparing') {
        waitTime = await getPrepTime(order);
      } else {
        waitTime = AUTO_ADVANCE[order.status];
      }

      if (elapsed < waitTime) continue; // ยังไม่ถึงเวลา

      const nextStatus = NEXT_STATUS[order.status];
      if (!nextStatus) continue;

      // อัพเดทสถานะ + เพิ่ม timeline
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status:   nextStatus,
          timeline: [
            ...timeline,
            {
              status:    nextStatus,
              message:   AUTO_MESSAGES[nextStatus] || nextStatus,
              timestamp: new Date().toISOString(),
            },
          ],
        },
      });
    }
  } catch {
    // silently ignore errors เพื่อไม่ให้ SSE หยุด
  }
}
