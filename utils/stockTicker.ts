const tickerPattern = /^(?:([A-Z0-9]{1,16}):)?([A-Z0-9][A-Z0-9.-]{0,31})$/;

export function parseStockTicker(input: string) {
   const ticker = input.trim().toUpperCase();
   const match = tickerPattern.exec(ticker);
   if (!match) return null;

   const exchange = match[1] || undefined;
   const symbol = match[2];
   const path = exchange ? `/quote/${exchange.toLowerCase()}/${symbol}/` : `/stocks/${symbol.toLowerCase()}/`;
   return { ticker, exchange, symbol, path };
}
