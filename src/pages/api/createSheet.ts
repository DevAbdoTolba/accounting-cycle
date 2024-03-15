import { Workbook } from "exceljs";
import { NextApiRequest, NextApiResponse } from "next";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export default async function handler(req, res) {
  try {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("My Sheet");

    const db = await open({
      filename: "./mydb.sqlite",
      driver: sqlite3.Database,
    });

    const month =
      typeof req.query.month === "string" ? req.query.month : undefined;

    // Set the worksheet to RTL
    worksheet.views = [{ rightToLeft: true }];

    // Add the first row of headers
    const headerRow1 = worksheet.addRow([
      "رقم القيد",
      "التاريخ",
      "البيان",
      "القيد",
      null,
      "المبلغ",
      null,
      "العملاء",
      null,
      "الموردين",
      null,
      "البنك",
      null,
      "الصندوق",
      null,
      "المشتريات",
      null,
      "المبيعات",
    ]);

    // Merge cells for the first row

    // Add the second row of headers
    const headerRow2 = worksheet.addRow([
      null,
      null,
      null,
      "مدين",
      "دائن",
      "مدين",
      "دائن",
      "مدين",
      "دائن",
      "مدين",
      "دائن",
      "مدين",
      "دائن",
      "مدين",
      "دائن",
      "مدين",
      "دائن",
      "مدين",
      "دائن",
    ]);

    worksheet.mergeCells("A1:A2");
    worksheet.mergeCells("B1:B2");
    worksheet.mergeCells("C1:C2");
    worksheet.mergeCells("D1:E1");
    worksheet.mergeCells("F1:G1");
    worksheet.mergeCells("H1:I1");
    worksheet.mergeCells("J1:K1");
    worksheet.mergeCells("L1:M1");
    worksheet.mergeCells("N1:O1");
    worksheet.mergeCells("P1:Q1");
    worksheet.mergeCells("R1:S1");

    // Add the data

    // get data
    const data = await db.all(`SELECT * FROM System WHERE month_name = ?`, [
      month,
    ]);

    // convert data
    // remove id
    const filterData = (data: any) => {
      data.forEach((row: any) => {
        delete row.id;
      });

      // calculate every step of the parts summed up with the previous value which has 2 separate values for each part

      // remove the name_pay and name_received
      // data.forEach((row) => {
      //   delete row.name_pay;
      //   delete row.name_received;
      // });

      // set month_registration_number as the first column
      data.forEach((row, index) => {
        row.رقم_القيد = row.month_registration_number;
        delete row.month_registration_number;
      });

      // set date as the second column but slice only the first 10 chars
      data.forEach((row) => {
        row.التاريخ = row.date.slice(0, 10);
        delete row.date;
      });

      // set description as the third column
      data.forEach((row) => {
        row.البيان = row.description;
        delete row.description;
      });

      // set the name as name receive column then name pay column

      data.forEach((row) => {
        row.القيد_المدين = row.name_received;
        row.القيد_الدائن = row.name_pay;
        delete row.name_received;
        delete row.name_pay;
      });

      const newData = data.map((row) => {
        return {
          رقم_القيد: row["رقم_القيد"],
          التاريخ: row["التاريخ"],
          البيان: row["البيان"],
          القيد_المدين: row["القيد_المدين"],
          القيد_الدائن: row["القيد_الدائن"],
          amount_received: row.amount_received,
          amount_pay: row.amount_pay,
        };
      });

      return newData;
    };

    const newData = filterData(data);

    const calculateAmounts = (data: any) => {
      const fields = [
        "العملاء",
        "الموردين",
        "البنك",
        "الصندوق",
        "المشتريات",
        "المبيعات",
      ];

      // Calculate amounts
      return data.map((item) => {
        const result = {};

        fields.forEach((field) => {
          result[field + "_المبلغ المدين"] = 0;
          result[field + "_المبلغ الدائن"] = 0;
        });

        if (fields.includes(item["القيد_المدين"])) {
          result[item["القيد_المدين"] + "_المبلغ المدين"] =
            item.amount_received;
        }
        if (fields.includes(item["القيد_الدائن"])) {
          result[item["القيد_الدائن"] + "_المبلغ الدائن"] = item.amount_pay;
        }

        return result;
      });
    };

    // Use the function
    const amounts = calculateAmounts(data);

    const mergedData = newData.map((item, index) => {
      return { ...item, ...amounts[index] };
    });

    console.log(mergedData);
    // add the data to the sheet
    mergedData.forEach((row: any) => {
      worksheet.addRow(Object.values(row));
    });

    // set sum of the amounts
    worksheet.addRow([
      null,
      null,
      null,
      null,
      null,
      { formula: `SUM(INDIRECT("F3:F" & ROW()-1))` },
      { formula: `SUM(INDIRECT("G3:G" & ROW()-1))` },
    ]);

    worksheet.addRow([
      null,
      null,
      null,
      null,
      null,
      {
        formula: `IF(SUM(INDIRECT("F3:F" & ROW()-1))=SUM(INDIRECT("G3:G" & ROW()-1)), "TRUE", "FALSE")
    `,
      },
    ]);

    worksheet.mergeCells(
      `F${worksheet.actualRowCount}:G${worksheet.actualRowCount}`
    );

    // Center all cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=${month}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.log(err);

    res.status(500).json({ message: "An error occurred: " + err.message });
  }
}
