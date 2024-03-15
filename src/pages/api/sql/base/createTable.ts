import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { NextApiRequest, NextApiResponse } from "next";

export default async function openDb(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const db = await open({
    filename: "./mydb.sqlite",
    driver: sqlite3.Database,
  });

  const { changes } = await db.run(`
    CREATE TABLE IF NOT EXISTS System (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month_name TEXT CHECK(month_name IN ('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December')),
      description TEXT,
      month_registration_number INTEGER,
      name_pay TEXT CHECK(name_pay IN ('العملاء', 'الموردين', 'البنك', 'الصندوق', 'المشتريات', 'المبيعات')),
      name_received TEXT CHECK(name_received IN ('العملاء', 'الموردين', 'البنك', 'الصندوق', 'المشتريات', 'المبيعات')),
      amount_pay INTEGER,
      amount_received INTEGER,
      date TEXT
    )
  `);
  console.log("created successfully");
  res.json({ message: "created successfully" });
}
