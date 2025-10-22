"use client";

import Details from "./Details";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function DetailsPage() {
  const params = useParams();
  const [companyName, setCompanyName] = useState<string>("");
  const id = params.id as string;

  useEffect(() => {
    // Fetch company name
    const getCompanyName = async () => {
      try {
        const response = await fetch(`/api/company?id=${id}`);
        const data = await response.json();
        setCompanyName(data.name || "");
      } catch (error) {
        console.error("Error fetching company name:", error);
      }
    };

    if (id) {
      getCompanyName();
    }
  }, [id]);

  if (!companyName) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return <Details id={id} name={companyName} />;
}
