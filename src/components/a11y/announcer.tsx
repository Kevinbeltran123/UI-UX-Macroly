"use client";

import { useEffect, useState } from "react";

export function Announcer() {
  const [polite, setPolite] = useState("");
  const [assertive, setAssertive] = useState("");

  useEffect(() => {
    const handler = (e: Event) => {
      const { message, priority } = (e as CustomEvent<{ message: string; priority: string }>).detail;
      if (priority === "assertive") {
        setAssertive(message);
        setTimeout(() => setAssertive(""), 500);
      } else {
        setPolite(message);
        setTimeout(() => setPolite(""), 500);
      }
    };
    document.addEventListener("a11y:announce", handler);
    return () => document.removeEventListener("a11y:announce", handler);
  }, []);

  return (
    <>
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {polite}
      </div>
      <div role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">
        {assertive}
      </div>
    </>
  );
}
