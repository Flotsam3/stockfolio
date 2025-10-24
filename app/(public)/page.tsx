// app/(public)/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  BarChart3, 
  Activity, 
  DollarSign, 
  Globe, 
  Zap,
  ArrowRight,
  Eye
} from 'lucide-react';

export default function LandingPage() {
  const [email, setEmail] = useState('');

  const features = [
    {
      icon: Eye,
      title: 'Smart Watchlists',
      description: 'Create and manage personalized stock watchlists tailored to your investment strategy.'
    },
    {
      icon: TrendingUp,
      title: 'Trend Analysis',
      description: 'Identify market trends and patterns with advanced technical analysis tools.'
    },
    {
      icon: Activity,
      title: 'Momentum Insights',
      description: 'Track momentum indicators to time your entries and exits perfectly.'
    },
    {
      icon: BarChart3,
      title: 'Volatility Tracking',
      description: 'Monitor market volatility to manage risk and optimize your portfolio.'
    },
    {
      icon: DollarSign,
      title: 'Fundamental Data',
      description: 'Deep dive into earnings, profits, and key financial metrics.'
    },
    {
      icon: Globe,
      title: 'Global Markets',
      description: 'Quick overview of stock exchanges worldwide, all in one place.'
    }
  ];

  const mockStocks = [
    { symbol: 'AAPL', change: '+2.34' },
    { symbol: 'GOOGL', change: '+1.87' },
    { symbol: 'MSFT', change: '+3.12' }
  ];

  function getYear(){
    return new Date().getFullYear();
  }

  return (
    <div className="min-h-screen bg-[#161616] text-white">
      {/* Navigation */}
      <nav className="bg-[#33313c] border-b border-[#212224]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-[#facc15]" />
              <span className="text-2xl font-bold">Stockfolio</span>
            </div>
            <div className="flex gap-4">
              <Link 
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium hover:text-[#facc15] transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/auth/register"
                className="px-6 py-2 bg-[#facc15] text-[#33313c] rounded-lg text-sm font-semibold hover:bg-[#fcd34d] transition-all hover:scale-105"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#33313c]/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#212224] rounded-full mb-8 border border-[#33313c]">
              <Zap className="w-4 h-4 text-[#facc15]" />
              <span className="text-sm text-gray-300">Smarter Investment Decisions</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Your Investment
              <span className="text-[#facc15]"> Intelligence</span>
              <br />Platform
            </h1>
            
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Lightweight yet powerful. Create watchlists, analyze trends, track momentum, 
              and make data-driven decisions with comprehensive technical and fundamental analysis.
            </p>

            {/* CTA Form */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-6 py-4 bg-[#212224] border border-[#33313c] rounded-lg w-full sm:w-80 focus:outline-none focus:border-[#facc15] transition-colors text-white placeholder-gray-500"
              />
              <Link
                href="/auth/register"
                className="px-8 py-4 bg-[#facc15] text-[#33313c] rounded-lg font-semibold hover:bg-[#fcd34d] transition-all hover:scale-105 flex items-center gap-2 w-full sm:w-auto justify-center group"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <p className="text-sm text-gray-500">
              Free to start. No credit card required.
            </p>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-transparent to-transparent z-10"></div>
            <div className="bg-[#212224] rounded-xl border border-[#33313c] p-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Mock Chart 1 */}
                <div className="bg-[#161616] p-6 rounded-lg border border-[#33313c]">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-gray-400 text-sm">Portfolio Value</p>
                      <p className="text-2xl font-bold text-white">124.523 €</p>
                    </div>
                    <span className="text-green-500 text-sm">+12.5%</span>
                  </div>
                  <div className="h-24 flex items-end gap-1">
                    {[40, 60, 45, 70, 55, 80, 65, 85, 75, 90].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-[#facc15] rounded-t opacity-70"
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Mock Chart 2 */}
                <div className="bg-[#161616] p-6 rounded-lg border border-[#33313c]">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-gray-400 text-sm">Watchlist</p>
                      <p className="text-2xl font-bold text-white">Technology</p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-[#facc15]" />
                  </div>
                  <div className="space-y-3">
                    {mockStocks.map((stock, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm">{stock.symbol}</span>
                        <span className="text-green-500 text-sm">{stock.change}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mock Chart 3 */}
                <div className="bg-[#161616] p-6 rounded-lg border border-[#33313c]">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-gray-400 text-sm">Market Momentum</p>
                      <p className="text-2xl font-bold text-white">Strong</p>
                    </div>
                    <Activity className="w-5 h-5 text-[#facc15]" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">RSI</span>
                      <span className="text-white">68.5</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">MACD</span>
                      <span className="text-green-500">Bullish</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Vol</span>
                      <span className="text-white">Medium</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-[#212224]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Invest Smarter</h2>
            <p className="text-gray-400 text-lg">
              Powerful tools wrapped in a fast, responsive interface
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-[#212224] p-6 rounded-xl border border-[#33313c] hover:border-[#facc15] transition-all hover:scale-105 group cursor-pointer"
              >
                <div className="w-12 h-12 bg-[#facc15]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#facc15]/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-[#facc15]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-[#212224] to-[#33313c] rounded-2xl p-12 border border-[#33313c]">
            <h2 className="text-4xl font-bold mb-4">Ready to Start?</h2>
            <p className="text-gray-400 text-lg mb-8">
              Join thousands of investors making smarter decisions with Stockfolio
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#facc15] text-[#33313c] rounded-lg font-semibold hover:bg-[#fcd34d] transition-all hover:scale-105 group"
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#212224] border-t border-[#33313c] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-[#facc15]" />
              <span className="text-xl font-bold">Stockfolio</span>
            </div>
            <p className="text-gray-500 text-sm">
              © {getYear()} Stockfolio. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-[#facc15] transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-[#facc15] transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="hover:text-[#facc15] transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}