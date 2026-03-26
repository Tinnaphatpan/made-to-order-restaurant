export function apiResponse(data, status = 200) {
  return Response.json(data, { status });
}

export function apiError(message, status = 500) {
  return Response.json({ success: false, error: message }, { status });
}

export function generateOrderNumber(seq) {
  return `ORD-${String(seq).padStart(4, '0')}`;
}

// Normalise Prisma records: add _id alias so existing frontend code works
export function fmt(x) {
  if (!x) return x;
  if (Array.isArray(x)) return x.map(fmt);
  const r = { ...x, _id: x.id };
  for (const k of Object.keys(r)) {
    const v = r[k];
    if (v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date) && v.id) {
      r[k] = { ...v, _id: v.id };
    }
  }
  return r;
}
