import { prisma } from '@/lib/prisma';
import { apiError, fmt } from '@/lib/utils';

// GET /api/categories?active=true
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const where = searchParams.get('active') === 'true' ? { isActive: true } : {};
    const categories = await prisma.category.findMany({ where, orderBy: { name: 'asc' } });
    return Response.json({ success: true, data: fmt(categories) });
  } catch (err) {
    return apiError(err.message);
  }
}

// POST /api/categories
export async function POST(request) {
  try {
    const body = await request.json();
    const category = await prisma.category.create({ data: body });
    return Response.json({ success: true, data: fmt(category) }, { status: 201 });
  } catch (err) {
    return apiError(err.message, 400);
  }
}
