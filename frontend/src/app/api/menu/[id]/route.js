import { prisma } from '@/lib/prisma';
import { apiError, fmt } from '@/lib/utils';

export async function GET(_, { params }) {
  try {
    const item = await prisma.menuItem.findUnique({
      where: { id: params.id },
      include: { category: { select: { id: true, name: true, icon: true } } },
    });
    if (!item) return apiError('Menu item not found', 404);
    return Response.json({ success: true, data: fmt(item) });
  } catch (err) {
    return apiError(err.message);
  }
}

export async function PUT(request, { params }) {
  try {
    const { category, categoryId, id: _id, _id: __id, createdAt, updatedAt, ...rest } = await request.json();
    const data = { ...rest };
    if (categoryId || category) data.categoryId = categoryId || category;

    const item = await prisma.menuItem.update({
      where: { id: params.id },
      data,
      include: { category: { select: { id: true, name: true, icon: true } } },
    });
    return Response.json({ success: true, data: fmt(item) });
  } catch (err) {
    if (err.code === 'P2025') return apiError('Menu item not found', 404);
    return apiError(err.message, 400);
  }
}

export async function DELETE(_, { params }) {
  try {
    await prisma.menuItem.delete({ where: { id: params.id } });
    return Response.json({ success: true, message: 'Menu item deleted' });
  } catch (err) {
    if (err.code === 'P2025') return apiError('Menu item not found', 404);
    return apiError(err.message);
  }
}
