"use client"

import React, {useState} from 'react';

export default function Details({ id, name }: { id: string, name: string }) {
    const [expand, setExpand] = useState<boolean | string>(false);
    
    function handleClick(evt: React.MouseEvent<HTMLHeadingElement>){
        const target = evt.target as HTMLHeadingElement;
        if (!expand) return setExpand(target.id);
        setExpand(false);
    }

  return (
    <div className='flex flex-col items-center min-h-[calc(100vh-86px)] pt-5 pb-8 bg-neutral-300 [&>div>h3]:font-bold'>
        <h1 className='pt-3 text-2xl font-bold text-center'>{name} Technical Analysis</h1>
        <div className='flex flex-col w-[70vw] mt-5 bg-zinc-200 rounded-md'>
            <h3 className='text-center my-1 text-orange-500 text-2xl'>Trend Identification</h3>
            <div>
                <div className='px-5'>
                    <h2 onClick={handleClick} id='sma' className='text-center my-2 text-sky-600 font-bold text-xl cursor-pointer'>SMA (Simple Moving Average)</h2>
                    <a href={`https://de.finance.yahoo.com/chart/${id}`} target='_blank' className='block text-center font-bold italic mb-2'>Evaluate on Yahoo Finance</a>
                    <div className={expand === "sma" ? "block" : "hidden"}>
                        <p><span className='font-bold'>Short-Term Trends:</span> For identifying short-term trends, use a smaller time period, such as 10-20 days.</p>
                        <p><span className='font-bold'>Medium-Term Trends:</span> To observe medium-term trends, you might opt for a 50-day SMA.</p>
                        <p><span className='font-bold'>Long-Term Trends:</span> Long-term trends are commonly analyzed using a 200-day SMA.</p>
                        <h3 className='py-3 text-center font-bold'>Data Frequency</h3>
                        <p>Use daily closing prices for precision.</p>
                        <p><span className='font-bold'>Intra-Day Analysis:</span> For short-term trading, you might even consider intra-day values (e.g., hourly or 15-minute intervals).</p>
                        <p>If you're analyzing a one-month SMA, daily values are the most straightforward starting point.</p>
                        <h3 className='py-3 text-center font-bold'>Evaluation</h3>
                        <h4 className='py-3 text-center font-bold'>Price Position Relative to SMA</h4>
                        <p>If the price is consistently above the SMA, it indicates an uptrend.</p>
                        <p>If the price is consistently below the SMA, it indicates a downtrend.</p>
                        <h4 className='py-3 text-center font-bold'>Slope of the SMA</h4>
                        <p>An upward-sloping SMA confirms an uptrend.</p>
                        <p>A downward-sloping SMA confirms a downtrend.</p>
                        <p>A flat SMA often suggests a sideways or range-bound market.</p>
                        <h4 className='py-3 text-center font-bold'>Crossovers</h4>
                        <p>If the price crosses above the SMA from below, it might indicate the start of an uptrend.</p>
                        <p>If the price crosses below the SMA from above, it might indicate the start of a downtrend.</p>
                        <p>If the current price {">"} SMA, it signals an uptrend.</p>
                        <p>If the current price {"<"} SMA, it signals a downtrend.</p>
                        <p>When the 50-day SMA crosses above the 200-day SMA (Golden Cross), it's a bullish signal.</p>
                        <p>When the 50-day SMA crosses below the 200-day SMA (Death Cross), it's bearish.</p>
                    </div>
                    <h2 onClick={handleClick} id='ema' className='text-center my-2 text-sky-600 font-bold text-xl cursor-pointer'>EMA (Exponential Moving Average)</h2>
                    <a href={`https://de.finance.yahoo.com/chart/${id}`} target='_blank' className='block text-center font-bold italic mb-2'>Evaluate on Yahoo Finance</a>
                    <div className={expand === "ema" ? "block" : "hidden"}>
                        <p>EMA places more weight on recent prices, making it more responsive to recent market movements.</p>
                        <p>Reacts faster to price changes, helping identify trends and reversals earlier than SMA.</p>
                        <p>Particularly useful in volatile markets where timely trend recognition is crucial.</p>
                        <p>Can generate more false signals during periods of market noise due to its higher sensitivity.</p>
                        <p className='mt-2'><span className='font-bold'>Short-Term Trends:</span> For identifying short-term trends, use a smaller time period, such as 10-20 days.</p>
                        <p><span className='font-bold'>Medium-Term Trends:</span> To observe medium-term trends, you might opt for a 50-day EMA.</p>
                        <p><span className='font-bold'>Long-Term Trends:</span> Long-term trends are commonly analyzed using a 200-day EMA.</p>
                        <h3 className='py-3 text-center font-bold'>Data Frequency</h3>
                        <p>Use daily closing prices for precision.</p>
                        <p><span className='font-bold'>Intra-Day Analysis:</span> For short-term trading, you might even consider intra-day values (e.g., hourly or 15-minute intervals).</p>
                        <p>If you're analyzing a one-month EMA, daily values are the most straightforward starting point.</p>
                        <h3 className='py-3 text-center font-bold'>Evaluation</h3>
                        <h4 className='py-3 text-center font-bold'>Price Position Relative to EMA</h4>
                        <p>If the price is consistently above the EMA, it indicates an uptrend.</p>
                        <p>If the price is consistently below the EMA, it indicates a downtrend.</p>
                        <h4 className='py-3 text-center font-bold'>Slope of the EMA</h4>
                        <p>An upward-sloping EMA confirms an uptrend.</p>
                        <p>A downward-sloping EMA confirms a downtrend.</p>
                        <p>A flat EMA often suggests a sideways or range-bound market.</p>
                        <h4 className='py-3 text-center font-bold'>Crossovers</h4>
                        <p>If the price crosses above the EMA from below, it might indicate the start of an uptrend.</p>
                        <p>If the price crosses below the EMA from above, it might indicate the start of a downtrend.</p>
                        <p>If the current price {">"} EMA, it signals an uptrend.</p>
                        <p>If the current price {"<"} EMA, it signals a downtrend.</p>
                        <p>When the 50-day EMA crosses above the 200-day EMA (Golden Cross), it's a bullish signal.</p>
                        <p>When the 50-day EMA crosses below the 200-day EMA (Death Cross), it's bearish.</p>
                    </div>
                    <h2 onClick={handleClick} id='adx' className='text-center my-2 text-sky-600 font-bold text-xl cursor-pointer'>ADX (Average Directional Index)</h2>
                    <a href={`https://de.finance.yahoo.com/chart/${id}`} target='_blank' className='block text-center font-bold italic mb-2'>Evaluate on Yahoo Finance</a>
                    <div className={expand === "adx" ? "block" : "hidden"}>
                        <p> ADX measures the strength of a trend, regardless of its direction, on a scale from 0 to 100</p>
                        <p>It's calculated based on the difference between a positive directional index (+DI) and a negative directional index (-DI).</p>
                        <h3 className='py-3 text-center font-bold'>ADX Values</h3>
                        <p>0-20: Weak or no trend (ranging market).</p>
                        <p>20-25: Indeterminate zone (the trend may be forming or fading).</p>
                        <p>25-50: Strong trend (directional movement is significant).</p>
                        <p>50-75: Very strong trend.</p>
                        <p>75-100: Extremely strong trend (rare and often unsustainable).</p>
                        <h3 className='py-3 text-center font-bold'>Evaluation</h3>
                        <p>If +DI is greater than -DI, the trend is upward (bullish).</p>
                        <p>If -DI is greater than +DI, the trend is downward (bearish).</p>
                    </div>
                </div>
            </div>
        </div>
        <div className='flex flex-col w-[70vw] mt-5 bg-zinc-200 rounded-md'>
            <h3 className='text-center my-1 text-orange-500 text-2xl'>Momentum and Overbought / Oversold Conditions</h3>
            <div>
                <div className='px-5'>
                    <h2 onClick={handleClick} id='rsi' className='text-center my-2 text-sky-600 font-bold text-xl cursor-pointer'>RSI (Relative Strength Index)</h2>
                    <a href={`https://de.finance.yahoo.com/chart/${id}`} target='_blank' className='block text-center font-bold italic mb-2'>Evaluate on Yahoo Finance</a>
                    <div className={expand === "rsi" ? "block" : "hidden"}>

                        <h3 className='py-3 text-center font-bold'>Time Frame Analysis</h3>

                        <p className='font-bold'>Short Term Trends</p>

                        <p>RSI Period: Use 7-9 for faster, more sensitive signals.</p>
                        <p>Levels: Focus on 70/30 thresholds for overbought/oversold.</p>
                        <p>Data Frequency: Use intra-day values (e.g., hourly, 15-minute intervals) for day trading or swing trading.</p>
                        <p className='font-bold'>Medium-Term Trends:</p>

                        <p>RSI Period: Use the standard 14-period RSI.</p>
                        <p>Levels: Pay attention to 60/40 levels to identify trend strength or weakness.</p>
                        <p>Data Frequency: Use daily closing prices for consistency.</p>
                        <p className='font-bold'>Long-Term Trends:</p>

                        <p>RSI Period: Use 21 or higher to reduce noise and smooth signals.</p>
                        <p>Levels: Adjust thresholds to 80/20 for strong trends, avoiding premature signals.</p>
                        <p>Data Frequency: Use weekly or monthly data for broader trend analysis.</p>

                        <h3 className='py-3 text-center font-bold'>Evaluation</h3>

                        <p className='font-bold'>Overbought and Oversold Levels:</p>

                        <p>Overbought: RSI above 70 (standard) or 80 (long-term trends) may indicate a pullback is near.</p>
                        <p>Oversold: RSI below 30 (standard) or 20 (long-term trends) may indicate a potential rebound.</p>
                        <p className='font-bold'>Trend Strength:</p>

                        <p>RSI consistently above 50: Indicates strength in an uptrend.</p>
                        <p>RSI consistently below 50: Signals a downtrend or weakness.</p>
                        <p className='font-bold'>Slope of the RSI Line:</p>

                        <p>Upward slope: Strengthening momentum.</p>
                        <p>Downward slope: Weakening momentum.</p>
                        <p className='font-bold'>Divergences</p>

                        <p>Bullish Divergence: RSI rises while price falls, indicating a potential upward reversal.</p>
                        <p>Bearish Divergence: RSI falls while price rises, signaling a possible downward reversal.</p>

                        <h3 className='py-3 text-center font-bold'>Signal Confirmation</h3>

                        <p className='font-bold'>Overbought/Oversold Zones:</p>

                        <p>RSI {">"} 70 (or 80): Wait for confirmation (e.g., price reversal patterns) before acting.</p>
                        <p>RSI {"<"} 30 (or 20): Look for signals like strong bullish candlesticks or higher volume.</p>
                        <p className='font-bold'>Crossing the Midline (50):</p>

                        <p>RSI crossing above 50: Indicates a strengthening uptrend.</p>
                        <p>RSI crossing below 50: Suggests weakening momentum or potential downtrend.</p>
                        <p className='font-bold'>Confluence with Other Indicators:</p>

                        <p>Combine RSI with moving averages, trendlines, or MACD to confirm signals and reduce false positives.</p>
                    </div>
                    <h2 onClick={handleClick} id='macd' className='text-center my-2 text-sky-600 font-bold text-xl cursor-pointer'>MACD (Moving Average Convergence Divergence)</h2>
                    <a href={`https://de.finance.yahoo.com/chart/${id}`} target='_blank' className='block text-center font-bold italic mb-2'>Evaluate on Yahoo Finance</a>
                    <div className={expand === "macd" ? "block" : "hidden"}>
                        <h3 className='py-3 text-center font-bold'>Time Frame Analysis</h3>

                        <p className='font-bold'>Short Term Trends</p>

                        <p>Settings: Use faster parameters (e.g., 8, 18, 5) for quick responsiveness.</p>
                        <p>Data Frequency: Employ intra-day data (e.g., hourly or 15-minute intervals) for day or swing trading.</p>
                        <p>Focus: Look for rapid crossovers or divergence signals to catch smaller price movements.</p>

                        <p className='font-bold'>Medium-Term Trends:</p>

                        <p>Settings: Use standard parameters (12, 26, 9), balancing sensitivity and reliability.</p>
                        <p>Data Frequency: Analyze daily closing prices for consistency.</p>
                        <p>Focus: Observe crossovers and histogram changes to identify trend shifts.</p>

                        <p className='font-bold'>Long-Term Trends:</p>

                        <p>Settings: Adjust parameters to slower settings (e.g., 26, 52, 18) to smooth noise.</p>
                        <p>Data Frequency: Use weekly or monthly data to assess broader market trends.</p>
                        <p>Focus: Rely on signal line crossovers and prolonged histogram direction to evaluate market cycles.</p>

                        <h3 className='py-3 text-center font-bold'>Evaluation</h3>

                        <p className='font-bold'>MACD Line and Signal Line Relationship:</p>

                        <p>MACD Line Crossing Above Signal Line: Bullish signal (potential uptrend).</p>
                        <p>MACD Line Crossing Below Signal Line: Bearish signal (potential downtrend).</p>
                        <p>Wider Separation (Divergence): Stronger trend momentum.</p>
                        <p>Narrow Separation (Convergence): Weakening trend or possible reversal.</p>

                        <p className='font-bold'>Histogram Analysis:</p>

                        <p>Positive Histogram: Indicates bullish momentum.</p>
                        <p>Negative Histogram: Suggests bearish momentum.</p>
                        <p>Increasing Bars: Strengthening momentum in the respective direction.</p>
                        <p>Decreasing Bars: Weakening momentum or trend reversal.</p>

                        <p className='font-bold'>Midline (Zero Line) Cross:</p>

                        <p>MACD Crossing Above Zero: Confirms bullish trend.</p>
                        <p>MACD Crossing Below Zero: Confirms bearish trend.</p>
                        <p>Watch for confluence with price breaking significant support/resistance levels.</p>

                        <h3 className='py-3 text-center font-bold'>Signal Confirmation</h3>

                        <p className='font-bold'>Crossovers</p>

                        <p><span className='font-bold'>Bullish Crossover:</span> MACD line crosses above the signal line.</p>
                        <p>Stronger if accompanied by an increase in histogram bars and price breaking resistance.</p>
                        <p><span className='font-bold'>Bearish Crossover:</span> MACD line crosses below the signal line.</p>
                        <p>Stronger if accompanied by a decrease in histogram bars and price breaking support.</p>

                        <p className='font-bold'>Divergences</p>

                        <p>Bullish Divergence: MACD rises while price falls (potential reversal up).</p>
                        <p>Bearish Divergence: MACD falls while price rises (potential reversal down).</p>

                        <p className='font-bold'>Histogram Patterns</p>

                        <p>Look for patterns like rounding tops/bottoms or sharp reversals in the histogram to anticipate momentum changes.</p>

                    </div>
                    <h2 onClick={handleClick} id='stoch' className='text-center my-2 text-sky-600 font-bold text-xl cursor-pointer'>STOCH (Stochastic Oscillator)</h2>
                    <a href={`https://de.finance.yahoo.com/chart/${id}`} target='_blank' className='block text-center font-bold italic mb-2'>Evaluate on Yahoo Finance</a>
                    <div className={expand === "stoch" ? "block" : "hidden"}>
                        <h3 className='py-3 text-center font-bold'>Time Frame Analysis</h3>

                        <p className='font-bold'>Short Term Trends</p>

                        <p>Settings: Use a smaller %K period (e.g., 5, 3, 3) for quicker signals.</p>
                        <p>Data Frequency: Utilize intra-day data (e.g., hourly, 15-minute) for short-term trading.</p>
                        <p>Focus: Look for rapid changes in overbought (above 80) and oversold (below 20) levels to capture quick reversals.</p>

                        <p className='font-bold'>Medium-Term Trends:</p>

                        <p>Settings: Use the standard %K and %D settings (14, 3, 3) to balance sensitivity and reliability.</p>
                        <p>Data Frequency: Rely on daily closing prices for consistency.</p>
                        <p>Focus: Observe sustained movements above/below 50 to gauge momentum strength.</p>

                        <p className='font-bold'>Long-Term Trends:</p>

                        <p>Settings: Adjust to smoother parameters (e.g., 21, 5, 5) for reduced noise.</p>
                        <p>Data Frequency: Use weekly or monthly data to assess broader market trends.</p>
                        <p>Focus: Look for prolonged periods in overbought/oversold zones to confirm sustained trends.</p>

                        <h3 className='py-3 text-center font-bold'>Evaluation</h3>

                        <p className='font-bold'>Overbought and Oversold Zones:</p>

                        <p className='font-bold'>Overbought (Above 80):</p>
                        <p>Indicates potential price reversal or correction.</p>
                        <p>Validity increases if combined with bearish divergence or resistance testing.</p>

                        <p className='font-bold'>Oversold (Below 20):</p>

                        <p>Suggests potential price rebound.</p>
                        <p>Stronger signal when paired with bullish divergence or support levels.</p>

                        <p className='font-bold'>Crossovers</p>
                        
                        <p>Bullish Crossover: %K line crosses above %D line, especially in oversold territory.</p>
                        <p>Bearish Crossover: %K line crosses below %D line, especially in overbought territory.</p>

                        <p className='font-bold'>Midline (50)</p>

                        <p>Movement above 50 suggests increasing bullish momentum.</p>
                        <p>Movement below 50 indicates strengthening bearish momentum.</p>

                        <h3 className='py-3 text-center font-bold'>Signal Confirmation</h3>

                        <p className='font-bold'>Divergences</p>

                        <p>Bullish Divergence: Oscillator rises while price falls, signaling potential reversal upward.</p>
                        <p>Bearish Divergence: Oscillator falls while price rises, signaling potential reversal downward.</p>

                        <p className='font-bold'>Zone Persistence:</p>

                        <p>If the oscillator remains above 80 or below 20 for extended periods, it indicates a strong, sustained trend.</p>
                        <p>Example: A prolonged overbought condition may signal a powerful uptrend, not just an imminent reversal.</p>
                        
                    </div>
                </div>
            </div>
        </div>
        <div className='flex flex-col w-[70vw] mt-5 bg-zinc-200 rounded-md'>
            <h3 className='text-center my-1 text-orange-500 text-2xl'>Volatility and Risk Assessment</h3>
            <div>
                <div className='px-5'>
                    <h2 onClick={handleClick} id='atr' className='text-center my-2 text-sky-600 font-bold text-xl cursor-pointer'>ATR (Average True Range)</h2>
                    <a href={`https://de.finance.yahoo.com/chart/${id}`} target='_blank' className='block text-center font-bold italic mb-2'>Evaluate on Yahoo Finance</a>
                    <div className={expand === "atr" ? "block" : "hidden"}>
                        <h3 className='py-3 text-center font-bold'>Time Frame Analysis</h3>

                        <p className='font-bold'>Short-Term Trends</p>
                        <p>Settings: Use a shorter ATR period (e.g., 7 or 10) for more responsive volatility signals.</p>
                        <p>Data Frequency: Apply intra-day data (e.g., hourly or 15-minute intervals) to assess short-term price fluctuations.</p>
                        <p>Focus: Identify high-volatility periods to gauge risk or set tight stop-loss levels for day trading.</p>

                        <p className='font-bold'>Medium-Term Trends</p>
                        <p>Settings: Stick to the standard 14-period ATR for balanced sensitivity and reliability.</p>
                        <p>Data Frequency: Use daily closing prices to understand intermediate volatility levels.</p>
                        <p>Focus: Adjust position sizes or stops based on average daily volatility over weeks.</p>

                        <p className='font-bold'>Long-Term Trends</p>
                        <p>Settings: Increase the ATR period (e.g., 20 or 50) to smooth noise and assess broader trends.</p>
                        <p>Data Frequency: Utilize weekly or monthly data to understand overall market volatility.</p>
                        <p>Focus: Set wider stop-loss levels or evaluate risk in sustained trends.</p>

                        <h3 className='py-3 text-center font-bold'>Evaluation</h3>

                        <p className='font-bold'>Volatility Measurement</p>
                        <p>Higher ATR values indicate increased market volatility.</p>
                        <p>Lower ATR values suggest decreased volatility or consolidation.</p>

                        <p className='font-bold'>Trend Context</p>
                        <p>Rising ATR during a trend indicates strengthening momentum.</p>
                        <p>Falling ATR in a trend may signal weakening momentum or consolidation.</p>

                        <p className='font-bold'>Absolute Value</p>
                        <p>ATR is non-directional; it doesn't indicate trend direction but provides insight into price movement magnitude.</p>
                        <p>Use ATR values relative to historical norms for the specific asset to assess whether current volatility is high or low.</p>

                        <h3 className='py-3 text-center font-bold'>Signal Confirmation</h3>

                        <p className='font-bold'>Stop-Loss Placement</p>
                        <p>Place stops beyond 1-2x the ATR value from the entry price to account for normal price swings and avoid being prematurely stopped out.</p>
                        <p>Example: If ATR is $1.50, set a stop-loss $3 away (2x ATR) for long-term trades.</p>

                        <p className='font-bold'>Breakout Confirmation</p>
                        <p>A sudden spike in ATR often confirms a breakout, suggesting the price is about to make a significant move.</p>
                        <p>Low ATR during consolidation may precede a breakout; watch for the ATR to rise as price moves sharply.</p>

                        <p className='font-bold'>Trend Analysis</p>
                        <p>Combine with directional indicators like SMA, MACD, or ADX to determine whether increasing volatility supports or challenges the current trend.</p>
                        
                    </div>
                    <h2 onClick={handleClick} id='bbands' className='text-center my-2 text-sky-600 font-bold text-xl cursor-pointer'>BBANDS (Bollinger Bands)</h2>
                    <a href={`https://de.finance.yahoo.com/chart/${id}`} target='_blank' className='block text-center font-bold italic mb-2'>Evaluate on Yahoo Finance</a>
                    <div className={expand === "bbands" ? "block" : "hidden"}>

                        <h3 className='py-3 text-center font-bold'>Time Frame Analysis</h3>

                        <p className='font-bold'>Short-Term Trends</p>
                        <p>Settings: Use a shorter moving average period (e.g., 10-15) to make Bollinger Bands more responsive to quick price changes.</p>
                        <p>Data Frequency: Apply intra-day data (e.g., hourly or 15-minute intervals) to analyze short-term price volatility.</p>
                        <p>Focus: Look for price touching or breaking the upper or lower bands to identify rapid moves or potential reversals.</p>

                        <p className='font-bold'>Medium-Term Trends</p>
                        <p>Settings: Use the standard 20-period moving average and 2 standard deviations for a balanced approach.</p>
                        <p>Data Frequency: Analyze daily closing prices to capture broader price swings over weeks.</p>
                        <p>Focus: Evaluate how price interacts with bands to identify breakouts or continuation patterns.</p>

                        <p className='font-bold'>Long-Term Trends</p>
                        <p>Settings: Use a longer moving average period (e.g., 50) and possibly wider deviations (2.5) to smooth volatility.</p>
                        <p>Data Frequency: Use weekly or monthly data for a broader view of market behavior.</p>
                        <p>Focus: Assess long-term price positioning relative to the bands to evaluate major trend strength or reversal zones.</p>

                        <h3 className='py-3 text-center font-bold'>Evaluation</h3>

                        <p className='font-bold'>Price Interaction with Bands</p>
                        <p>When price touches the upper band, it suggests overbought conditions or resistance.</p>
                        <p>When price touches the lower band, it signals oversold conditions or support.</p>
                        <p>Price staying outside the bands for an extended period indicates a strong trend in that direction.</p>

                        <p className='font-bold'>Band Width</p>
                        <p>Widening bands indicate increasing volatility, often seen before or during a breakout.</p>
                        <p>Narrowing bands (squeeze) suggest decreasing volatility, often preceding a significant move.</p>

                        <p className='font-bold'>Middle Band (SMA)</p>
                        <p>The middle band acts as a dynamic support/resistance level.</p>
                        <p>Price crossing above the middle band suggests bullish momentum; crossing below indicates bearish momentum.</p>

                        <h3 className='py-3 text-center font-bold'>Signal Confirmation</h3>

                        <p className='font-bold'>Breakouts</p>
                        <p>A breakout occurs when price moves outside the upper or lower bands, often signaling strong momentum in that direction.</p>
                        <p>Breakouts are not necessarily reversal signals; confirmation with volume or other indicators is recommended.</p>

                        <p className='font-bold'>Reversions</p>
                        <p>Price frequently reverts to the mean (middle band) after touching the outer bands, especially in range-bound markets.</p>
                        <p>Look for confirmation from candlestick patterns or oscillators like RSI.</p>

                    </div>
                </div>
            </div>
        </div>
        <div className='flex flex-col w-[70vw] mt-5 bg-zinc-200 rounded-md'>
            <h3 className='text-center my-1 text-orange-500 text-2xl'>Volume Confirmation</h3>
            <div>
                <div className='px-5'>
                    <h2 onClick={handleClick} id='obv' className='text-center my-2 text-sky-600 font-bold text-xl cursor-pointer'>OBV (On-Balance Volume)</h2>
                    <a href={`https://de.finance.yahoo.com/chart/${id}`} target='_blank' className='block text-center font-bold italic mb-2'>Evaluate on Yahoo Finance</a>
                    <div className={expand === "obv" ? "block" : "hidden"}>
                        <h3 className='py-3 text-center font-bold'>Time Frame Analysis</h3>

                        <p className='font-bold'>Short-Term Trends</p>
                        <p>Settings: Use OBV with intra-day data (e.g., hourly or 15-minute intervals) to assess short-term accumulation or distribution.</p>
                        <p>Data Frequency: Analyze OBV alongside price action for quick insights into volume-driven momentum shifts.</p>
                        <p>Focus: Spot rapid OBV divergences with price to predict near-term reversals.</p>

                        <p className='font-bold'>Medium-Term Trends</p>
                        <p>Settings: Use OBV on daily closing prices for clearer trends in accumulation/distribution over weeks.</p>
                        <p>Data Frequency: Analyze how OBV aligns with daily price movements to confirm medium-term trends.</p>
                        <p>Focus: Identify sustained increases or decreases in OBV to validate price breakouts or breakdowns.</p>

                        <p className='font-bold'>Long-Term Trends</p>
                        <p>Settings: Use OBV on weekly or monthly timeframes for insights into institutional accumulation or distribution.</p>
                        <p>Data Frequency: Focus on OBV's trendline over extended periods to understand the strength of long-term price trends.</p>
                        <p>Focus: Track divergences over months to predict major reversals or continuation of trends.</p>

                        <h3 className='py-3 text-center font-bold'>Evaluation</h3>

                        <p className='font-bold'>Trend Confirmation</p>
                        <p>If OBV rises alongside price, it confirms the uptrend as driven by strong buying volume.</p>
                        <p>If OBV falls while price increases, it suggests weakness in the uptrend due to low volume support (potential reversal).</p>
                        <p>If OBV falls alongside price, it confirms the downtrend driven by strong selling volume.</p>

                        <p className='font-bold'>Divergences</p>
                        <p>Positive Divergence: OBV rises while price falls, signaling potential accumulation and a future upward reversal.</p>
                        <p>Negative Divergence: OBV falls while price rises, signaling potential distribution and a future downward reversal.</p>

                        <p className='font-bold'>Volume Shifts</p>
                        <p>Sustained increases in OBV indicate strong buyer interest.</p>
                        <p>Sustained decreases in OBV indicate strong seller dominance.</p>

                        <h3 className='py-3 text-center font-bold'>Signal Confirmation</h3>

                        <p className='font-bold'>Breakouts</p>
                        <p>If OBV breaks above a resistance level, it suggests a strong bullish breakout.</p>
                        <p>If OBV breaks below a support level, it indicates a bearish breakdown.</p>

                        <p className='font-bold'>Trendlines</p>
                        <p>Draw trendlines on OBV to track its momentum independently of price. A break in OBV trendline often precedes price movement.</p>
                    </div>
                    <h2 onClick={handleClick} id='vwap' className='text-center my-2 text-sky-600 font-bold text-xl cursor-pointer'>VWAP (Volume Weighted Average Price)</h2>
                    <a href={`https://de.finance.yahoo.com/chart/${id}`} target='_blank' className='block text-center font-bold italic mb-2'>Evaluate on Yahoo Finance</a>
                    <div className={expand === "vwap" ? "block" : "hidden"}>
                        <h3 className='py-3 text-center font-bold'>Time Frame Analysis</h3>

                        <p className='font-bold'>Short-Term Trends</p>
                        <p>Settings: VWAP is typically calculated intraday, resetting each day, making it highly suited for short-term analysis.</p>
                        <p>Data Frequency: Use 1-minute or 5-minute intervals to monitor real-time price behavior against VWAP during the trading session.</p>
                        <p>Focus: Identify short-term trade opportunities where price moves significantly above or below VWAP.</p>

                        <p className='font-bold'>Medium-Term Trends</p>
                        <p>Settings: Some platforms allow multi-day VWAP or anchored VWAP for medium-term insights.</p>
                        <p>Data Frequency: Analyze daily VWAP levels relative to weekly price patterns for an extended trend perspective.</p>
                        <p>Focus: Observe VWAP-based pullbacks or rallies over multiple trading sessions for swing trades.</p>

                        <p className='font-bold'>Long-Term Trends</p>
                        <p>Settings: Use anchored VWAP from key historical points (e.g., yearly highs/lows) to assess long-term average price levels relative to volume.</p>
                        <p>Data Frequency: Weekly or monthly data works well to interpret VWAP on larger timeframes.</p>
                        <p>Focus: Track how institutional levels align with VWAP to gauge major market trends or price targets.</p>

                        <h3 className='py-3 text-center font-bold'>Evaluation</h3>

                        <p className='font-bold'>Support and Resistance</p>
                        <p>Price above VWAP: Indicates bullish momentum, with VWAP acting as dynamic support.</p>
                        <p>Price below VWAP: Indicates bearish momentum, with VWAP acting as dynamic resistance.</p>

                        <p className='font-bold'>Mean Reversion</p>
                        <p>Price often reverts to VWAP during intraday trading, making it a key level for scalping or day trades.</p>
                        <p>Deviations from VWAP can highlight overbought/oversold conditions.</p>

                        <p className='font-bold'>Trend Confirmation</p>
                        <p>Price consistently above VWAP indicates strong buying pressure and uptrend confirmation.</p>
                        <p>Price consistently below VWAP suggests selling pressure and a downtrend.</p>

                        <h3 className='py-3 text-center font-bold'>Signal Confirmation</h3>

                        <p className='font-bold'>Intraday Trades</p>
                        <p>Use VWAP as a reference to distinguish institutional buying or selling activity.</p>
                        <p>Enter long positions when price crosses above VWAP with strong volume confirmation.</p>
                        <p>Enter short positions when price crosses below VWAP with strong volume confirmation.</p>

                        <p className='font-bold'>Breakouts and Pullbacks</p>
                        <p>Breakout trades: Confirm breakouts when price moves decisively above VWAP with increased volume.</p>
                        <p>Pullback trades: Wait for the price to pull back to VWAP before entering with the trend.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
