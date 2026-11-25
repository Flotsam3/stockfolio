import type { AmountDetails } from "@/types/stockAnalysis";

const usdFormats = {
   2: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }),
   5: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 5 }),
};
const sourceFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 8 });

export function formatUsd(amount: number | null | undefined, maximumFractionDigits: keyof typeof usdFormats = 5) {
   return amount == null ? "—" : usdFormats[maximumFractionDigits].format(amount);
}

export function describeStockAmount(original: AmountDetails | null | undefined, legacyValue?: number | null) {
   if (!original) return legacyValue == null ? undefined : `${sourceFormat.format(legacyValue)} · source currency unverified`;

   const parts = [`${sourceFormat.format(original.amount)} ${original.currency ?? "(source currency unknown)"}`];
   if (original.asOf) parts.push(original.asOf);
   if (original.fx) parts.push(`ECB rate ${original.fx.date}`);
   return parts.join(" · ");
}
