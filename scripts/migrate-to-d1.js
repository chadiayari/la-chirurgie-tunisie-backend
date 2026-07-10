// One-off local script: reads existing MongoDB data and writes it out as
// D1-compatible SQL INSERT statements. Not part of the deployed Worker.
//
// Usage:
//   node scripts/migrate-to-d1.js
//   npx wrangler d1 execute <db-name> --local  --file=./schema.sql
//   npx wrangler d1 execute <db-name> --remote --file=./schema.sql
//   npx wrangler d1 execute <db-name> --local  --file=./migration-data.sql
//   npx wrangler d1 execute <db-name> --remote --file=./migration-data.sql
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

function sqlEscape(value) {
  if (value === null || value === undefined || value === "") return "NULL";
  if (typeof value === "number") return String(value);
  if (value instanceof Date) return `'${value.toISOString()}'`;
  return `'${String(value).replace(/'/g, "''")}'`;
}

async function migrate() {
  const connectOptions = process.env.DBNAME
    ? { dbName: process.env.DBNAME }
    : {};
  await mongoose.connect(process.env.URI, connectOptions);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;

  const admins = await db
    .collection("admins")
    .find()
    .sort({ createdAt: 1 })
    .toArray();
  const contacts = await db
    .collection("contacts")
    .find()
    .sort({ createdAt: 1 })
    .toArray();
  const subscribers = await db
    .collection("newsletters")
    .find()
    .sort({ subscribedAt: 1 })
    .toArray();

  const lines = [];

  for (const a of admins) {
    lines.push(
      `INSERT INTO admins (username, password, role, created_at) VALUES (${sqlEscape(a.username)}, ${sqlEscape(a.password)}, ${sqlEscape(a.role || "admin")}, ${sqlEscape(a.createdAt || new Date())});`,
    );
  }

  for (const ct of contacts) {
    lines.push(
      `INSERT INTO contacts (name, phone, intervention, email, message, status, created_at, updated_at) VALUES (${sqlEscape(ct.name)}, ${sqlEscape(ct.phone)}, ${sqlEscape(ct.intervention)}, ${sqlEscape(ct.email)}, ${sqlEscape(ct.message)}, ${sqlEscape(ct.status || "new")}, ${sqlEscape(ct.createdAt || new Date())}, ${sqlEscape(ct.updatedAt || new Date())});`,
    );
  }

  for (const s of subscribers) {
    lines.push(
      `INSERT INTO newsletter_subscribers (email, name, subscribed_at) VALUES (${sqlEscape(s.email)}, ${sqlEscape(s.name)}, ${sqlEscape(s.subscribedAt || new Date())});`,
    );
  }

  fs.writeFileSync("migration-data.sql", lines.join("\n") + "\n");

  console.log(`Wrote ${lines.length} INSERT statements to migration-data.sql`);
  console.log(
    `  admins: ${admins.length}, contacts: ${contacts.length}, newsletter_subscribers: ${subscribers.length}`,
  );
  console.log("\nNext steps:");
  console.log(
    "  npx wrangler d1 execute <db-name> --local  --file=./schema.sql",
  );
  console.log(
    "  npx wrangler d1 execute <db-name> --remote --file=./schema.sql",
  );
  console.log(
    "  npx wrangler d1 execute <db-name> --local  --file=./migration-data.sql",
  );
  console.log(
    "  npx wrangler d1 execute <db-name> --remote --file=./migration-data.sql",
  );

  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
