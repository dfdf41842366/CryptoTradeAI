import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LivePrice } from "@/components/LivePrice";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Analytics } from "@shared/schema";
import { PieChart, TrendingUp, TrendingDown, BarChart3, DollarSign, Target, Activity, AlertTriangle } from "lucide-react";

interface Position {
  symbol: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  unrealizedGainLoss: number;
  unrealizedGainLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
  sector: string;
  weight: number;
}

interface PortfolioMetrics {
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
  beta: number;
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
}

export function PortfolioPage() {
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1D');

  const { data: analytics } = useQuery<Analytics>({
    queryKey: ['/api/analytics'],
  });

  const portfolioMetrics: PortfolioMetrics = {
    totalValue: 127500.00,
    totalGainLoss: 12500.00,
    totalGainLossPercent: 10.87,
    dayChange: -1250.00,
    dayChangePercent: -0.97,
    beta: 1.15,
    sharpeRatio: 1.23,
    maxDrawdown: -8.4,
    volatility: 18.7
  };

  const positions: Position[] = [
    {
      symbol: 'TSLA',
      shares: 150,
      avgCost: 195.50,
      currentPrice: 238.92,
      marketValue: 35838.00,
      unrealizedGainLoss: 6513.00,
      unrealizedGainLossPercent: 22.25,
      dayChange: -450.00,
      dayChangePercent: -1.24,
      sector: 'Consumer Discretionary',
      weight: 28.1
    },
    {
      symbol: 'NVDA',
      shares: 75,
      avgCost: 445.20,
      currentPrice: 512.43,
      marketValue: 38432.25,
      unrealizedGainLoss: 5042.25,
      unrealizedGainLossPercent: 15.11,
      dayChange: 337.50,
      dayChangePercent: 0.89,
      sector: 'Technology',
      weight: 30.1
    },
    {
      symbol: 'AAPL',
      shares: 200,
      avgCost: 175.30,
      currentPrice: 192.35,
      marketValue: 38470.00,
      unrealizedGainLoss: 3410.00,
      unrealizedGainLossPercent: 9.72,
      dayChange: -580.00,
      dayChangePercent: -1.49,
      sector: 'Technology',
      weight: 30.2
    },
    {
      symbol: 'SPY',
      shares: 25,
      avgCost: 420.80,
      currentPrice: 593.25,
      marketValue: 14831.25,
      unrealizedGainLoss: 4311.25,
      unrealizedGainLossPercent: 40.93,
      dayChange: -175.00,
      dayChangePercent: -1.17,
      sector: 'ETF',
      weight: 11.6
    }
  ];

  const sectorAllocation = [
    { sector: 'Technology', value: 76902.25, percent: 60.3, color: 'bg-blue-400' },
    { sector: 'Consumer Discretionary', value: 35838.00, percent: 28.1, color: 'bg-green-400' },
    { sector: 'ETF', value: 14831.25, percent: 11.6, color: 'bg-purple-400' }
  ];

  const getGainLossColor = (value: number) => {
    return value >= 0 ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-[var(--trading-dark)]">
      <Header analytics={analytics} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-64">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Portfolio Management</h1>
                <p className="text-gray-400">Track positions, performance metrics, and risk analysis</p>
              </div>
              <div className="flex space-x-2">
                {(['1D', '1W', '1M', '3M', '1Y'] as const).map((tf) => (
                  <Button
                    key={tf}
                    size="sm"
                    variant={timeframe === tf ? "default" : "outline"}
                    onClick={() => setTimeframe(tf)}
                    className={timeframe === tf ? "bg-blue-600" : ""}
                  >
                    {tf}
                  </Button>
                ))}
              </div>
            </div>

            {/* Portfolio Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-400" />
                    <div>
                      <div className="text-2xl font-bold text-green-400">
                        ${portfolioMetrics.totalValue.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">Total Value</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-400" />
                    <div>
                      <div className={`text-2xl font-bold ${getGainLossColor(portfolioMetrics.totalGainLoss)}`}>
                        {portfolioMetrics.totalGainLoss >= 0 ? '+' : ''}${portfolioMetrics.totalGainLoss.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">
                        Total P&L ({portfolioMetrics.totalGainLossPercent >= 0 ? '+' : ''}{portfolioMetrics.totalGainLossPercent.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-yellow-400" />
                    <div>
                      <div className={`text-2xl font-bold ${getGainLossColor(portfolioMetrics.dayChange)}`}>
                        {portfolioMetrics.dayChange >= 0 ? '+' : ''}${portfolioMetrics.dayChange.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">
                        Day Change ({portfolioMetrics.dayChangePercent >= 0 ? '+' : ''}{portfolioMetrics.dayChangePercent.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-purple-400" />
                    <div>
                      <div className="text-2xl font-bold text-purple-400">
                        {portfolioMetrics.sharpeRatio.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-400">Sharpe Ratio</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Positions */}
              <div className="lg:col-span-2">
                <Card className="bg-[var(--trading-slate)] border-gray-700">
                  <CardHeader className="border-b border-gray-700">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5 text-blue-400" />
                      <h2 className="text-lg font-semibold text-white">Current Positions</h2>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-2 text-gray-400">Symbol</th>
                            <th className="text-right py-2 text-gray-400">Shares</th>
                            <th className="text-right py-2 text-gray-400">Avg Cost</th>
                            <th className="text-right py-2 text-gray-400">Current</th>
                            <th className="text-right py-2 text-gray-400">Market Value</th>
                            <th className="text-right py-2 text-gray-400">P&L</th>
                            <th className="text-right py-2 text-gray-400">Day Change</th>
                            <th className="text-right py-2 text-gray-400">Weight</th>
                          </tr>
                        </thead>
                        <tbody>
                          {positions.map((position, index) => (
                            <tr key={index} className="border-b border-gray-800">
                              <td className="py-3">
                                <div className="flex items-center space-x-2">
                                  <span className="text-white font-medium">${position.symbol}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {position.sector}
                                  </Badge>
                                </div>
                              </td>
                              <td className="py-3 text-right text-gray-300">
                                {position.shares.toLocaleString()}
                              </td>
                              <td className="py-3 text-right text-gray-300">
                                ${position.avgCost.toFixed(2)}
                              </td>
                              <td className="py-3 text-right">
                                <LivePrice symbol={position.symbol} className="text-white font-medium" />
                              </td>
                              <td className="py-3 text-right text-white font-medium">
                                ${position.marketValue.toLocaleString()}
                              </td>
                              <td className="py-3 text-right">
                                <div className={`font-medium ${getGainLossColor(position.unrealizedGainLoss)}`}>
                                  {position.unrealizedGainLoss >= 0 ? '+' : ''}${position.unrealizedGainLoss.toLocaleString()}
                                </div>
                                <div className={`text-xs ${getGainLossColor(position.unrealizedGainLoss)}`}>
                                  ({position.unrealizedGainLossPercent >= 0 ? '+' : ''}{position.unrealizedGainLossPercent.toFixed(2)}%)
                                </div>
                              </td>
                              <td className="py-3 text-right">
                                <div className={`font-medium ${getGainLossColor(position.dayChange)}`}>
                                  {position.dayChange >= 0 ? '+' : ''}${position.dayChange.toLocaleString()}
                                </div>
                                <div className={`text-xs ${getGainLossColor(position.dayChange)}`}>
                                  ({position.dayChangePercent >= 0 ? '+' : ''}{position.dayChangePercent.toFixed(2)}%)
                                </div>
                              </td>
                              <td className="py-3 text-right text-purple-400 font-medium">
                                {position.weight.toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sector Allocation & Risk Metrics */}
              <div className="space-y-6">
                <Card className="bg-[var(--trading-slate)] border-gray-700">
                  <CardHeader className="border-b border-gray-700">
                    <div className="flex items-center space-x-2">
                      <PieChart className="h-5 w-5 text-green-400" />
                      <h2 className="text-lg font-semibold text-white">Sector Allocation</h2>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {sectorAllocation.map((sector, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300 text-sm">{sector.sector}</span>
                            <span className="text-white font-medium">{sector.percent}%</span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-3">
                            <div 
                              className={`${sector.color} h-3 rounded-full`}
                              style={{width: `${sector.percent}%`}}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-400">
                            ${sector.value.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[var(--trading-slate)] border-gray-700">
                  <CardHeader className="border-b border-gray-700">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      <h2 className="text-lg font-semibold text-white">Risk Metrics</h2>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Portfolio Beta</span>
                        <span className="text-white font-medium">{portfolioMetrics.beta}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Volatility</span>
                        <span className="text-yellow-400 font-medium">{portfolioMetrics.volatility}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Max Drawdown</span>
                        <span className="text-red-400 font-medium">{portfolioMetrics.maxDrawdown}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Sharpe Ratio</span>
                        <span className={`font-medium ${
                          portfolioMetrics.sharpeRatio > 1.5 ? 'text-green-400' : 
                          portfolioMetrics.sharpeRatio > 1.0 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {portfolioMetrics.sharpeRatio.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 p-3 bg-gray-800 rounded">
                      <div className="text-sm text-gray-400 mb-2">Risk Assessment</div>
                      <div className="text-xs text-gray-300">
                        Your portfolio shows moderate risk with high technology exposure (60.3%). 
                        Consider diversifying into defensive sectors to reduce volatility.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}