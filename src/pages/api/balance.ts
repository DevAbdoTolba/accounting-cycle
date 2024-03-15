import { Workbook } from "exceljs";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req, res) {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet("الأستاذ العام");
  worksheet.views = [{ rightToLeft: true }];

  const headers = [
    "الحساب",
    "مدين",
    "دائن",
    "القائمة المالية",
    "التصنيف داخل القائمة",
  ];

  // البنك			ميزانية	أصول
  // رأس المال			ميزانية	خصوم
  // الصندوق			ميزانية	أصول
  // أثاث			ميزانية	أصول
  // الحسابات الدائنة			ميزانية	خصوم
  // مشتريات			دخل	تكلفة المبيعات
  // الحسابات المدينة			ميزانية	أصول
  // مبيعات			دخل	مبيعات
  // مصروف1			دخل	مصاريف
  // مصروف2			دخل	مصاريف
  // مردودات مبيعات			دخل	مبيعات
  // مردودات مشتريات			دخل	تكلفة المبيعات
  // خصم مسموح به			دخل	مبيعات
  // خصم مكتسب			دخل	تكلفة المبيعات

  worksheet.addRow(headers);

  const data = [
    ["البنك", null, null, "ميزانية", "أصول"],
    ["رأس المال", null, null, "ميزانية", "خصوم"],
    ["الصندوق", null, null, "ميزانية", "أصول"],
    ["أثاث", null, null, "ميزانية", "أصول"],
    ["الحسابات الدائنة", null, null, "ميزانية", "خصوم"],
    ["مشتريات", null, null, "دخل", "تكلفة المبيعات"],
    ["الحسابات المدينة", null, null, "ميزانية", "أصول"],
    ["مبيعات", null, null, "دخل", "مبيعات"],
    ["مصروف1", null, null, "دخل", "مصاريف"],
    ["مصروف2", null, null, "دخل", "مصاريف"],
    ["مردودات مبيعات", null, null, "دخل", "مبيعات"],
    ["مردودات مشتريات", null, null, "دخل", "تكلفة المبيعات"],
    ["خصم مسموح به", null, null, "دخل", "مبيعات"],
    ["خصم مكتسب", null, null, "دخل", "تكلفة المبيعات"],
  ];

  data.forEach((row) => {
    worksheet.addRow(row);
  });

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
