"use client";

import { useState } from "react";

export default function TestPage() {
  const [counter, setCounter] = useState(0);

  function handleClick() {
    console.log("Button clicked!");
    setCounter((prev) => prev + 1);
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Test Page</h1>
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        Increment
      </button>
      <p className="mt-4">Counter: {counter}</p>
    </div>
  );
}
