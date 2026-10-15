import "server-only";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const allowedFunctions = new Set([
    "INCOME_STATEMENT",
    "BALANCE_SHEET",
    "CASH_FLOW",
    "TIME_SERIES_MONTHLY_ADJUSTED",
]);

function json(body: unknown, status = 200) {
    return Response.json(body, {
        status,
        headers: { "Cache-Control": "private, no-store" },
    });
}

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return json({ error: "Not authenticated" }, 401);
        }

        const params = new URL(request.url).searchParams;
        const operation = params.get("function") || "";
        const symbol = (params.get("symbol") || "").trim().toUpperCase();
        if (
            params.getAll("function").length !== 1 ||
            params.getAll("symbol").length !== 1 ||
            [...params.keys()].some((key) => key !== "function" && key !== "symbol") ||
            !allowedFunctions.has(operation) ||
            !/^[A-Z0-9][A-Z0-9.-]{0,31}$/.test(symbol)
        ) {
            return json({ error: "Invalid fundamentals request" }, 400);
        }

        const apiKey = process.env.ALPHA_VANTAGE_KEY;
        if (!apiKey) {
            return json({ error: "Fundamentals service is not configured" }, 503);
        }

        const url = new URL("https://www.alphavantage.co/query");
        url.search = new URLSearchParams({ function: operation, symbol, apikey: apiKey }).toString();
        const response = await fetch(url, {
            cache: "no-store",
            signal: AbortSignal.timeout(10_000),
        });
        if (!response.ok) {
            return json({ error: "Fundamentals provider unavailable" }, response.status === 429 ? 429 : 502);
        }

        const data = await response.json();
        if (!data || typeof data !== "object" || data.Information || data.Note || data["Error Message"]) {
            return json({ error: "Fundamentals provider unavailable" }, 502);
        }

        if (operation === "TIME_SERIES_MONTHLY_ADJUSTED") {
            const series = data["Monthly Adjusted Time Series"];
            if (!series || typeof series !== "object" || Array.isArray(series)) {
                return json({ error: "Invalid fundamentals provider response" }, 502);
            }
            return json({ "Monthly Adjusted Time Series": series });
        }

        if (!Array.isArray(data.annualReports) || !Array.isArray(data.quarterlyReports)) {
            return json({ error: "Invalid fundamentals provider response" }, 502);
        }
        return json({ annualReports: data.annualReports, quarterlyReports: data.quarterlyReports });
    } catch {
        // Provider errors can include the request URL and API key. Never echo or log them.
        return json({ error: "Fundamentals provider unavailable" }, 502);
    }
}
