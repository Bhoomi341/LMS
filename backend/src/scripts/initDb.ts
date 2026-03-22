import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const u = new URL(url);
  const conn = await mysql.createConnection({
    host: u.hostname,
    port: u.port ? Number(u.port) : 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ""),
    multipleStatements: true,
  });

  const schemaPath = path.join(__dirname, "..", "schema.sql");
  const seedPath = path.join(__dirname, "..", "seed.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");
  const seed = fs.readFileSync(seedPath, "utf8");

  await conn.query(schema);
  await conn.query(seed);
  await conn.end();

  console.log("Database schema and seed applied.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
