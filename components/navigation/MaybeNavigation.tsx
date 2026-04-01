"use client";

import { usePathname } from "next/navigation";
import Navigation from "./Navigation";

export default function MaybeNavigation() {
  const pathname = usePathname();
  if (!pathname) return null;

  // Hide navigation on the public/auth pages and on the root landing
  const hideNavbar = pathname === "/" || pathname.startsWith("/auth");
  if (hideNavbar) return null;

  return <Navigation />;
}
