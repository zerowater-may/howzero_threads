import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "fs";
import { join } from "path";

// ponytail: 로컬 개발은 PGlite(임베디드 Postgres). 배포 시 docker-compose Postgres + postgres npm으로 교체.
const g = globalThis as unknown as { __axdb?: Promise<PGlite> };

export function getDb(): Promise<PGlite> {
  if (!g.__axdb) {
    g.__axdb = (async () => {
      // Vercel 서버리스는 프로젝트 디렉토리가 읽기 전용 — /tmp만 쓰기 가능.
      // ponytail: 임시 배포용. 콜드스타트마다 초기화되는 휘발 DB라 실 리드 수집 시작 전에 실 Postgres로 교체할 것.
      const dir = process.env.VERCEL ? "/tmp/.pglite" : join(process.cwd(), ".pglite");
      const db = new PGlite(dir);
      // 스키마는 IF NOT EXISTS라 매 기동 시 적용해도 안전
      await db.exec(readFileSync(join(process.cwd(), "sql/schema.sql"), "utf8"));
      return db;
    })().catch((e) => {
      // 실패한 Promise를 캐시에 남기면 재시작 전까지 전 요청이 죽는다 — 다음 호출이 재시도하게 비운다
      g.__axdb = undefined;
      throw e;
    });
  }
  return g.__axdb;
}
