import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Analytics } from "@shared/schema";
import { TrendingUp, Target, Shield, DollarSign, Activity, Zap, Users, Brain, Star, Clock, AlertTriangle } from "lucide-react";

interface SwingTrade {
  id: string;
  symbol: string;
  entryPrice: number;
  exitTarget: number;
  stopLoss: number;
  currentPrice: number;
  gainPercentage: number;
  riskRewardRatio: number;
  timeframe: string;
  strategy: string;
  confidence: number;
  status: 'active' | 'pending' | 'completed' | 'stopped';
  entryDate: string;
  expectedDuration: string;
  catalysts: string[];
  technicals: {
    rsi: number;
    macd: string;
    support: number;
    resistance: number;
  };
}

interface SwingTrader {
  id: string;
  name: string;
  specialty: string;
  avgGain: number;
  winRate: number;
  totalTrades: number;
  activeTrades: number;
  bestTrade: number;
  experience: string;
  currentTrade?: SwingTrade;
  recentTrades: SwingTrade[];
  tradingStyle: string;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
}

export default function SwingMastersPage() {
  const [teamActive, setTeamActive] = useState(true);
  const [totalGains, setTotalGains] = useState(47.8);
  const [activeTrades, setActiveTrades] = useState(8);
  const [completedToday, setCompletedToday] = useState(3);
  
  const { data: analytics } = useQuery<Analytics>({
    queryKey: ["/api/analytics"],
  });

  const swingTraders: SwingTrader[] = [
    {
      id: 'momentum_king',
      name: 'Momentum King Marcus',
      specialty: 'High-Momentum Breakouts',
      avgGain: 42.7,
      winRate: 78.4,
      totalTrades: 147,
      activeTrades: 2,
      bestTrade: 89.3,
      experience: '12 years momentum trading',
      tradingStyle: 'Aggressive breakout entries with tight stops',
      riskTolerance: 'aggressive',
      currentTrade: {
        id: 'mk_001',
        symbol: 'KOSS',
        entryPrice: 3.45,
        exitTarget: 4.85,
        stopLoss: 2.98,
        currentPrice: 3.67,
        gainPercentage: 40.6,
        riskRewardRatio: 2.98,
        timeframe: '3-7 days',
        strategy: 'Volume breakout with momentum confirmation',
        confidence: 84,
        status: 'active',
        entryDate: '2 days ago',
        expectedDuration: '5 more days',
        catalysts: ['Earnings whispers', 'Short squeeze setup', 'Technical breakout'],
        technicals: {
          rsi: 67.3,
          macd: 'Bullish crossover',
          support: 3.20,
          resistance: 4.10
        }
      },
      recentTrades: [
        {
          id: 'mk_prev1',
          symbol: 'BBIG',
          entryPrice: 1.25,
          exitTarget: 1.75,
          stopLoss: 1.05,
          currentPrice: 1.73,
          gainPercentage: 38.4,
          riskRewardRatio: 2.5,
          timeframe: '2-5 days',
          strategy: 'Momentum reversal',
          confidence: 79,
          status: 'completed',
          entryDate: '1 week ago',
          expectedDuration: 'Completed',
          catalysts: ['Technical bounce'],
          technicals: { rsi: 45, macd: 'Turning bullish', support: 1.15, resistance: 1.65 }
        }
      ]
    },
    {
      id: 'catalyst_crusher',
      name: 'Catalyst Crusher Clara',
      specialty: 'Event-Driven Swing Trades',
      avgGain: 51.2,
      winRate: 71.8,
      totalTrades: 89,
      activeTrades: 1,
      bestTrade: 127.6,
      experience: '9 years catalyst trading',
      tradingStyle: 'Pre-event positioning with post-event exits',
      riskTolerance: 'moderate',
      currentTrade: {
        id: 'cc_001',
        symbol: 'AVXL',
        entryPrice: 4.82,
        exitTarget: 7.25,
        stopLoss: 4.15,
        currentPrice: 5.14,
        gainPercentage: 50.4,
        riskRewardRatio: 3.63,
        timeframe: '1-3 weeks',
        strategy: 'FDA approval catalyst play',
        confidence: 91,
        status: 'active',
        entryDate: '5 days ago',
        expectedDuration: '2 weeks',
        catalysts: ['FDA decision pending', 'Phase 3 results', 'Partnership rumors'],
        technicals: {
          rsi: 58.9,
          macd: 'Bullish momentum',
          support: 4.60,
          resistance: 6.20
        }
      },
      recentTrades: []
    },
    {
      id: 'reversal_master',
      name: 'Reversal Master Ray',
      specialty: 'Oversold Bounce Plays',
      avgGain: 36.8,
      winRate: 82.7,
      totalTrades: 203,
      activeTrades: 2,
      bestTrade: 73.2,
      experience: '15 years contrarian trading',
      tradingStyle: 'Buy oversold, sell overbought with patience',
      riskTolerance: 'conservative',
      currentTrade: {
        id: 'rm_001',
        symbol: 'CYDY',
        entryPrice: 0.67,
        exitTarget: 0.95,
        stopLoss: 0.58,
        currentPrice: 0.71,
        gainPercentage: 41.8,
        riskRewardRatio: 3.11,
        timeframe: '1-2 weeks',
        strategy: 'Oversold bounce with fundamental catalyst',
        confidence: 76,
        status: 'active',
        entryDate: '3 days ago',
        expectedDuration: '1 week',
        catalysts: ['Drug trial update', 'Technical oversold', 'Institutional buying'],
        technicals: {
          rsi: 28.4,
          macd: 'Bullish divergence',
          support: 0.62,
          resistance: 0.85
        }
      },
      recentTrades: []
    },
    {
      id: 'squeeze_specialist',
      name: 'Squeeze Specialist Sam',
      specialty: 'Short Squeeze Setups',
      avgGain: 67.3,
      winRate: 63.2,
      totalTrades: 76,
      activeTrades: 1,
      bestTrade: 156.8,
      experience: '8 years squeeze trading',
      tradingStyle: 'High-risk, high-reward squeeze plays',
      riskTolerance: 'aggressive',
      currentTrade: {
        id: 'ss_001',
        symbol: 'PROG',
        entryPrice: 1.84,
        exitTarget: 2.75,
        stopLoss: 1.62,
        currentPrice: 1.97,
        gainPercentage: 49.5,
        riskRewardRatio: 4.14,
        timeframe: '1-10 days',
        strategy: 'Short squeeze with gamma ramp',
        confidence: 88,
        status: 'active',
        entryDate: '1 day ago',
        expectedDuration: '3-7 days',
        catalysts: ['High short interest', 'Options gamma', 'Reddit momentum'],
        technicals: {
          rsi: 72.1,
          macd: 'Strong bullish',
          support: 1.75,
          resistance: 2.20
        }
      },
      recentTrades: []
    },
    {
      id: 'pattern_prophet',
      name: 'Pattern Prophet Pete',
      specialty: 'Technical Pattern Breakouts',
      avgGain: 34.9,
      winRate: 79.5,
      totalTrades: 168,
      activeTrades: 2,
      bestTrade: 68.7,
      experience: '11 years technical analysis',
      tradingStyle: 'Clean chart patterns with precise entries',
      riskTolerance: 'moderate',
      currentTrade: {
        id: 'pp_001',
        symbol: 'SPCE',
        entryPrice: 8.92,
        exitTarget: 12.50,
        stopLoss: 7.85,
        currentPrice: 9.34,
        gainPercentage: 40.1,
        riskRewardRatio: 3.35,
        timeframe: '2-4 weeks',
        strategy: 'Cup and handle breakout',
        confidence: 82,
        status: 'active',
        entryDate: '4 days ago',
        expectedDuration: '2 weeks',
        catalysts: ['Technical breakout', 'Space sector rotation', 'Earnings approach'],
        technicals: {
          rsi: 61.7,
          macd: 'Bullish crossover',
          support: 8.50,
          resistance: 10.80
        }
      },
      recentTrades: []
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-900/20 border-green-800';
      case 'pending': return 'text-yellow-400 bg-yellow-900/20 border-yellow-800';
      case 'completed': return 'text-blue-400 bg-blue-900/20 border-blue-800';
      case 'stopped': return 'text-red-400 bg-red-900/20 border-red-800';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'conservative': return 'text-green-400';
      case 'moderate': return 'text-yellow-400';
      case 'aggressive': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const calculatePnL = (trade: SwingTrade) => {
    return ((trade.currentPrice - trade.entryPrice) / trade.entryPrice * 100);
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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent mb-2">
                  Elite Swing Masters
                </h1>
                <p className="text-gray-400">Top-tier swing trading team targeting 30%+ gains with precision entry and exit strategies</p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="text-green-400 border-green-400">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {totalGains}% Today
                </Badge>
                <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                  <Activity className="h-3 w-3 mr-1" />
                  {activeTrades} Active
                </Badge>
              </div>
            </div>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-400" />
                    <div>
                      <div className="text-2xl font-bold text-green-400">
                        +{totalGains}%
                      </div>
                      <div className="text-sm text-gray-400">Total Gains Today</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-blue-400" />
                    <div>
                      <div className="text-2xl font-bold text-blue-400">
                        {activeTrades}
                      </div>
                      <div className="text-sm text-gray-400">Active Trades</div>
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
                        {completedToday}
                      </div>
                      <div className="text-sm text-gray-400">Completed Today</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <div>
                      <div className="text-2xl font-bold text-yellow-400">
                        76.5%
                      </div>
                      <div className="text-sm text-gray-400">Team Win Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Trades Overview */}
            <Card className="bg-[var(--trading-slate)] border-gray-700">
              <CardHeader className="border-b border-gray-700">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-green-400" />
                  <h2 className="text-lg font-semibold text-white">Live Active Trades</h2>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700 bg-gray-800/50">
                        <th className="text-left p-4 text-gray-400">Symbol</th>
                        <th className="text-right p-4 text-gray-400">Entry</th>
                        <th className="text-right p-4 text-gray-400">Current</th>
                        <th className="text-right p-4 text-gray-400">Target</th>
                        <th className="text-right p-4 text-gray-400">Stop Loss</th>
                        <th className="text-right p-4 text-gray-400">Gain %</th>
                        <th className="text-right p-4 text-gray-400">R:R</th>
                        <th className="text-right p-4 text-gray-400">Trader</th>
                      </tr>
                    </thead>
                    <tbody>
                      {swingTraders.filter(trader => trader.currentTrade).map((trader) => {
                        const trade = trader.currentTrade!;
                        const currentPnL = calculatePnL(trade);
                        return (
                          <tr key={trade.id} className="border-b border-gray-800 hover:bg-green-900/10">
                            <td className="p-4">
                              <div className="font-medium text-white">{trade.symbol}</div>
                              <div className="text-xs text-gray-400">{trade.strategy}</div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="text-white font-medium">${trade.entryPrice.toFixed(2)}</div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="text-cyan-400 font-medium">${trade.currentPrice.toFixed(2)}</div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="text-green-400 font-medium">${trade.exitTarget.toFixed(2)}</div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="text-red-400 font-medium">${trade.stopLoss.toFixed(2)}</div>
                            </td>
                            <td className="p-4 text-right">
                              <div className={`font-medium ${currentPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {currentPnL >= 0 ? '+' : ''}{currentPnL.toFixed(1)}%
                              </div>
                              <div className="text-xs text-gray-400">Target: +{trade.gainPercentage.toFixed(1)}%</div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="text-purple-400 font-medium">{trade.riskRewardRatio.toFixed(2)}</div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="text-blue-400 font-medium">{trader.name.split(' ')[0]}</div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Swing Traders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {swingTraders.map((trader) => (
                <Card key={trader.id} className="bg-[var(--trading-slate)] border-gray-700">
                  <CardHeader className="border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-yellow-600 flex items-center justify-center">
                          <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{trader.name}</h3>
                          <p className="text-sm text-gray-400">{trader.specialty}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-400">+{trader.avgGain}%</div>
                        <div className="text-xs text-gray-400">Avg Gain</div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    {/* Performance Stats */}
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      <div className="text-center">
                        <div className="text-sm font-bold text-green-400">{trader.winRate}%</div>
                        <div className="text-xs text-gray-400">Win Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-blue-400">{trader.activeTrades}</div>
                        <div className="text-xs text-gray-400">Active</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-purple-400">{trader.totalTrades}</div>
                        <div className="text-xs text-gray-400">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-yellow-400">+{trader.bestTrade}%</div>
                        <div className="text-xs text-gray-400">Best</div>
                      </div>
                    </div>

                    {/* Current Trade Details */}
                    {trader.currentTrade && (
                      <div className="mb-4 p-4 bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-lg font-medium text-white">{trader.currentTrade.symbol}</span>
                            <Badge className={getStatusColor(trader.currentTrade.status)} size="sm">
                              {trader.currentTrade.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-green-400 font-bold">+{calculatePnL(trader.currentTrade).toFixed(1)}%</div>
                            <div className="text-xs text-gray-400">Current P&L</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                          <div>
                            <span className="text-gray-400">Entry:</span>
                            <span className="text-white ml-2">${trader.currentTrade.entryPrice.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Current:</span>
                            <span className="text-cyan-400 ml-2">${trader.currentTrade.currentPrice.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Target:</span>
                            <span className="text-green-400 ml-2">${trader.currentTrade.exitTarget.toFixed(2)} (+{trader.currentTrade.gainPercentage.toFixed(1)}%)</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Stop:</span>
                            <span className="text-red-400 ml-2">${trader.currentTrade.stopLoss.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="text-xs text-gray-400 mb-1">Progress to Target:</div>
                          <Progress 
                            value={Math.min(100, (calculatePnL(trader.currentTrade) / trader.currentTrade.gainPercentage) * 100)} 
                            className="h-2" 
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-gray-400">R:R Ratio:</span>
                            <span className="text-purple-400 ml-2">{trader.currentTrade.riskRewardRatio.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Timeframe:</span>
                            <span className="text-blue-400 ml-2">{trader.currentTrade.timeframe}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Confidence:</span>
                            <span className="text-yellow-400 ml-2">{trader.currentTrade.confidence}%</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Duration:</span>
                            <span className="text-cyan-400 ml-2">{trader.currentTrade.expectedDuration}</span>
                          </div>
                        </div>

                        {/* Technical Analysis */}
                        <div className="mt-3 p-2 bg-gray-900 rounded text-xs">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-gray-400">RSI:</span>
                              <span className="text-purple-400 ml-2">{trader.currentTrade.technicals.rsi}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">MACD:</span>
                              <span className="text-blue-400 ml-2">{trader.currentTrade.technicals.macd}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Support:</span>
                              <span className="text-green-400 ml-2">${trader.currentTrade.technicals.support.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Resistance:</span>
                              <span className="text-red-400 ml-2">${trader.currentTrade.technicals.resistance.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Catalysts */}
                        <div className="mt-3">
                          <div className="text-xs text-gray-400 mb-1">Key Catalysts:</div>
                          <div className="flex flex-wrap gap-1">
                            {trader.currentTrade.catalysts.map((catalyst, i) => (
                              <Badge key={i} size="sm" variant="outline" className="text-xs text-yellow-300">
                                {catalyst}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Trader Style & Risk */}
                    <div className="text-xs">
                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <span className="text-gray-400">Style:</span>
                          <span className="text-cyan-400 ml-2">{trader.tradingStyle}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Risk Tolerance:</span>
                          <span className={`ml-2 ${getRiskColor(trader.riskTolerance)}`}>
                            {trader.riskTolerance.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Trading Philosophy */}
            <Card className="bg-gradient-to-r from-green-900/20 to-yellow-900/20 border-green-700">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Target className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Elite Swing Trading Philosophy</h3>
                    <p className="text-gray-300 text-sm mb-3">
                      Our swing masters target 30%+ gains through precise timing, disciplined risk management, and systematic 
                      position sizing. Each trade includes detailed entry/exit prices, stop losses, and profit targets with 
                      clear risk-reward ratios above 2:1.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-green-400 font-medium">Trade Structure:</span>
                        <ul className="text-gray-400 mt-1 space-y-1">
                          <li>• Precise entry and exit prices</li>
                          <li>• 30%+ minimum profit targets</li>
                          <li>• Risk-reward ratios above 2:1</li>
                          <li>• Tight stop-loss protection</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-yellow-400 font-medium">Strategy Focus:</span>
                        <ul className="text-gray-400 mt-1 space-y-1">
                          <li>• High-momentum breakouts</li>
                          <li>• Catalyst-driven events</li>
                          <li>• Technical pattern plays</li>
                          <li>• Short squeeze setups</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-blue-400 font-medium">Risk Management:</span>
                        <ul className="text-gray-400 mt-1 space-y-1">
                          <li>• Position sizing by volatility</li>
                          <li>• Dynamic stop-loss adjustment</li>
                          <li>• Portfolio correlation limits</li>
                          <li>• Maximum drawdown controls</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}