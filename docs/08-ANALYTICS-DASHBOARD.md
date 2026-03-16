# Analytics Dashboard

## What It Does

The Analytics Dashboard gives creators real-time visibility into their agent's performance — token metrics, burn activity, revenue tracking, and agent activity logs. This is one of our biggest differentiators since PumpFun offers no post-launch analytics.

## Dashboard Sections

### Top-Level Stats
Four key metrics shown as cards at the top:
- **Token Price** — Current price + 7d change %
- **Market Cap** — Current market cap + 7d change %
- **Total Burned** — Cumulative tokens burned + % of total supply
- **Holders** — Number of unique holders + 7d growth

### Burn Rate Chart
- Bar chart showing hourly burn amounts over the selected time period
- Orange gradient bars representing burned token volume
- Time range selector: 24h, 7d, 30d, All

### Price History Chart
- Bar chart showing token price over time
- Green gradient bars representing price at each interval
- Overlaid with the same time range selector

### Revenue Split
- Visual breakdown of how deposits are allocated:
  - Buyback & Burn portion (orange bar, showing the configured %)
  - Claimable Revenue portion (green bar, showing the remainder)
  - Total deposit amount
- Percentage-based progress bars for easy visual understanding

### Agent Activity Feed
- Chronological log of what the agent has done in the last 24 hours:
  - Posts made on X
  - Buyback executions (with token amounts burned)
  - Payments received (with sender address and amount)
  - Replies to mentions
- Each entry has an icon, description, and timestamp

### Hourly Burn Log
- Table showing each hourly burn event:
  - Time of burn
  - Number of tokens burned
  - SOL equivalent value
- Most recent burns at the top

### Recent Deposits
- Table showing deposits to the Agent Deposit Address:
  - Sender address (truncated)
  - Amount
  - Currency type (SOL, USDC, USDT)
  - Time ago

## Data Sources (Production)

| Data | Source |
|------|--------|
| Token price, market cap | PumpFun Frontend API v3 or Market API |
| Burn events | Solana on-chain transaction monitoring |
| Deposit history | Agent Deposit Address transaction log |
| Holder count | PumpFun Advanced Analytics API v2 |
| Agent activity | Our internal database + X API |

## Key Files

```
src/app/analytics/page.tsx  — Full analytics page with charts and tables
```

## Future Improvements

- Real charting library (Recharts or Visx) instead of CSS bars
- Export data as CSV
- Email/Telegram alerts on significant events (whale deposit, price spike)
- Comparison view (compare two agents side-by-side)
- Predictive analytics (estimated burn projection based on trends)
- Community sentiment analysis from X mentions
