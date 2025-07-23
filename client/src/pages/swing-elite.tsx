import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LivePrice } from "@/components/LivePrice";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Analytics } from "@shared/schema";
import { TrendingUp, Target, Shield, DollarSign, Zap, Star, Trophy, Activity, Eye, Brain } from "lucide-react";

interface SwingTrade {
  id: string;
  symbol: string;
  entryPrice: number;
  exitTarget: number;
  stopLoss: number;
  currentPrice: number;
  gainTarget: number;
  riskReward: number;
  timeframe: string;
  strategy: string;
  status: 'active' | 'profit' | 'stopped' | 'waiting';
  confidence: number;
  reasoning: string;
  catalysts: string[];
  technicals: string;
}

interface SwingTrader {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  winRate: number;
  avgGain: number;
  biggestWin: number;
  currentTrades: number;
  todayPnL: number;
  personality: string;
  currentTrade?: SwingTrade;
  recentWins: Array<{
    symbol: string;
    gain: number;
    timeframe: string;
    strategy: string;
  }>;
  tradingStyle: string;
  riskTolerance: 'aggressive' | 'moderate' | 'conservative';
}

export default function SwingElitePage() {
  const [teamActive, setTeamActive] = useState(true);
  const [totalPnL, setTotalPnL] = useState(18742.38);
  const [activeTrades, setActiveTrades] = useState(12);
  const [avgGainTarget, setAvgGainTarget] = useState(34.7);
  
  const { data: analytics } = useQuery<Analytics>({
    queryKey: ["/api/analytics"],
  });

  const swingTrades: SwingTrade[] = [
    {
      id: 'trade_1',
      symbol: 'PROG',
      entryPrice: 1.84,
      exitTarget: 2.58,
      stopLoss: 1.67,
      currentPrice: 1.89,
      gainTarget: 40.2,
      riskReward: 4.35,
      timeframe: '3-5 days',
      strategy: 'Biotech Catalyst Breakout',
      status: 'active',
      confidence: 87,
      reasoning: 'FDA approval catalyst with ultra-low float creating squeeze potential',
      catalysts: ['FDA Decision', 'Partnership Rumors', 'Short Squeeze'],
      technicals: 'Cup & Handle breakout, RSI oversold recovery'
    },
    {
      id: 'trade_2',
      symbol: 'KOSS',
      entryPrice: 3.42,
      exitTarget: 4.89,
      stopLoss: 3.08,
      currentPrice: 3.67,
      gainTarget: 43.0,
      riskReward: 4.32,
      timeframe: '2-4 days',
      strategy: 'Momentum Breakout Play',
      status: 'active',
      confidence: 92,
      reasoning: 'High short interest with volume breakout and social media momentum',
      catalysts: ['Reddit Attention', 'Volume Surge', 'Short Cover'],
      technicals: 'Bull flag formation, MACD bullish cross'
    },
    {
      id: 'trade_3',
      symbol: 'BBIG',
      entryPrice: 0.94,
      exitTarget: 1.31,
      stopLoss: 0.85,
      currentPrice: 1.02,
      gainTarget: 39.4,
      riskReward: 4.11,
      timeframe: '1-3 days',
      strategy: 'Oversold Bounce Setup',
      status: 'profit',
      confidence: 78,
      reasoning: 'Extremely oversold with high probability bounce play',
      catalysts: ['Oversold Conditions', 'Insider Buying', 'Sector Rotation'],
      technicals: 'Hammer candlestick, support level hold'
    }
  ];

  const swingTraders: SwingTrader[] = [
    {
      id: 'momentum_hunter',
      name: 'Momentum Hunter',
      specialty: 'High-Momentum Breakouts',
      experience: '12 years swing trading',
      winRate: 73.8,
      avgGain: 42.7,
      biggestWin: 187.3,
      currentTrades: 3,
      todayPnL: 4832.47,
      personality: 'Aggressive momentum chaser with excellent timing',
      tradingStyle: 'Breakout momentum with volume confirmation',
      riskTolerance: 'aggressive',
      currentTrade: swingTrades[0],
      recentWins: [
        { symbol: 'MULN', gain: 67.4, timeframe: '2 days', strategy: 'EV Momentum' },
        { symbol: 'EXPR', gain: 45.8, timeframe: '1 day', strategy: 'Retail Revival' },
        { symbol: 'CLOV', gain: 38.2, timeframe: '3 days', strategy: 'Healthcare Play' }
      ]
    },
    {
      id: 'catalyst_king',
      name: 'Catalyst King',
      specialty: 'Event-Driven Swing Plays',
      experience: '15 years biotech trading',
      winRate: 81.2,
      avgGain: 51.3,
      biggestWin: 234.7,
      currentTrades: 2,
      todayPnL: 6247.91,
      personality: 'Patient catalyst hunter with deep research',
      tradingStyle: 'FDA approvals, earnings surprises, partnership deals',
      riskTolerance: 'moderate',
      currentTrade: swingTrades[1],
      recentWins: [
        { symbol: 'AVXL', gain: 89.3, timeframe: '4 days', strategy: 'FDA Catalyst' },
        { symbol: 'CYDY', gain: 62.7, timeframe: '2 days', strategy: 'Trial Results' },
        { symbol: 'ATOS', gain: 43.9, timeframe: '3 days', strategy: 'Partnership' }
      ]
    },
    {
      id: 'squeeze_master',
      name: 'Squeeze Master',
      specialty: 'Short Squeeze Identification',
      experience: '9 years squeeze hunting',
      winRate: 69.4,
      avgGain: 58.6,
      biggestWin: 312.8,
      currentTrades: 4,
      todayPnL: 3892.64,
      personality: 'Aggressive short squeeze specialist',
      tradingStyle: 'High short interest with low float targeting',
      riskTolerance: 'aggressive',
      currentTrade: swingTrades[2],
      recentWins: [
        { symbol: 'GME', gain: 78.2, timeframe: '1 day', strategy: 'Gamma Squeeze' },
        { symbol: 'AMC', gain: 54.1, timeframe: '2 days', strategy: 'Short Cover' },
        { symbol: 'BBBY', gain: 91.7, timeframe: '1 day', strategy: 'Meme Squeeze' }
      ]
    },
    {
      id: 'reversal_expert',
      name: 'Reversal Expert',
      specialty: 'Oversold Bounce Plays',
      experience: '11 years contrarian trading',
      winRate: 77.9,
      avgGain: 37.8,
      biggestWin: 156.4,
      currentTrades: 2,
      todayPnL: 2847.23,
      personality: 'Patient contrarian with excellent entry timing',
      tradingStyle: 'Oversold reversals with technical confirmation',
      riskTolerance: 'moderate',
      recentWins: [
        { symbol: 'RIVN', gain: 42.3, timeframe: '5 days', strategy: 'Oversold Bounce' },
        { symbol: 'LCID', gain: 35.7, timeframe: '4 days', strategy: 'Support Hold' },
        { symbol: 'NIO', gain: 48.9, timeframe: '3 days', strategy: 'China Recovery' }
      ]
    },
    {
      id: 'breakout_baron',
      name: 'Breakout Baron',
      specialty: 'Pattern Breakouts',
      experience: '14 years technical analysis',
      winRate: 75.6,
      avgGain: 41.2,
      biggestWin: 198.7,
      currentTrades: 1,
      todayPnL: 922.13,
      personality: 'Technical perfectionist with pattern expertise',
      tradingStyle: 'Classic chart patterns with volume confirmation',
      riskTolerance: 'moderate',
      recentWins: [
        { symbol: 'SPCE', gain: 52.8, timeframe: '6 days', strategy: 'Cup & Handle' },
        { symbol: 'PLTR', gain: 33.4, timeframe: '4 days', strategy: 'Bull Flag' },
        { symbol: 'SOFI', gain: 46.1, timeframe: '5 days', strategy: 'Triangle Break' }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-400 bg-blue-900/20 border-blue-800';
      case 'profit': return 'text-green-400 bg-green-900/20 border-green-800';
      case 'stopped': return 'text-red-400 bg-red-900/20 border-red-800';
      case 'waiting': return 'text-yellow-400 bg-yellow-900/20 border-yellow-800';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-800';
    }
  };

  const getRiskColor = (riskTolerance: string) => {
    switch (riskTolerance) {
      case 'aggressive': return 'text-red-400';
      case 'moderate': return 'text-yellow-400';
      case 'conservative': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const teamStats = {
    totalTrades: activeTrades,
    avgWinRate: swingTraders.reduce((sum, trader) => sum + trader.winRate, 0) / swingTraders.length,
    totalPnL: swingTraders.reduce((sum, trader) => sum + trader.todayPnL, 0),
    avgGainTarget: avgGainTarget
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
                  Elite Swing Trading Team
                </h1>
                <p className="text-gray-400">High-gain swing traders targeting 30%+ returns with precise entry/exit strategies</p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="text-green-400 border-green-400">
                  <Trophy className="h-3 w-3 mr-1" />
                  Elite Team
                </Badge>
                <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                  <Target className="h-3 w-3 mr-1" />
                  30%+ Target
                </Badge>
              </div>
            </div>

            {/* Team Performance Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-green-400" />
                    <div>
                      <div className="text-2xl font-bold text-green-400">
                        +${teamStats.totalPnL.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">Team P&L Today</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-400" />
                    <div>
                      <div className="text-2xl font-bold text-blue-400">
                        {teamStats.avgWinRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-400">Avg Win Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-purple-400" />
                    <div>
                      <div className="text-2xl font-bold text-purple-400">
                        {teamStats.totalTrades}
                      </div>
                      <div className="text-sm text-gray-400">Active Trades</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-yellow-400" />
                    <div>
                      <div className="text-2xl font-bold text-yellow-400">
                        +{teamStats.avgGainTarget.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-400">Avg Gain Target</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Trades with Detailed Metrics */}
            <Card className="bg-[var(--trading-slate)] border-gray-700">
              <CardHeader className="border-b border-gray-700">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-green-400" />
                  <h2 className="text-lg font-semibold text-white">Active High-Gain Trades</h2>
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
                        <th className="text-right p-4 text-gray-400">Gain Target</th>
                        <th className="text-right p-4 text-gray-400">R:R Ratio</th>
                        <th className="text-right p-4 text-gray-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {swingTrades.map((trade, index) => (
                        <tr key={index} className="border-b border-gray-800 hover:bg-green-900/10">
                          <td className="p-4">
                            <div className="text-white font-medium">{trade.symbol}</div>
                            <div className="text-xs text-gray-400">{trade.strategy}</div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="text-blue-400 font-medium">${trade.entryPrice.toFixed(2)}</div>
                          </td>
                          <td className="p-4 text-right">
                            <LivePrice symbol={trade.symbol} className="text-white font-medium" />
                            <div className="text-xs text-green-400">
                              +{(((trade.currentPrice - trade.entryPrice) / trade.entryPrice) * 100).toFixed(1)}%
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="text-green-400 font-medium">${trade.exitTarget.toFixed(2)}</div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="text-red-400 font-medium">${trade.stopLoss.toFixed(2)}</div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="text-yellow-400 font-bold">+{trade.gainTarget.toFixed(1)}%</div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="text-purple-400 font-medium">{trade.riskReward.toFixed(1)}:1</div>
                          </td>
                          <td className="p-4 text-right">
                            <Badge className={getStatusColor(trade.status)}>
                              {trade.status.toUpperCase()}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Elite Swing Traders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {swingTraders.map((trader) => (
                <Card key={trader.id} className="bg-[var(--trading-slate)] border-gray-700">
                  <CardHeader className="border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-yellow-600 flex items-center justify-center">
                          <Star className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{trader.name}</h3>
                          <p className="text-sm text-gray-400">{trader.specialty}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-400">+${trader.todayPnL.toLocaleString()}</div>
                        <div className="text-sm text-gray-400">Today P&L</div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    {/* Performance Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-400">{trader.winRate}%</div>
                        <div className="text-xs text-gray-400">Win Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-400">+{trader.avgGain}%</div>
                        <div className="text-xs text-gray-400">Avg Gain</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-400">+{trader.biggestWin}%</div>
                        <div className="text-xs text-gray-400">Best Win</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-400">{trader.currentTrades}</div>
                        <div className="text-xs text-gray-400">Active</div>
                      </div>
                    </div>

                    {/* Current Trade */}
                    {trader.currentTrade && (
                      <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">Current Focus</span>
                          <Badge className={getStatusColor(trader.currentTrade.status)}>
                            {trader.currentTrade.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400">Symbol:</span>
                            <span className="text-white ml-2 font-medium">{trader.currentTrade.symbol}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Target:</span>
                            <span className="text-yellow-400 ml-2 font-medium">+{trader.currentTrade.gainTarget.toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Entry:</span>
                            <span className="text-blue-400 ml-2">${trader.currentTrade.entryPrice.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Stop:</span>
                            <span className="text-red-400 ml-2">${trader.currentTrade.stopLoss.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">{trader.currentTrade.reasoning}</div>
                      </div>
                    )}

                    {/* Recent Big Wins */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Recent Big Wins</h4>
                      <div className="space-y-2">
                        {trader.recentWins.slice(0, 2).map((win, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <span className="text-white font-medium">{win.symbol}</span>
                              <span className="text-gray-400">{win.timeframe}</span>
                            </div>
                            <div className="text-green-400 font-bold">+{win.gain.toFixed(1)}%</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Trader Profile */}
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Style: {trader.tradingStyle}</div>
                      <div>Risk: <span className={getRiskColor(trader.riskTolerance)}>{trader.riskTolerance.toUpperCase()}</span></div>
                      <div>Experience: {trader.experience}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Trading Strategy Explanation */}
            <Card className="bg-gradient-to-r from-green-900/20 to-yellow-900/20 border-green-700">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Trophy className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Elite Swing Trading Strategy</h3>
                    <p className="text-gray-300 text-sm mb-3">
                      Our elite swing trading team focuses exclusively on high-probability setups targeting 30%+ gains. 
                      Each trade includes precise entry points, profit targets, stop losses, and risk-reward ratios 
                      calculated for maximum profitability with controlled risk.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-green-400 font-medium">Selection Criteria:</span>
                        <ul className="text-gray-400 mt-1 space-y-1">
                          <li>• Minimum 30% gain target</li>
                          <li>• Risk-reward ratio 3:1 or better</li>
                          <li>• Strong catalyst or technical setup</li>
                          <li>• Low-float preferred (under 10M)</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-yellow-400 font-medium">Risk Management:</span>
                        <ul className="text-gray-400 mt-1 space-y-1">
                          <li>• Precise stop-loss levels</li>
                          <li>• Position sizing based on volatility</li>
                          <li>• Maximum 2% account risk per trade</li>
                          <li>• Profit taking at predetermined levels</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-purple-400 font-medium">Trade Types:</span>
                        <ul className="text-gray-400 mt-1 space-y-1">
                          <li>• Biotech catalyst plays</li>
                          <li>• Momentum breakout setups</li>
                          <li>• Short squeeze candidates</li>
                          <li>• Oversold bounce opportunities</li>
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