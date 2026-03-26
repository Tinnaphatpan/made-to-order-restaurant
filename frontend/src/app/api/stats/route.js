import { prisma } from '@/lib/prisma';
import { apiError } from '@/lib/utils';

// GET /api/stats — dashboard summary
export async function GET() {
  try {
    const [
      totalOrders,
      pendingOrders,
      preparingOrders,
      completedOrders,
      totalMenuItems,
      totalCategories,
      revenueResult,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.order.count({ where: { status: 'preparing' } }),
      prisma.order.count({ where: { status: 'completed' } }),
      prisma.menuItem.count(),
      prisma.category.count(),
      prisma.order.aggregate({
        where: { status: 'completed' },
        _sum:  { grandTotal: true },
      }),
    ]);

    return Response.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        preparingOrders,
        completedOrders,
        totalMenuItems,
        totalCategories,
        totalRevenue: revenueResult._sum.grandTotal || 0,
      },
    });
  } catch (err) {
    return apiError(err.message);
  }
}
