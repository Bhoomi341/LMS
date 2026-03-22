import mysql from "mysql2/promise";
import { env } from "./env.js";

function parseDatabaseUrl(url: string): mysql.ConnectionOptions {
  const u = new URL(url);
  if (u.protocol !== "mysql:") {
    throw new Error("DATABASE_URL must use mysql:// scheme");
  }
  return {
    host: u.hostname,
    port: u.port ? Number(u.port) : 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ""),
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true,
  };
}

const poolConfig = parseDatabaseUrl(env.databaseUrl);

export const pool = mysql.createPool(poolConfig);

export type DbPool = typeof pool;
export type RowDataPacket = mysql.RowDataPacket;
export type ResultSetHeader = mysql.ResultSetHeader;
