export const financialMetrics = [
    {
        id: 1,
        title: "1. Gross Profit",
        content: `
            <p>Key Metric: Measures the company's ability to generate revenue after accounting for the cost of goods sold (COGS).</p>
            <p>Benchmarking: Compare Gross Profit levels and growth rates (YoY) over 4-5 years.</p>
        
            <h3>Traffic Light System:</h3>
            <div class="indicator green">
                <h4>Green:</h4>
                <ul>
                <li>Gross Profit shows consistent growth over the years (e.g., YoY growth of 5%+ annually).</li>
                <li>Gross Profit Margin is stable or improving over 4-5 years.</li>
                </ul>
            </div>
        
            <div class="indicator yellow">
                <h4>Yellow:</h4>
                <ul>
                <li>Gross Profit fluctuates significantly YoY (e.g., between -5% and +5% growth).</li>
                <li>Gross Profit Margin shows slight declines but remains competitive compared to industry peers.</li>
                </ul>
            </div>
        
            <div class="indicator red">
                <h4>Red:</h4>
                <ul>
                <li>Gross Profit is stagnant or declining (YoY growth consistently &lt; 0%).</li>
                <li>Gross Profit Margin is declining significantly compared to historical performance or peers.</li>
                </ul>
            </div>
        `
    },
    {
        id: 2,
        title: "2. Operating Income",
        content: `
          <p>Key Metric: Reflects the company's ability to generate profit after accounting for operating expenses.</p>
          <p>Benchmarking: Compare Operating Income levels and growth rates (YoY) over 4-5 years.</p>
      
          <h3>Traffic Light System:</h3>
          <div class="indicator green">
            <h4>Green:</h4>
            <ul>
              <li>Operating Income is growing YoY (e.g., 3%+ growth annually).</li>
              <li>Operating Margin is stable or improving (indicating operational efficiency).</li>
            </ul>
          </div>
      
          <div class="indicator yellow">
            <h4>Yellow:</h4>
            <ul>
              <li>Operating Income fluctuates YoY (e.g., growth between -3% and +3%).</li>
              <li>Operating Margin shows slight declines but remains competitive with peers.</li>
            </ul>
          </div>
      
          <div class="indicator red">
            <h4>Red:</h4>
            <ul>
              <li>Operating Income is declining YoY (growth consistently &lt; 0%).</li>
              <li>Operating Margin is deteriorating sharply.</li>
            </ul>
          </div>
        `
    },
    {
      id: 3,
      title: "3. Net Income",
      content: `
        <p>Key Metric: The "bottom line," indicating overall profitability after all expenses, taxes, and interest.</p>
        <p>Benchmarking: Compare Net Income levels and trends YoY over 4-5 years.</p>
        
        <h3>Traffic Light System:</h3>
        <div class="indicator green">
          <h4>Green:</h4>
          <ul>
            <li>Net Income shows consistent YoY growth (e.g., 5%+ growth annually).</li>
            <li>Net Margin (Net Income / Total Revenue) is stable or improving.</li>
          </ul>
        </div>
        
        <div class="indicator yellow">
          <h4>Yellow:</h4>
          <ul>
            <li>Net Income fluctuates YoY (e.g., growth between -5% and +5%).</li>
            <li>Net Margin declines slightly but remains positive and competitive with peers.</li>
          </ul>
        </div>
        
        <div class="indicator red">
          <h4>Red:</h4>
          <ul>
            <li>Net Income is consistently declining or negative over multiple years.</li>
            <li>Net Margin shows significant deterioration or turns negative.</li>
          </ul>
        </div>
      `
    },
    {
        id: 4,
        title: "4. EBITDA",
        content: `
          <p>Key Metric: EBITDA highlights the company's core operational performance, excluding non-cash expenses and capital structure. It's critical for assessing operational efficiency and cash-generating capacity.</p>
          <p>Benchmarking: Compare EBITDA growth and trends over the last 4-5 years.</p>
      
          <h3>Traffic Light System:</h3>
          <div class="indicator green">
            <h4>Green:</h4>
            <ul>
              <li>EBITDA shows consistent growth YoY (e.g., 5%+ growth annually).</li>
              <li>EBITDA Margin (EBITDA / Total Revenue) is stable or improving over time.</li>
            </ul>
          </div>
      
          <div class="indicator yellow">
            <h4>Yellow:</h4>
            <ul>
              <li>EBITDA fluctuates slightly YoY (e.g., growth between -5% and +5%).</li>
              <li>EBITDA Margin shows slight declines but remains competitive compared to industry averages.</li>
            </ul>
          </div>
      
          <div class="indicator red">
            <h4>Red:</h4>
            <ul>
              <li>EBITDA is declining consistently over multiple years.</li>
              <li>EBITDA Margin declines sharply, indicating worsening operational performance or rising costs.</li>
            </ul>
          </div>
        `
      },
      {
        id: 5,
        title: "5. Debt-to-Equity Ratio",
        content: `
          <p>Key Metric: This ratio assesses the company's financial leverage. It measures the proportion of debt used to finance operations relative to equity.</p>
          <p>Benchmarking: Compare the ratio to:</p>
          <ul>
            <li>Industry averages (debt-heavy industries like utilities differ from tech companies).</li>
            <li>The company's historical performance over the last 4-5 years.</li>
          </ul>
      
          <h3>Traffic Light System:</h3>
          <div class="indicator green">
            <h4>Green:</h4>
            <ul>
              <li>Debt-to-Equity Ratio is below 1.5 (indicating moderate and manageable debt levels).</li>
              <li>Ratio is stable or improving over time, showing responsible debt management.</li>
            </ul>
          </div>
      
          <div class="indicator yellow">
            <h4>Yellow:</h4>
            <ul>
              <li>Debt-to-Equity Ratio is between 1.5 and 2.5.</li>
              <li>A slight increase in leverage but manageable if EBITDA and cash flow support debt repayment.</li>
            </ul>
          </div>
      
          <div class="indicator red">
            <h4>Red:</h4>
            <ul>
              <li>Debt-to-Equity Ratio is consistently above 2.5 or rising sharply.</li>
              <li>Indicates excessive reliance on debt, increasing financial risk and vulnerability during downturns.</li>
            </ul>
          </div>
        `
      },
      {
        id: 6,
        title: "6. Current Ratio",
        content: `
          <p>Key Metric: Measures the company's ability to pay short-term liabilities using its short-term assets.</p>
          <p>Current Ratio = Total Current Assets / Total Current Liabilities</p>
          <p>Benchmarking: Compare the ratio to:</p>
          <ul>
            <li>Industry averages (e.g., a higher ratio is often needed in capital-intensive industries).</li>
            <li>The company's historical trend (4-5 years).</li>
          </ul>
      
          <h3>Traffic Light System:</h3>
          <div class="indicator green">
            <h4>Green:</h4>
            <ul>
              <li>Current Ratio is between 1.5 and 2.5.</li>
              <li>This indicates strong liquidity and the ability to comfortably meet short-term obligations.</li>
              <li>Ratio is stable or improving compared to prior years.</li>
            </ul>
          </div>
      
          <div class="indicator yellow">
            <h4>Yellow:</h4>
            <ul>
              <li>Current Ratio is between 1.0 and 1.5.</li>
              <li>Liquidity is adequate but leaves little room for unexpected challenges.</li>
              <li>Minor declines in the ratio over time warrant closer monitoring.</li>
            </ul>
          </div>
      
          <div class="indicator red">
            <h4>Red:</h4>
            <ul>
              <li>Current Ratio is below 1.0.</li>
              <li>Short-term liabilities exceed short-term assets, signaling potential liquidity risk.</li>
              <li>Declining trends over several years are a major red flag.</li>
            </ul>
          </div>
        `
      },
      {
        id: 7,
        title: "7. Operating Cash Flow",
        content: `
          <p>Key Metric: Reflects cash generated by the company's operations. Positive operating cash flow indicates the company's core business is generating cash, which is essential for sustainability.</p>
      
          <h3>Traffic Light System:</h3>
          <div class="indicator green">
            <h4>Green:</h4>
            <ul>
              <li>Operating Cash Flow is consistently positive and growing YoY (e.g., 5%+ growth annually).</li>
              <li>Operating Cash Flow is sufficient to cover capital expenditures, debt repayments, and dividends.</li>
            </ul>
          </div>
      
          <div class="indicator yellow">
            <h4>Yellow:</h4>
            <ul>
              <li>Operating Cash Flow is positive but stagnant or declining slightly (e.g., growth between -5% and +5%).</li>
              <li>Cash flow is still sufficient to cover expenses but indicates a potential slowdown.</li>
            </ul>
          </div>
      
          <div class="indicator red">
            <h4>Red:</h4>
            <ul>
              <li>Operating Cash Flow is negative or consistently declining YoY.</li>
              <li>The company may be relying on external financing or asset sales to fund operations.</li>
              <li>Cash flow is insufficient to cover operational costs, capex, or debt obligations.</li>
            </ul>
          </div>
        `
      },
      {
        id: 8,
        title: "8. Earnings Per Share (EPS)",
        content: `
          <p>Key Metric: EPS shows how much profit is allocated to each outstanding share of common stock. It's a critical measure of profitability and shareholder value.</p>
          <p>Benchmarking: Evaluate trends in EPS over the last 4-5 years.</p>
      
          <h3>Traffic Light System:</h3>
          <div class="indicator green">
            <h4>Green:</h4>
            <ul>
              <li>EPS is growing consistently over 4-5 years (e.g., 5%+ YoY growth).</li>
              <li>Positive growth indicates increasing profitability and shareholder value.</li>
            </ul>
          </div>
      
          <div class="indicator yellow">
            <h4>Yellow:</h4>
            <ul>
              <li>EPS shows stagnation or slight declines (growth between -5% and +5%).</li>
              <li>Company still maintains profitability but struggles to grow earnings.</li>
            </ul>
          </div>
      
          <div class="indicator red">
            <h4>Red:</h4>
            <ul>
              <li>EPS is declining consistently or turns negative over multiple years.</li>
              <li>Indicates shrinking profits, potential losses, or financial stress.</li>
            </ul>
          </div>
        `
      },
      {
        id: 9,
        title: "9. Price-to-Earnings (P/E) Ratio",
        content: `
          <p>Key Metric: P/E Ratio measures how much investors are willing to pay per dollar of earnings. It's calculated as:</p>
          <p>P/E Ratio = Share Price / Earnings Per Share (EPS)</p>
          <p>High P/E: Can indicate overvaluation or high investor expectations for future growth.</p>
          <p>Low P/E: Can signal undervaluation or concerns about future earnings.</p>
      
          <h3>Traffic Light System:</h3>
          <div class="indicator green">
            <h4>Green:</h4>
            <ul>
              <li>P/E Ratio is in line with or slightly below industry averages (indicating fair or undervalued pricing).</li>
              <li>P/E Ratio is stable, and growth in EPS supports the valuation.</li>
              <li>For general markets, P/E between 15 and 25 is considered reasonable.</li>
            </ul>
          </div>
      
          <div class="indicator yellow">
            <h4>Yellow:</h4>
            <ul>
              <li>P/E Ratio is slightly above industry averages or historical norms.</li>
              <li>Indicates high investor expectations, but earnings growth must justify the premium.</li>
            </ul>
          </div>
      
          <div class="indicator red">
            <h4>Red:</h4>
            <ul>
              <li>P/E Ratio is excessively high (e.g., &gt;40) without sufficient earnings growth to justify it.</li>
              <li>Alternatively, a very low P/E (e.g., &lt;10) might indicate undervaluation, but could also reflect concerns about future earnings or business issues.</li>
            </ul>
          </div>
        `
      }
  ];