import { prisma } from '@/lib/prisma';
import { apiError, fmt } from '@/lib/utils';

// GET /api/menu?category=<id>&available=true
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const where = {};

    if (searchParams.get('category'))         where.categoryId  = searchParams.get('category');
    if (searchParams.get('available') === 'true') where.isAvailable = true;

    const items = await prisma.menuItem.findMany({
      where,
      include: { category: { select: { id: true, name: true, icon: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return Response.json({ success: true, data: fmt(items) });
  } catch (err) {
    return apiError(err.message);
  }
}

// POST /api/menu
export async function POST(request) {
  try {
    const { category, categoryId, ...rest } = await request.json();
    const cId = categoryId || category; // รองรับทั้ง 2 field name
    const item = await prisma.menuItem.create({
      data: { ...rest, categoryId: cId },
      include: { category: { select: { id: true, name: true, icon: true } } },
    });
    return Response.json({ success: true, data: fmt(item) }, { status: 201 });
  } catch (err) {
    return apiError(err.message, 400);
  }
}
