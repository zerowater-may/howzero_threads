import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "fs";
import { join } from "path";

// ax-web 검증 패턴 그대로 — DATABASE_URL 있으면 실 Postgres, 없으면 PGlite.
export interface Db {
  query(sql: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
  exec(sql: string): Promise<unknown>;
}

const g = globalThis as unknown as { __hzdb?: Promise<Db> };

function schemaSql(): string {
  return readFileSync(join(process.cwd(), "sql/schema.sql"), "utf8");
}

async function makeDb(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { default: postgres } = await import("postgres");
    const sql = postgres(url, { prepare: false, max: 1 });
    const db: Db = {
      query: async (q, params = []) => ({ rows: (await sql.unsafe(q, params as never[])) as unknown as Record<string, unknown>[] }),
      exec: async (q) => sql.unsafe(q),
    };
    await db.exec(schemaSql());
    return db;
  }
  const dir = process.env.VERCEL ? "/tmp/.pglite-hzos" : join(process.cwd(), ".pglite");
  const lite = new PGlite(dir);
  await lite.exec(schemaSql());
  return {
    query: async (q, params = []) => (await lite.query(q, params as unknown[])) as { rows: Record<string, unknown>[] },
    exec: (q) => lite.exec(q),
  };
}

export function getDb(): Promise<Db> {
  if (!g.__hzdb) {
    g.__hzdb = makeDb().catch((e) => {
      g.__hzdb = undefined;
      throw e;
    });
  }
  return g.__hzdb;
}
