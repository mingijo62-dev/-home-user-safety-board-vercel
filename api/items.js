import { sql, init, json, handle, cleanItem, HttpError } from './_lib.js';

const idOf = req => {
  const id = new URL(req.url).searchParams.get('id');
  if (!id || id.length > 100) throw new HttpError(400, 'id가 필요합니다');
  return id;
};

export const GET = handle(async () => {
  await init();
  const rows = await sql`select id, data from items order by updated_at desc`;
  return json({ items: rows.map(r => ({ ...r.data, id: r.id })) });
});

export const POST = handle(async req => {
  await init();
  const data = cleanItem(await req.json());
  if (!data.part || !data.title) throw new HttpError(400, '파트와 제목은 필수입니다');
  const id = crypto.randomUUID();
  await sql`insert into items (id, data) values (${id}, ${JSON.stringify(data)}::jsonb)`;
  return json({ id }, 201);
});

export const PATCH = handle(async req => {
  await init();
  const id = idOf(req);
  const data = cleanItem(await req.json());
  const rows = await sql`update items set data = data || ${JSON.stringify(data)}::jsonb, updated_at = now() where id = ${id} returning id`;
  if (!rows.length) throw new HttpError(404, '해당 시정요구가 없습니다');
  return json({ id });
});

export const DELETE = handle(async req => {
  await init();
  const id = idOf(req);
  await sql`delete from items where id = ${id}`;
  return json({ ok: true });
});
