// app/(app)/dashboard/page.tsx
"use client";

import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect } from "react";

const DashboardClient = dynamic(() => import("../../dashboard/DashboardClient"), { ssr: false });

export default function Dashboard() {
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log("🏠 Dashboard - Status:", status);
    console.log("🏠 Dashboard - Session:", session);
  }, [status, session]);

  if (status === "loading") {
    console.log("⏳ Loading session...");
    return (
      <div className="min-h-screen bg-[#161616] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#facc15] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    console.log("❌ Not authenticated - showing link");
    return (
      <div className="min-h-screen bg-[#161616] flex flex-col items-center justify-center gap-4 text-white">
        <p>You need to be logged in to view this page.</p>
        <Link href="/auth/login" className="px-6 py-2 bg-[#facc15] text-[#33313c] rounded-lg font-semibold">
          Go to Login
        </Link>
      </div>
    );
  }

  if (status === "authenticated") {
    console.log("✅ Authenticated - showing dashboard");
    return <DashboardClient />;
  }

  return null;
}