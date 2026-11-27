// 공용: DB 연결, 테이블 자동 생성, 응답 헬퍼
import { neon } from '@neondatabase/serverless';

const DEFAULT_PARTS = ['조성파트','PM21파트','PM22파트','PM23파트','CM21파트','CM22파트','완정파트','품관파트','환경파트','보전팀'];
// Vercel이 연결 시 접두어를 붙이는 경우(예: STORAGE_DATABASE_URL)도 찾는다
export const envLike = (...names) => {
  for (const n of names) if (process.env[n]) return process.env[n];
  for (const n of names) { const k = Object.keys(process.env).find(k => k.endsWith('_' + n) && process.env[k]); if (k) return process.env[k]; }
  return '';
};
const url = envLike('DATABASE_URL', 'POSTGRES_URL');
export const sql = url ? neon(url) : null;

let ready = null;
export async function init() {
  if (!sql) throw new HttpError(500, 'DATABASE_URL 환경변수가 없습니다. Vercel 프로젝트의 Storage에서 Neon(Postgres)을 연결한 뒤 다시 배포하세요.');
  ready ??= (async () => {
    await sql`create table if not exists sb_items (id text primary key, data jsonb not null, updated_at timestamptz not null default now())`;
    await sql`create table if not exists sb_settings (key text primary key, value jsonb not null)`;
    await sql`insert into sb_settings (key, value) values ('parts', ${JSON.stringify({ list: DEFAULT_PARTS })}::jsonb) on conflict (key) do nothing`;
  })().catch(e => { ready = null; throw e; });
  return ready;
}

export class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
export const json = (data, status = 200) => Response.json(data, { status, headers: { 'cache-control': 'no-store' } });
export const handle = fn => async req => {
  try { return await fn(req); }
  catch (e) { console.error(e); return json({ error: e.message || '서버 오류' }, e.status || 500); }
};

const STR = { part: 60, round: 7, status: 10, due: 10, owner: 60, doneAt: 10, no: 40, title: 300, target: 300, issue: 5000, action: 5000, beforeId: 1000, afterId: 1000, updatedAt: 40, createdAt: 40, source: 300 };
const STATUSES = ['open', 'doing', 'done'];
// 허용된 필드만 저장
export function cleanItem(body) {
  if (!body || typeof body !== 'object') throw new HttpError(400, '잘못된 요청입니다');
  const out = {};
  for (const [k, max] of Object.entries(STR)) {
    if (!(k in body)) continue;
    const v = body[k];
    out[k] = v == null ? null : String(v).slice(0, max);
  }
  if ('status' in out && !STATUSES.includes(out.status)) throw new HttpError(400, '상태 값이 올바르지 않습니다');
  for (const k of ['beforeId', 'afterId']) if (out[k] && !/^https:\/\//.test(out[k])) out[k] = null;
  return out;
}
