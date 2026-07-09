# Stockfolio

**Stockfolio** is a lightweight, responsive web tool designed to support smarter investment decisions. It allows users to create customized stock watchlists, analyze trends, and gain actionable insights using technical and fundamental financial metrics.

Built with modern web technologies, Stockfolio delivers a seamless and fast user experience for retail investors, traders, and financial enthusiasts.

---

## Features

- **Custom Watchlists** – Track selected stocks in a personalized view  
- **Technical Analysis** – Trend, momentum, and volatility breakdowns  
- **Fundamental Data** – Access to earnings, profit, and other key financial indicators  
- **Global Market Overview** – Snapshot of major stock exchanges  
- **Responsive UI** – Fast-loading, mobile-friendly interface

---

## Tech Stack

- **React** – Frontend UI components  
- **Next.js** – Server-side rendering and routing  
- **TypeScript** – Type safety across the codebase  
- **Tailwind CSS** – Utility-first styling  
- **MongoDB** – NoSQL database for storing user data & financial metrics  
- **Vite** – Lightning-fast dev environment setup (with Next.js)  
- **Alpha Vantage API** – Real-time and historical financial data

---

## Environment Variables

Before running the app, you’ll need to set up a `.env.local` file in the root directory with the following variables:

```env
MONGO_URL=your_mongodb_connection_string
DATABASE=your_database_name
NEXT_PUBLIC_ALPHA_VANTAGE_KEY=your_alpha_vantage_api_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Alpha Vantage API

Stockfolio uses the [Alpha Vantage API](https://www.alphavantage.co/) throughout the app to fetch real-time stock data, historical prices, technical indicators, and more.

To use this app, you’ll need to:

1. Create a free account at [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Generate your API key
3. Paste it into your `.env.local` file as `NEXT_PUBLIC_ALPHA_VANTAGE_KEY`

---

## Getting Started

To run the project locally, follow these steps:

### 1. Clone the repository

```bash
git clone https://github.com/your-username/stockfolio.git
cd stockfolio
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

Create a `.env.local` file and add your configuration as shown above.

### 4. Start the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

---

## License

This project is licensed under the [MIT License](LICENSE).
