import postgres from "postgres";

export const sql = postgres(
  process.env.WORKER_DATABASE_URL || process.env.DATABASE_URL || "postgresql://howzero:howzero_dev_2026@localhost:5433/howzero",
  { max: 5, idle_timeout: 20 }
);
