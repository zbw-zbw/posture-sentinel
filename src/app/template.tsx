"use client";

import { useEffect, useState } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(false), 0);
    const t2 = setTimeout(() => setVisible(true), 30);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div
      className="transition-all duration-300 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
      }}
    >
      {children}
    </div>
  );
}
