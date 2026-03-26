import { prisma } from '@/lib/prisma';
import { apiError, fmt } from '@/lib/utils';

export async function GET(_, { params }) {
  try {
    const category = await prisma.category.findUnique({ where: { id: params.id } });
    if (!category) return apiError('Category not found', 404);
    return Response.json({ success: true, data: fmt(category) });
  } catch (err) {
    return apiError(err.message);
  }
}

export async function PUT(request, { params }) {
  try {
    const { id: _id, _id: __id, createdAt, updatedAt, menuItems, ...body } = await request.json();
    const category = await prisma.category.update({ where: { id: params.id }, data: body });
    return Response.json({ success: true, data: fmt(category) });
  } catch (err) {
    if (err.code === 'P2025') return apiError('Category not found', 404);
    return apiError(err.message, 400);
  }
}

export async function DELETE(_, { params }) {
  try {
    await prisma.category.delete({ where: { id: params.id } });
    return Response.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    if (err.code === 'P2025') return apiError('Category not found', 404);
    return apiError(err.message);
  }
}
