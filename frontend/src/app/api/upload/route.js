import { writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { apiError } from '@/lib/utils';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_MB   = 5;

// POST /api/upload — อัพโหลดรูปภาพ
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return apiError('Unauthorized', 401);

  try {
    const formData = await request.formData();
    const file     = formData.get('file');

    if (!file) return apiError('ไม่พบไฟล์', 400);
    if (!ALLOWED_TYPES.includes(file.type)) return apiError('รองรับเฉพาะ JPG, PNG, WEBP, GIF', 400);
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return apiError(`ไฟล์ต้องไม่เกิน ${MAX_SIZE_MB}MB`, 400);

    const bytes    = await file.arrayBuffer();
    const buffer   = Buffer.from(bytes);
    const ext      = extname(file.name) || '.jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), buffer);

    return Response.json({ success: true, url: `/uploads/${filename}` });
  } catch (err) {
    return apiError(err.message);
  }
}
