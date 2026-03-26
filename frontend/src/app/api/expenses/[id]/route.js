import { prisma } from '@/lib/prisma';
import { apiError, fmt } from '@/lib/utils';

export async function GET(_, { params }) {
  try {
    const expense = await prisma.expense.findUnique({ where: { id: params.id } });
    if (!expense) return apiError('Expense not found', 404);
    return Response.json({ success: true, data: fmt(expense) });
  } catch (err) {
    return apiError(err.message);
  }
}

export async function PUT(request, { params }) {
  try {
    const { id: _id, _id: __id, createdAt, updatedAt, ...body } = await request.json();
    const expense = await prisma.expense.update({ where: { id: params.id }, data: body });
    return Response.json({ success: true, data: fmt(expense) });
  } catch (err) {
    if (err.code === 'P2025') return apiError('Expense not found', 404);
    return apiError(err.message, 400);
  }
}

export async function DELETE(_, { params }) {
  try {
    await prisma.expense.delete({ where: { id: params.id } });
    return Response.json({ success: true, message: 'Deleted' });
  } catch (err) {
    if (err.code === 'P2025') return apiError('Expense not found', 404);
    return apiError(err.message);
  }
}
