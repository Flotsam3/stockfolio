import type { AmountDetails } from "@/types/stockAnalysis";

const usdFormat = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 5 });
const sourceFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 8 });

export function formatUsd(amount: number | null | undefined) {
   return amount == null ? "—" : usdFormat.format(amount);
}

export function describeStockAmount(original: AmountDetails | null | undefined, legacyValue?: number | null) {
   if (!original) return legacyValue == null ? undefined : `${sourceFormat.format(legacyValue)} · source currency unverified`;

   const parts = [`${sourceFormat.format(original.amount)} ${original.currency ?? "(source currency unknown)"}`];
   if (original.asOf) parts.push(original.asOf);
   if (original.fx) parts.push(`ECB rate ${original.fx.date}`);
   return parts.join(" · ");
}
