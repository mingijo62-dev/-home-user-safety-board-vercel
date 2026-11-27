// PPT 내보내기용 사진 중계 (Vercel Blob 공개 사진만 허용)
import { handle, HttpError } from './_lib.js';

export const GET = handle(async req => {
  let target;
  try { target = new URL(new URL(req.url).searchParams.get('u') || ''); } catch { throw new HttpError(400, '잘못된 주소입니다'); }
  if (target.protocol !== 'https:' || !/\.public\.blob\.vercel-storage\.com$/.test(target.hostname)) throw new HttpError(400, '허용되지 않은 주소입니다');
  const r = await fetch(target);
  if (!r.ok) throw new HttpError(r.status, '사진을 가져오지 못했습니다');
  return new Response(r.body, { headers: { 'content-type': r.headers.get('content-type') || 'image/jpeg', 'cache-control': 'public, max-age=86400' } });
});
