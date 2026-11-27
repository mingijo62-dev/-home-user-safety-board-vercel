// 사진 업로드 → Vercel Blob (공개 URL 반환)
import { put } from '@vercel/blob';
import { json, handle, HttpError } from './_lib.js';

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp', 'image/bmp': 'bmp' };

export const POST = handle(async req => {
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new HttpError(500, 'BLOB_READ_WRITE_TOKEN 환경변수가 없습니다. Vercel 프로젝트의 Storage에서 Blob을 연결한 뒤 다시 배포하세요.');
  const type = (req.headers.get('content-type') || '').split(';')[0].trim();
  if (!EXT[type]) throw new HttpError(415, '이미지 파일(jpg, png, gif, webp)만 올릴 수 있습니다');
  const buf = Buffer.from(await req.arrayBuffer());
  if (!buf.length) throw new HttpError(400, '빈 파일입니다');
  if (buf.length > 4 * 1024 * 1024) throw new HttpError(413, '사진은 4MB 이하만 올릴 수 있습니다');
  const blob = await put(`photos/${new Date().toISOString().slice(0, 7)}/photo.${EXT[type]}`, buf, { access: 'public', contentType: type, addRandomSuffix: true });
  return json({ id: blob.url, url: blob.url }, 201);
});
