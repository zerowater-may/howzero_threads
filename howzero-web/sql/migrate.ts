import postgres from "postgres";
import { readFileSync } from "fs";
import { join } from "path";

const databaseUrl = process.argv[2] || process.env.DATABASE_URL || "postgresql://howzero:howzero_dev_2026@localhost:5433/howzero";
const sql = postgres(databaseUrl);

async function migrate() {
  console.log("Running migrations...");

  const initSql = readFileSync(join(__dirname, "001_init.sql"), "utf-8");
  await sql.unsafe(initSql);

  const pipelineColumnsSql = readFileSync(join(__dirname, "002_pipeline_columns.sql"), "utf-8");
  await sql.unsafe(pipelineColumnsSql);

  const pipelineLogsSql = readFileSync(join(__dirname, "003_pipeline_logs.sql"), "utf-8");
  await sql.unsafe(pipelineLogsSql);

  const pipelineScheduleSql = readFileSync(join(__dirname, "004_pipeline_schedule.sql"), "utf-8");
  await sql.unsafe(pipelineScheduleSql);

  const pipelineEmailConfigSql = readFileSync(join(__dirname, "005_pipeline_email_config.sql"), "utf-8");
  await sql.unsafe(pipelineEmailConfigSql);

  console.log("Migrations complete.");
  await sql.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
