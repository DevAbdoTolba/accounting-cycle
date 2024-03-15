"use client";
import React, { ChangeEvent, useState, useEffect } from "react";

export default function Month() {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [data, setData] = useState<string[] | null>(null);

  const handleChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(event.target.value);

    fetch(`/api/sql/selectMonth?month=${event.target.value}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        console.log(data);
      });
  };

  return (
    <div>
      <select value={selectedOption} onChange={handleChange}>
        <option value="">Select...</option>

        <option value="العملاء">العملاء</option>
        <option value="الموردين">الموردين</option>
        <option value="البنك">البنك</option>
        <option value="الصندوق">الصندوق</option>
        <option value="المشتريات">المشتريات</option>
        <option value="المبيعات">المبيعات</option>
      </select>
      {data && data.length > 0 ? (
        <ul>
          {data.map((item: any) => (
            <li key={item.id}>
              {item.month_name} - {item.description} - {item.name_pay} -{" "}
              {item.name_received} - {item.amount_pay} - {item.amount_received}
            </li>
          ))}
        </ul>
      ) : data ? (
        "No data found"
      ) : (
        " Please select month"
      )}
    </div>
  );
}
