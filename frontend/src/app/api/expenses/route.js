import { prisma } from '@/lib/prisma';
import { apiError, fmt } from '@/lib/utils';

// GET /api/expenses?from=2024-01-01&to=2024-12-31
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const where = {};

    const from = searchParams.get('from');
    const to   = searchParams.get('to');
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to)   where.date.lte = new Date(new Date(to).setHours(23, 59, 59, 999));
    }

    const expenses = await prisma.expense.findMany({ where, orderBy: { date: 'desc' } });
    return Response.json({ success: true, data: fmt(expenses) });
  } catch (err) {
    return apiError(err.message);
  }
}

// POST /api/expenses
export async function POST(request) {
  try {
    const body    = await request.json();
    const expense = await prisma.expense.create({ data: body });
    return Response.json({ success: true, data: fmt(expense) }, { status: 201 });
  } catch (err) {
    return apiError(err.message, 400);
  }
}
