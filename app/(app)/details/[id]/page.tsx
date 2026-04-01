// app/details/[id]/page.tsx
"use client";

import Details from "@/components/details/Details";
import { useParams, useSearchParams } from "next/navigation";

export default function DetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const id = params.id as string;
  const name = searchParams.get('name') || "";

  if (!name) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return <Details id={id} name={name} />;
}