export async function fetchPERatios(ticker: string): Promise<{ ticker: string, peRatios: string[], epsDiluted: string, realTimePrice: string | null, epsGrowth5Y: string | null }> {
  const response = await fetch(`/updateWatchlists?ticker=${ticker}`);
  if (!response.ok) throw new Error('Failed to fetch PE ratios');
  const data = await response.json();
  return { ticker: data.ticker, peRatios: data.peRatios, epsDiluted: data.epsDiluted, realTimePrice: data.realTimePrice, epsGrowth5Y: data.epsGrowth5Y };
}