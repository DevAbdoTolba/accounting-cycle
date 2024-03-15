"use client";
import React, { ChangeEvent, useEffect, useState } from "react";
import moment from "moment-timezone";

export default function Page() {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [name, setName] = useState<{
    pay: string;
    received: string;
  }>({
    pay: "",
    received: "",
  });
  const [amount, setAmount] = useState<{
    pay: string;
    received: string;
  }>({
    pay: "",
    received: "",
  });
  const [error, setError] = useState("");
  const [warn, setWarn] = useState("");
  const [message, setMessage] = useState([]);

  function validateFormData(formData) {
    const {
      month,
      description,
      name: { pay, received },
      amount: { pay: amountPay, received: amountReceived },
      date,
    } = formData;

    if (!month) {
      setError("Month is required");
      return;
    }

    if (!description) {
      setError("Description is required");
      return;
    }

    if (!pay) {
      setError("Pay name is required");
      return;
    }

    if (!received) {
      setError("Received name is required");
      return;
    }

    if (!amountPay) {
      setError("Pay amount is required");
      return;
    }

    if (!amountReceived) {
      setError("Received amount is required");
      return;
    }

    if (!date) {
      setError("Date is required");
      return;
    }

    // Add more validation as needed
  }

  useEffect(() => {
    // check if poth values are not empty and are equal
    if (amount.pay && amount.received && amount.pay !== amount.received) {
      setWarn("Pay and received amounts are not equal");
    } else {
      setWarn("");
    }
  }, [amount.pay, amount.received]);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(event.target.value);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    setError("");

    let date = moment().tz("Africa/Cairo"); // Get current date and time in Egypt's time zone
    let formattedDate = date.format("YYYY-MM-DD HH:mm:ss"); // Format the date and time

    const formData = {
      month: selectedOption,
      description: description,
      name: { pay: name.pay, received: name.received },
      amount: { pay: amount.pay, received: amount.received },
      date: formattedDate,
    };

    // Usage
    try {
      validateFormData(formData);
      // If we reach this point, all data is valid
      console.log("All data is valid");
      fetch(
        "/api/sql/insertRow?month=" +
          selectedOption +
          "&description=" +
          description +
          "&name_pay=" +
          name.pay +
          "&name_received=" +
          name.received +
          "&amount_pay=" +
          amount.pay +
          "&amount_received=" +
          amount.received
      )
        .then((res) => res.json())
        .then((data) => {
          console.log(data.message);

          setMessage(
            [].concat(
              data.message,
              selectedOption,
              description,
              name.pay,
              name.received,
              amount.pay,
              amount.received
            )
          );
        });
    } catch (error) {
      // If an error is thrown, some data was invalid
      console.error(error.message);
    }

    console.log(formData);
  };
  return (
    <>
      <form onSubmit={handleSubmit}>
        <label htmlFor="month"></label>
        <select
          required
          id="month"
          value={selectedOption}
          onChange={handleChange}
        >
          <option value="">الشهر</option>

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
        <hr />
        <input
          required
          type="text"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
          }}
          placeholder="البيان"
        />
        <hr />
        <>
          <h5>المدين</h5>
          <select
            required
            value={name.received}
            onChange={(e) => {
              const newValue = { ...name, received: e.target.value };
              setName({ ...newValue });
            }}
          >
            <option value="">القيد المدين...</option>

            <option value="العملاء">العملاء</option>
            <option value="الموردين">الموردين</option>
            <option value="البنك">البنك</option>
            <option value="الصندوق">الصندوق</option>
            <option value="المشتريات">المشتريات</option>
            <option value="المبيعات">المبيعات</option>
          </select>
          <input
            required
            type="number"
            value={amount.received}
            onChange={(e) => {
              const newValue = { ...amount, received: e.target.value };

              setAmount({ ...newValue });
            }}
            placeholder="المبلغ المدين"
          />
        </>

        <hr />

        <>
          <h5>الدائن</h5>
          <select
            required
            value={name.pay}
            onChange={(e) => {
              const newValue = { ...name, pay: e.target.value };
              setName({ ...newValue });
            }}
          >
            <option value="">القيد الدائن...</option>

            <option value="العملاء">العملاء</option>
            <option value="الموردين">الموردين</option>
            <option value="البنك">البنك</option>
            <option value="الصندوق">الصندوق</option>
            <option value="المشتريات">المشتريات</option>
            <option value="المبيعات">المبيعات</option>
          </select>
          <input
            required
            type="number"
            value={amount.pay}
            onChange={(e) => {
              const newValue = { ...amount, pay: e.target.value };
              setAmount({ ...newValue });
            }}
            placeholder="المبلغ الدائن"
          />
        </>
        <br />
        <input required type="submit" value="add" />
      </form>
      {error && <div className="error">{error}</div>}
      {warn && <div className="warn">{warn}</div>}
      {message && (
        <div className="message">
          {message.map((msg, index) => (
            <p key={index}>{msg}</p>
          ))}
        </div>
      )}
    </>
  );
}
