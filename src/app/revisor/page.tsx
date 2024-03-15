"use client";
import React from "react";

export default function Page() {
  const downloadFunction = () => {
    console.log(5);

    fetch("/api/sql/selectMonthByPart.ts")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      });
  };
}
