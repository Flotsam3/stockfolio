"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const DashboardClient = dynamic(() => import("../../dashboard/DashboardClient"), { ssr: false });

export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/check");
        if (!res.ok) {
          router.replace("/auth/login");
          return;
        }
        setIsLoading(false);
      } catch (error) {
        router.replace("/auth/login");
      }
    }
    checkAuth();
  }, [router]);

  if (isLoading) return <div>Loading...</div>;

  return <DashboardClient />;
}
