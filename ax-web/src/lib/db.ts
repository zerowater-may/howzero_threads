import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "fs";
import { join } from "path";

// 라우트가 쓰는 최소 인터페이스 — PGlite와 postgres.js를 같은 모양으로 감싼다.
export interface Db {
  query(sql: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
  exec(sql: string): Promise<unknown>;
}

const g = globalThis as unknown as { __axdb?: Promise<Db> };

function schemaSql(): string {
  return readFileSync(join(process.cwd(), "sql/schema.sql"), "utf8");
}

async function makeDb(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  if (url) {
    // 실 Postgres (Supabase 등). 서버리스는 Transaction pooler(6543) URL + prepare:false 필수.
    const { default: postgres } = await import("postgres");
    const sql = postgres(url, { prepare: false, max: 1 });
    const db: Db = {
      query: async (q, params = []) => ({ rows: (await sql.unsafe(q, params as never[])) as unknown as Record<string, unknown>[] }),
      exec: async (q) => sql.unsafe(q),
    };
    await db.exec(schemaSql()); // IF NOT EXISTS라 매 기동 안전
    return db;
  }
  // 로컬 기본: PGlite. Vercel에서 DATABASE_URL 없으면 /tmp 휘발 DB(데모용).
  const dir = process.env.VERCEL ? "/tmp/.pglite" : join(process.cwd(), ".pglite");
  const lite = new PGlite(dir);
  await lite.exec(schemaSql());
  return {
    query: async (q, params = []) => (await lite.query(q, params as unknown[])) as { rows: Record<string, unknown>[] },
    exec: (q) => lite.exec(q),
  };
}

export function getDb(): Promise<Db> {
  if (!g.__axdb) {
    g.__axdb = makeDb().catch((e) => {
      // 실패한 Promise를 캐시에 남기면 재시작 전까지 전 요청이 죽는다 — 다음 호출이 재시도하게 비운다
      g.__axdb = undefined;
      throw e;
    });
  }
  return g.__axdb;
}
