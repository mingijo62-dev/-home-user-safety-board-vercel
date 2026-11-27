import { sql, init, json, handle, HttpError } from './_lib.js';

export const GET = handle(async () => {
  await init();
  const rows = await sql`select value from settings where key = 'parts'`;
  return json({ list: rows[0]?.value?.list || [] });
});

export const PUT = handle(async req => {
  await init();
  const body = await req.json();
  if (!Array.isArray(body?.list)) throw new HttpError(400, '파트 목록이 필요합니다');
  const list = [...new Set(body.list.map(s => String(s).trim().slice(0, 60)).filter(Boolean))].slice(0, 100);
  await sql`insert into settings (key, value) values ('parts', ${JSON.stringify({ list })}::jsonb)
            on conflict (key) do update set value = excluded.value`;
  return json({ list });
});
