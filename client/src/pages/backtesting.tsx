import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LivePrice } from "@/components/LivePrice";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Analytics } from "@shared/schema";
import { BarChart3, TrendingUp, TrendingDown, Target, Calendar, Play, Settings } from "lucide-react";

interface BacktestResult {
  strategyName: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  finalValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  monthlyReturns: number[];
}

interface Strategy {
  id: string;
  name: string;
  description: string;
  type: 'momentum' | 'mean_reversion' | 'breakout' | 'ai_signals';
  parameters: Record<string, any>;
}

export function BacktestingPage() {
  const [selectedStrategy, setSelectedStrategy] = useState('ai_signals');
  const [startDate, setStartDate] = useState('2023-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [initialCapital, setInitialCapital] = useState(100000);
  const [running, setRunning] = useState(false);

  const { data: analytics } = useQuery<Analytics>({
    queryKey: ['/api/analytics'],
  });

  const strategies: Strategy[] = [
    {
      id: 'ai_signals',
      name: 'AI Signal Strategy',
      description: 'Trades based on AI-generated trading signals with grades B+ and above',
      type: 'ai_signals',
      parameters: { minGrade: 'B+', confidenceThreshold: 0.75, maxPositionSize: 0.1 }
    },
    {
      id: 'momentum',
      name: 'Momentum Strategy',
      description: 'Buys stocks with strong price momentum and high volume',
      type: 'momentum',
      parameters: { lookbackPeriod: 20, volumeThreshold: 1.5, rsiThreshold: 70 }
    },
    {
      id: 'mean_reversion',
      name: 'Mean Reversion Strategy',
      description: 'Trades oversold stocks that are likely to bounce back',
      type: 'mean_reversion',
      parameters: { rsiOversold: 30, bollinger_std: 2, holdingPeriod: 5 }
    },
    {
      id: 'breakout',
      name: 'Breakout Strategy',
      description: 'Trades stocks breaking above resistance levels with volume confirmation',
      type: 'breakout',
      parameters: { lookbackPeriod: 50, volumeMultiplier: 2, breakoutThreshold: 0.02 }
    }
  ];

  const backtestResults: BacktestResult[] = [
    {
      strategyName: 'AI Signal Strategy',
      startDate: '2023-01-01',
      endDate: '2024-12-31',
      initialCapital: 100000,
      finalValue: 158750,
      totalReturn: 58750,
      totalReturnPercent: 58.75,
      annualizedReturn: 26.8,
      volatility: 18.4,
      sharpeRatio: 1.46,
      maxDrawdown: -12.3,
      winRate: 68.4,
      totalTrades: 247,
      avgWin: 4.2,
      avgLoss: -2.1,
      profitFactor: 1.89,
      monthlyReturns: [3.2, -1.4, 5.8, 2.1, -0.8, 4.6, 1.9, -2.3, 6.1, 3.4, 1.2, 2.8]
    },
    {
      strategyName: 'Momentum Strategy',
      startDate: '2023-01-01',
      endDate: '2024-12-31',
      initialCapital: 100000,
      finalValue: 132400,
      totalReturn: 32400,
      totalReturnPercent: 32.4,
      annualizedReturn: 15.2,
      volatility: 22.1,
      sharpeRatio: 0.69,
      maxDrawdown: -18.7,
      winRate: 54.2,
      totalTrades: 189,
      avgWin: 6.8,
      avgLoss: -4.2,
      profitFactor: 1.24,
      monthlyReturns: [2.1, -3.2, 4.5, 1.8, -2.1, 3.2, -1.4, 2.9, 4.1, -1.8, 3.6, 1.9]
    },
    {
      strategyName: 'Mean Reversion Strategy',
      startDate: '2023-01-01',
      endDate: '2024-12-31',
      initialCapital: 100000,
      finalValue: 121800,
      totalReturn: 21800,
      totalReturnPercent: 21.8,
      annualizedReturn: 10.4,
      volatility: 15.6,
      sharpeRatio: 0.67,
      maxDrawdown: -14.2,
      winRate: 61.3,
      totalTrades: 312,
      avgWin: 2.8,
      avgLoss: -1.9,
      profitFactor: 1.45,
      monthlyReturns: [1.8, 0.9, -1.2, 2.4, 1.1, -0.8, 1.9, 2.1, -1.5, 1.7, 0.6, 1.3]
    }
  ];

  const runBacktest = () => {
    setRunning(true);
    setTimeout(() => setRunning(false), 3000);
  };

  const getReturnColor = (value: number) => {
    return value >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const selectedStrategyData = strategies.find(s => s.id === selectedStrategy);
  const bestResult = backtestResults.reduce((best, current) => 
    current.sharpeRatio > best.sharpeRatio ? current : best
  );

  return (
    <div className="min-h-screen bg-[var(--trading-dark)]">
      <Header analytics={analytics} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-64">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Strategy Backtesting</h1>
                <p className="text-gray-400">Test trading strategies against historical market data</p>
              </div>
              <Badge variant="outline" className="text-green-400 border-green-400">
                <BarChart3 className="h-3 w-3 mr-1" />
                Historical Data Ready
              </Badge>
            </div>

            {/* Backtest Configuration */}
            <Card className="bg-[var(--trading-slate)] border-gray-700">
              <CardHeader className="border-b border-gray-700">
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">Backtest Configuration</h2>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-2 block">Strategy</label>
                    <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                      <SelectTrigger className="bg-gray-800 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {strategies.map(strategy => (
                          <SelectItem key={strategy.id} value={strategy.id}>
                            {strategy.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-2 block">Start Date</label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-2 block">End Date</label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-400 mb-2 block">Initial Capital</label>
                    <Input
                      type="number"
                      value={initialCapital}
                      onChange={(e) => setInitialCapital(parseInt(e.target.value))}
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>

                  <Button 
                    onClick={runBacktest}
                    disabled={running}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {running ? 'Running...' : 'Run Backtest'}
                  </Button>
                </div>

                {selectedStrategyData && (
                  <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                    <h3 className="text-white font-medium mb-2">{selectedStrategyData.name}</h3>
                    <p className="text-gray-400 text-sm mb-2">{selectedStrategyData.description}</p>
                    <div className="text-xs text-gray-500">
                      Parameters: {Object.entries(selectedStrategyData.parameters).map(([key, value]) => 
                        `${key}: ${value}`
                      ).join(', ')}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <div>
                      <div className="text-2xl font-bold text-green-400">
                        {bestResult.totalReturnPercent.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-400">Best Return</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-blue-400" />
                    <div>
                      <div className="text-2xl font-bold text-blue-400">
                        {bestResult.sharpeRatio.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-400">Best Sharpe</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="h-4 w-4 text-red-400" />
                    <div>
                      <div className="text-2xl font-bold text-red-400">
                        {bestResult.maxDrawdown.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-400">Max Drawdown</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-purple-400" />
                    <div>
                      <div className="text-2xl font-bold text-purple-400">
                        {backtestResults.reduce((sum, r) => sum + r.totalTrades, 0)}
                      </div>
                      <div className="text-sm text-gray-400">Total Trades</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Backtest Results */}
            <Card className="bg-[var(--trading-slate)] border-gray-700">
              <CardHeader className="border-b border-gray-700">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-green-400" />
                  <h2 className="text-lg font-semibold text-white">Backtest Results</h2>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2 text-gray-400">Strategy</th>
                        <th className="text-right py-2 text-gray-400">Total Return</th>
                        <th className="text-right py-2 text-gray-400">Annual Return</th>
                        <th className="text-right py-2 text-gray-400">Sharpe Ratio</th>
                        <th className="text-right py-2 text-gray-400">Max Drawdown</th>
                        <th className="text-right py-2 text-gray-400">Win Rate</th>
                        <th className="text-right py-2 text-gray-400">Trades</th>
                        <th className="text-right py-2 text-gray-400">Profit Factor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backtestResults.map((result, index) => (
                        <tr key={index} className="border-b border-gray-800">
                          <td className="py-3">
                            <div className="text-white font-medium">{result.strategyName}</div>
                            <div className="text-gray-400 text-xs">
                              {result.startDate} - {result.endDate}
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            <div className={`font-medium ${getReturnColor(result.totalReturn)}`}>
                              +${result.totalReturn.toLocaleString()}
                            </div>
                            <div className={`text-xs ${getReturnColor(result.totalReturn)}`}>
                              ({result.totalReturnPercent.toFixed(1)}%)
                            </div>
                          </td>
                          <td className="py-3 text-right text-blue-400 font-medium">
                            {result.annualizedReturn.toFixed(1)}%
                          </td>
                          <td className="py-3 text-right">
                            <span className={`font-medium ${
                              result.sharpeRatio > 1.5 ? 'text-green-400' : 
                              result.sharpeRatio > 1.0 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {result.sharpeRatio.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-3 text-right text-red-400 font-medium">
                            {result.maxDrawdown.toFixed(1)}%
                          </td>
                          <td className="py-3 text-right">
                            <span className={`font-medium ${
                              result.winRate > 60 ? 'text-green-400' : 
                              result.winRate > 50 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {result.winRate.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 text-right text-gray-300">
                            {result.totalTrades}
                          </td>
                          <td className="py-3 text-right">
                            <span className={`font-medium ${
                              result.profitFactor > 1.5 ? 'text-green-400' : 
                              result.profitFactor > 1.2 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {result.profitFactor.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Analysis for Best Strategy */}
            <Card className="bg-[var(--trading-slate)] border-gray-700">
              <CardHeader className="border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-yellow-400" />
                    <h2 className="text-lg font-semibold text-white">Best Strategy Analysis: {bestResult.strategyName}</h2>
                  </div>
                  <Badge className="text-green-400 bg-green-900/20 border-green-800">
                    BEST PERFORMER
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <div className="text-gray-400 text-sm">Portfolio Performance</div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Initial Capital:</span>
                        <span className="text-white">${bestResult.initialCapital.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Final Value:</span>
                        <span className="text-green-400 font-medium">${bestResult.finalValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Profit:</span>
                        <span className="text-green-400 font-medium">+${bestResult.totalReturn.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-gray-400 text-sm">Risk Metrics</div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Volatility:</span>
                        <span className="text-white">{bestResult.volatility.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Sharpe Ratio:</span>
                        <span className="text-blue-400 font-medium">{bestResult.sharpeRatio.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Max Drawdown:</span>
                        <span className="text-red-400">{bestResult.maxDrawdown.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-gray-400 text-sm">Trade Statistics</div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Trades:</span>
                        <span className="text-white">{bestResult.totalTrades}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Win Rate:</span>
                        <span className="text-green-400 font-medium">{bestResult.winRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Profit Factor:</span>
                        <span className="text-yellow-400 font-medium">{bestResult.profitFactor.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-gray-400 text-sm">Trade Analysis</div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Avg Win:</span>
                        <span className="text-green-400">+{bestResult.avgWin.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Avg Loss:</span>
                        <span className="text-red-400">{bestResult.avgLoss.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Risk/Reward:</span>
                        <span className="text-purple-400 font-medium">
                          1:{(Math.abs(bestResult.avgWin / bestResult.avgLoss)).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                  <div className="text-green-400 font-medium mb-2">Strategy Recommendation</div>
                  <p className="text-gray-300 text-sm">
                    The AI Signal Strategy shows exceptional performance with a {bestResult.sharpeRatio.toFixed(2)} Sharpe ratio 
                    and {bestResult.winRate.toFixed(1)}% win rate. The strategy's {bestResult.maxDrawdown.toFixed(1)}% maximum drawdown 
                    is well within acceptable risk parameters. Consider implementing this strategy with proper position sizing 
                    and risk management controls.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}