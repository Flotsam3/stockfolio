"use client";

import Link from "next/link";

export default function AuthLanding() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl mb-6">Welcome to Stockfolio</h1>
      <div className="flex gap-4">
        <Link href="/auth/register" className="btn">Register</Link>
        <Link href="/auth/login" className="btn">Login</Link>
      </div>
    </div>
  );
}
