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
  //   ('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December')
  //    ('العملاء', 'الموردين', 'البنك', 'الصندوق', 'المشتريات', 'المبيعات')

  const {
    month,
    description,
    name_pay,
    name_received,
    amount_pay,
    amount_received,
  } = req.query;

  console.log({
    month: month,
    description: description,
    name_pay: name_pay,
    name_received: name_received,
    amount_pay: amount_pay,
    amount_received: amount_received,
  });

  // get all the data with the same month and count them from 1 and add 1 to the count then store it
  // in the month_registration field

  let month_registration_number = await db.all(
    `SELECT * FROM System WHERE month_name = ?`,
    [month]
  );

  try {
    const { changes } = await db.run(
      `INSERT INTO System (month_name, description, month_registration_number,  name_pay, name_received, amount_pay, amount_received, date) VALUES (?, ?,?, ?, ?, ?, ?,?)`,
      [
        month,
        description,
        month_registration_number.length + 1,
        name_pay,
        name_received,
        amount_pay,
        amount_received,
        new Date().toISOString().slice(0, 19).replace("T", " "),
      ]
    );

    console.log("inserted successfully");

    res.json({ message: "inserted successfully" });
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ message: "Error inserting data" });
  }
}
