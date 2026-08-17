import { getEconomics } from "@/services/economics";
import type { EconomicsType } from "@/types/types";
import type { Dispatch, SetStateAction } from "react";

export async function prepareEconomics(setEconomics: Dispatch<SetStateAction<EconomicsType>>) {
   const { response } = await getEconomics();
   const economics = response?.[0];

   if (!economics) {
      throw new Error("No economics data available");
   }

   setEconomics(economics);
   return economics;
}
