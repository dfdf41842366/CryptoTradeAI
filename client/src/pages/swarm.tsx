import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { SwarmAnalysis } from "@/components/SwarmAnalysis";
import { LivePrice } from "@/components/LivePrice";
import { useQuery } from "@tanstack/react-query";
import { Analytics } from "@shared/schema";
import { useState } from "react";

export function SwarmPage() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('TSLA');

  const { data: analytics } = useQuery<Analytics>({
    queryKey: ['/api/analytics'],
  });

  const popularSymbols = ['TSLA', 'NVDA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'GME', 'AMC', 'PLTR'];

  return (
    <div className="min-h-screen bg-[var(--trading-dark)]">
      <Header analytics={analytics} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-64">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">AI Swarm Intelligence</h1>
                <p className="text-gray-400">Deploy 5 specialized AI agents for comprehensive stock analysis</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">Analyze:</span>
                <select 
                  value={selectedSymbol} 
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white text-sm focus:outline-none focus:border-purple-500"
                >
                  {popularSymbols.map(symbol => (
                    <option key={symbol} value={symbol}>${symbol}</option>
                  ))}
                </select>
              </div>
            </div>

            <SwarmAnalysis symbol={selectedSymbol} />
          </div>
        </main>
      </div>
    </div>
  );
}