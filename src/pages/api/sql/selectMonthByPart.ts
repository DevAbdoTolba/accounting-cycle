import { NextApiRequest, NextApiResponse } from "next";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export default async function selectData(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const db = await open({
    filename: "./mydb.sqlite",
    driver: sqlite3.Database,
  });

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const month =
    typeof req.query.month === "string" ? req.query.month : undefined;

  const part = typeof req.query.part === "string" ? req.query.part : undefined;

  console.log(month);
  if (!month || !months.includes(month)) {
    res.status(400).json({ message: "Invalid month" });
    return;
  }

  const data = await db.all(
    `SELECT * FROM System WHERE month_name = ? AND (name_pay = ? OR name_received = ?) `,
    [month, part, part]
  );

  res.json(data);
}
