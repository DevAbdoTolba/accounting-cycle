import { NextApiRequest, NextApiResponse } from "next";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export default async function hello(req: NextApiRequest, res: NextApiResponse) {
  const db = await open({
    filename: "./mydb.sqlite",
    driver: sqlite3.Database,
  });
  const result = await db.all("SELECT * FROM System");
  res.json(result);
}
