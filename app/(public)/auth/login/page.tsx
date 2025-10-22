"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Logged in");
        router.push("/dashboard"); // Redirect to dashboard after successful login
      } else {
        setMsg(data.error || "Login failed");
      }
    } catch (error) {
      setMsg(String(error));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="flex flex-col gap-3 w-80">
        <h2 className="text-xl">Login</h2>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" />
        <button className="btn" type="submit">Login</button>
        {msg && <p>{msg}</p>}
      </form>
    </div>
  );
}
