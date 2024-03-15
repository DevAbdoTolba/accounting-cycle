import { NextApiRequest, NextApiResponse } from "next";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export default async function insertData(
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
  const name_values = [
    "العملاء",
    "الموردين",
    "البنك",
    "الصندوق",
    "المشتريات",
    "المبيعات",
  ];

  for (let i = 0; i < 10; i++) {
    const month = months[i % 3];
    const name_pay = name_values[Math.floor(Math.random() * 6)];
    const name_received = name_values[Math.floor(Math.random() * 6)];
    const amount_pay = Math.floor(Math.random() * 1000);
    const amount_received = Math.floor(Math.random() * 1000);

    let month_registration_number = await db.all(
      `SELECT * FROM System WHERE month_name = ?`,
      [month]
    );

    await db.run(
      `
      INSERT INTO System (month_name,   description, month_registration_number , name_pay, name_received, amount_pay, amount_received, date)
      VALUES (?,   ?, ? ,  ?, ?, ?, ?,?)
    `,
      [
        month,
        `Description for ${month}`,
        month_registration_number.length + 1,
        name_pay,
        name_received,
        amount_pay,
        amount_received,
        new Date().toISOString().slice(0, 19).replace("T", " "),
      ]
    );
  }

  res.json({ message: "inserted successfully" });
}
