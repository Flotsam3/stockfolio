export type SourceAmount = {
   amount: number;
   currency: string | null;
   asOf: string | null;
   source: "stockanalysis" | "manual";
};

export type ExchangeRate = {
   usdPerUnit: number;
   date: string;
   source: "ECB";
};

export type AmountDetails = SourceAmount & {
   fx: ExchangeRate | null;
};

export type AmountInUsd = AmountDetails & {
   usd: number | null;
};

export type GrowthForecast = {
   percent: number;
   source: "stockanalysis" | "finviz";
};

export type StockRefreshIssue = {
   code: "HTTP_ERROR" | "TIMEOUT" | "PARSE_ERROR" | "MISSING_DATA" | "FX_UNAVAILABLE";
   message: string;
};

export type StockAnalysisData = {
   ticker: string;
   quote: AmountInUsd;
   eps: AmountInUsd | null;
   peRatios: number[];
   growthForecast: GrowthForecast | null;
   analystTarget: AmountInUsd | null;
   upside: number | null;
   annualDividend: AmountInUsd | null;
   dividendYield: number | null;
   lastPaidDividend: AmountInUsd | null;
   issues: StockRefreshIssue[];
};
