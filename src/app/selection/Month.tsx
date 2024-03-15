"use client";
import React, { ChangeEvent, useState, useEffect } from "react";

export default function Month() {
  const [month, setMonth] = useState<string>("");
  const [part, setPart] = useState<string>("");
  const [data, setData] = useState<string[] | null>(null);

  const handleChangeMonth = async (event: ChangeEvent<HTMLSelectElement>) => {
    setMonth(event.target.value);
    setData(null);
    setPart("");

    fetch(`/api/sql/selectMonth?month=${event.target.value}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        console.log(data);
      });
  };

  const handleChangePart = async (event: ChangeEvent<HTMLSelectElement>) => {
    setPart(event.target.value);
    setData(null);
    fetch(
      `/api/sql/selectMonthByPart?month=${month}&part=${event.target.value}`
    )
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        console.log(data);
      });
  };

  const downloadSheet = () => {
    if (data?.length === 0) {
      alert("No data found");

      return;
    }
    fetch(`/api/createSheet?month=${month}`)
      .then((res) => res.blob())
      .then((blob) => {
        // check if there was an error in the response
        if (blob.type === "application/json") {
          return blob.text().then((text) => {
            throw new Error(text);
          });
        }
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${month}.xlsx`;
        a.click();
      });
  };

  return (
    <div>
      <label htmlFor="month">الشهر</label>
      <select id="month" value={month} onChange={handleChangeMonth}>
        <option value="">Select...</option>
        <option value="January">January</option>
        <option value="February">February</option>
        <option value="March">March</option>
        <option value="April">April</option>
        <option value="May">May</option>
        <option value="June">June</option>
        <option value="July">July</option>
        <option value="August">August</option>
        <option value="September">September</option>
        <option value="October">October</option>
        <option value="November">November</option>
        <option value="December">December</option>
      </select>
      <br />
      <label htmlFor="part">الأطراف</label>
      <select id="part" value={part} onChange={handleChangePart}>
        <option value="">Select...</option>
        <option value="العملاء">العملاء</option>
        <option value="الموردين">الموردين</option>
        <option value="البنك">البنك</option>
        <option value="الصندوق">الصندوق</option>
        <option value="المشتريات">المشتريات</option>
        <option value="المبيعات">المبيعات</option>
      </select>
      <br />
      {month && <button onClick={downloadSheet}>Download sheet</button>}
      {data && !part && data.length > 0 ? (
        <table
          border={2}
          style={{
            width: "100%",
            textAlign: "center",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th>رقم القيد</th>
              <th>الشهر</th>
              <th>البيان</th>
              <th>القيد الدائن</th>
              <th>القيد المدين</th>
              <th>المبلغ الدائن</th>
              <th>المبلغ المدين</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: any, index) => (
              <tr key={item.id}>
                <td>{item.month_registration_number}</td>
                <td>{item.month_name}</td>
                <td>{item.description}</td>
                <td>{item.name_pay}</td>
                <td>{item.name_received}</td>
                <td>{item.amount_pay}</td>
                <td>{item.amount_received}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : data ? (
        "No data found"
      ) : (
        " Please select month"
      )}

      {data && part && data.length > 0 && (
        <table
          border={2}
          style={{
            width: "100%",
            textAlign: "center",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th rowSpan={2}>رقم القيد</th>
              <th rowSpan={2}>الشهر</th>
              <th rowSpan={2}>البيان</th>

              <th colSpan={2}>{part}</th>
            </tr>
            <tr>
              <th colSpan={1}>مدين</th>
              <th colSpan={1}>دائن</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: any, index) => (
              <tr key={item.id}>
                <td>{item.month_registration_number}</td>
                <td>{item.month_name}</td>
                <td>{item.description}</td>

                <td>{(item.name_pay == part && item.amount_pay) || 0}</td>
                <td>
                  {(item.name_received == part && item.amount_received) || 0}
                </td>
              </tr>
            ))}
            <tr>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
              <td>
                {data
                  .filter((item: any) => item.name_pay == part)
                  .reduce((acc: number, item: any) => acc + item.amount_pay, 0)}
              </td>
              <td>
                {data
                  .filter((item: any) => item.name_received == part)
                  .reduce(
                    (acc: number, item: any) => acc + item.amount_received,
                    0
                  )}
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
