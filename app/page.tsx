"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthLanding from "./(public)/auth/page";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has a token
    const hasToken = document.cookie.includes('token=');
    if (hasToken) {
      router.replace('/dashboard');
    }
  }, [router]);

  return <AuthLanding />;
}
