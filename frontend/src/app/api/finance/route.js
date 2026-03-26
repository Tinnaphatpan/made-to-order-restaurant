import { prisma } from '@/lib/prisma';
import { apiError } from '@/lib/utils';

// GET /api/finance?period=today|week|month|custom&from=&to=
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today';

    let from, to;
    const now = new Date();

    if (period === 'today') {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      to   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (period === 'week') {
      const day = now.getDay();
      from = new Date(now); from.setDate(now.getDate() - day); from.setHours(0, 0, 0, 0);
      to   = new Date(from); to.setDate(from.getDate() + 6);  to.setHours(23, 59, 59, 999);
    } else if (period === 'month') {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else {
      from = new Date(searchParams.get('from') || now);
      to   = new Date(new Date(searchParams.get('to') || now).setHours(23, 59, 59, 999));
    }

    const dateFilter = { gte: from, lte: to };

    const [revenueResult, expenseResult, ordersByStatusRaw, expenseByCategoryRaw] = await Promise.all([
      prisma.order.aggregate({
        where: { status: 'completed', createdAt: dateFilter },
        _sum:  { grandTotal: true },
        _count: { _all: true },
      }),
      prisma.expense.aggregate({
        where: { date: dateFilter },
        _sum:  { amount: true },
        _count: { _all: true },
      }),
      prisma.order.groupBy({
        by:    ['status'],
        where: { createdAt: dateFilter },
        _count: { _all: true },
      }),
      prisma.expense.groupBy({
        by:      ['category'],
        where:   { date: dateFilter },
        _sum:    { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
      }),
    ]);

    // Daily revenue via raw SQL
    const dailyRevenue = await prisma.$queryRaw`
      SELECT
        DATE("createdAt") AS date,
        SUM("grandTotal")::float AS revenue,
        COUNT(*)::int AS orders
      FROM "Order"
      WHERE status = 'completed'
        AND "createdAt" >= ${from}
        AND "createdAt" <= ${to}
      GROUP BY DATE("createdAt")
      ORDER BY DATE("createdAt") ASC
    `;

    const revenue  = revenueResult._sum.grandTotal || 0;
    const expenses = expenseResult._sum.amount     || 0;

    // แปลงรูปแบบให้เหมือน MongoDB เดิม
    const ordersByStatus     = ordersByStatusRaw.map(r => ({ _id: r.status, count: r._count._all }));
    const expenseByCategory  = expenseByCategoryRaw.map(r => ({ _id: r.category, total: r._sum.amount }));

    return Response.json({
      success: true,
      data: {
        period, from, to,
        revenue,
        expenses,
        profit: revenue - expenses,
        revenueOrderCount: revenueResult._count._all || 0,
        ordersByStatus,
        expenseByCategory,
        dailyRevenue,
      },
    });
  } catch (err) {
    return apiError(err.message);
  }
}
