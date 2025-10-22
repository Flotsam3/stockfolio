import React from 'react';
import "../globals.css";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-100">
      {children}
    </div>
  );
}
