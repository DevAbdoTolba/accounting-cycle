import { Workbook } from "exceljs";
import { NextApiRequest, NextApiResponse } from "next";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export default async function handler(req, res) {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet("الأستاذ العام");
  worksheet.views = [{ rightToLeft: true }];

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

  // Get the sum of amount_pay for name_pay is equal for 6 field and amount_received for name_received is equal for 6 field
  // ('العملاء', 'الموردين', 'البنك', 'الصندوق', 'المشتريات', 'المبيعات')
  const fields = [
    "العملاء",
    "الموردين",
    "البنك",
    "الصندوق",
    "المشتريات",
    "المبيعات",
  ];

  //   I want the sum of amount_pay for name_pay, and also the same name_pay as name_received get the sum of the amount_received for it in the same month

  //   const monthsFields = await db.all(
  //     `SELECT month_name, name_pay,name_received, SUM(amount_pay) as total_pay, SUM(amount_received) as total_received FROM System GROUP BY month_name, name_pay, name_received`
  //   );

  let monthsFields = [];

  for (let month of months) {
    for (let field of fields) {
      // Query to get the sum of amount_received when the field is in name_received
      const totalReceivedForField = await db.get(
        `SELECT SUM(amount_received) as total FROM System WHERE name_received = '${field}' AND month_name = '${month}'`
      );

      // Query to get the sum of amount_pay when the field is in name_pay
      const totalPayForField = await db.get(
        `SELECT SUM(amount_pay) as total FROM System WHERE name_pay = '${field}' AND month_name = '${month}'`
      );

      // Push the result into the monthsFields array
      monthsFields.push({
        month_name: month,
        name: field,
        total_pay: totalPayForField.total || 0,
        total_received: totalReceivedForField.total || 0,
      });
    }
  }

  // Sort the monthsFields array
  monthsFields.sort((a, b) => {
    // Sort by month
    const monthComparison =
      months.indexOf(a.month_name) - months.indexOf(b.month_name);
    if (monthComparison !== 0) return monthComparison;

    // If the months are the same, sort by field
    return fields.indexOf(a.name) - fields.indexOf(b.name);
  });

  //   fill the fields to set any empty field with 0 value for total_pay and total_received

  fields.forEach((field) => {
    months.forEach((month) => {
      const monthData = monthsFields.find(
        (d) => d.month_name === month && d.name_pay === field
      );
      if (!monthData) {
        monthsFields.push({
          month_name: month,
          name_pay: field,
          total_pay: 0,
          total_received: 0,
        });
      }
    });
  });

  //   sort data months by months and fields
  monthsFields.sort((a, b) => {
    return months.indexOf(a.month_name) - months.indexOf(b.month_name);
  });

  //   get total amount_pay and total amount_recived in 2 columns for each month
  const data = await db.all(
    `SELECT month_name, SUM(amount_pay) as total_pay, SUM(amount_received) as total_received FROM System GROUP BY month_name`
  );

  //   fill the months to set any empty month with 0 value for total_pay and total_received
  months.forEach((month) => {
    const monthData = data.find((d) => d.month_name === month);
    if (!monthData) {
      data.push({ month_name: month, total_pay: 0, total_received: 0 });
    }
  });

  //   sort data months by months
  data.sort((a, b) => {
    return months.indexOf(a.month_name) - months.indexOf(b.month_name);
  });

  //     res.setHeader(
  //       "Content-Type",
  //       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  //     );
  //     res.setHeader("Content-Disposition", `attachment; filename=${month}.xlsx`);

  //     await workbook.xlsx.write(res);
  //     res.end();
  //   } catch (err) {
  //     console.log(err);j

  //   const newData = data.map((item) => {
  //     /**
  //      * Get the new object concatenated of the 2 array to look like this :
  //      * {
  //      *  month_name: 'January',
  //      * total_pay: 100,
  //      * total_received: 200
  //      * العملاء_الدائن : 200,
  //      * العملاء_المدين : 0,
  //      * الموردين_الدائن : 0,
  //      * الموردين_المدين : 200,
  //      * البنك_الدائن : 100,
  //      * البنك_المدين : 0,
  //      * الصندوق_الدائن : 0,
  //      * الصندوق_المدين : 100,
  //      * المشتريات_الدائن : 100,
  //      * المشتريات_المدين : 0,
  //      * المبيعات_الدائن : 0,
  //      * المبيعات_المدين : 100
  //      *
  //      *
  //      * }
  //      *
  //      */

  //     const fieldsData = monthsFields.filter(
  //       (d) => d.month_name === item.month_name
  //     );

  //     let newObject = {
  //       month_name: item.month_name,
  //       total_pay: item.total_pay,
  //       total_received: item.total_received,
  //     };

  //     fieldsData.forEach((field) => {
  //       newObject[`${field.name_pay}_الدائن`] = field.total_pay;
  //       newObject[`${field.name_pay}_المدين`] = field.total_received;
  //     });

  //     return newObject;
  //   });

  //   I want data array then concatented with monthsFields array without the month_name field and name field

  const newData = data.map((item) => {
    /**
     * Get the new object concatenated of the 2 array to look like this :
     * {
     *  month_name: 'January',
     * total_pay: 100,
     * total_received: 200
     * العملاء_الدائن : 200,
     * العملاء_المدين : 0,
     * الموردين_الدائن : 0,
     * الموردين_المدين : 200,
     * البنك_الدائن : 100,
     * البنك_المدين : 0,
     * الصندوق_الدائن : 0,
     * الصندوق_المدين : 100,
     * المشتريات_الدائن : 100,
     * المشتريات_المدين : 0,
     * المبيعات_الدائن : 0,
     * المبيعات_المدين : 100
     *
     *
     * }
     *
     */

    const fieldsData = monthsFields.filter(
      (d) => d.month_name === item.month_name
    );

    let newObject = {
      month_name: item.month_name,
      total_pay: item.total_pay,
      total_received: item.total_received,
    };

    fieldsData.forEach((field) => {
      newObject[`${field.name}_الدائن`] = field.total_pay;
      newObject[`${field.name}_المدين`] = field.total_received;
    });

    return newObject;
  });

  //   set to worksheet the data

  //     set the headers for the worksheet

  const headerRow1 = worksheet.addRow([
    "البيان",
    "الميزان",
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

  const headerRow2 = worksheet.addRow([
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
  ]);

  //   clear undefined_الدائن and undefined_المدين from newData

  newData.forEach((row) => {
    delete row.undefined_الدائن;
    delete row.undefined_المدين;
  });

  newData.forEach((row: any) => {
    worksheet.addRow(Object.values(row));
  });

  //   add sum row
  const sumRow = worksheet.addRow([
    "المجموع",
    { formula: `SUM(INDIRECT("B3:B" & ROW()-1))` },
    { formula: `SUM(INDIRECT("C3:C" & ROW()-1))` },
    { formula: `SUM(INDIRECT("D3:D" & ROW()-1))` },
    { formula: `SUM(INDIRECT("E3:E" & ROW()-1))` },
    { formula: `SUM(INDIRECT("F3:F" & ROW()-1))` },
    { formula: `SUM(INDIRECT("G3:G" & ROW()-1))` },
    { formula: `SUM(INDIRECT("H3:H" & ROW()-1))` },
    { formula: `SUM(INDIRECT("I3:I" & ROW()-1))` },
    { formula: `SUM(INDIRECT("J3:J" & ROW()-1))` },
    { formula: `SUM(INDIRECT("K3:K" & ROW()-1))` },
    { formula: `SUM(INDIRECT("L3:L" & ROW()-1))` },
    { formula: `SUM(INDIRECT("M3:M" & ROW()-1))` },
    { formula: `SUM(INDIRECT("N3:N" & ROW()-1))` },
    { formula: `SUM(INDIRECT("O3:O" & ROW()-1))` },
  ]);

  worksheet.addRow([
    null,

    {
      formula: `IF(SUM(INDIRECT("B3:B" & ROW()-1))=SUM(INDIRECT("C3:C" & ROW()-1)), "TRUE", "FALSE")
  `,
    },
  ]);

  worksheet.mergeCells("A1:A2");
  worksheet.mergeCells("B1:C1");
  worksheet.mergeCells("D1:E1");
  worksheet.mergeCells("F1:G1");
  worksheet.mergeCells("H1:I1");
  worksheet.mergeCells("J1:K1");
  worksheet.mergeCells("L1:M1");
  worksheet.mergeCells("N1:O1");
  worksheet.mergeCells(
    `B${worksheet.actualRowCount}:C${worksheet.actualRowCount}`
  );

  // center data
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });
  });

  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=generalSheet.xlsx`
  );

  await workbook.xlsx.write(res);
  res.end();
}
