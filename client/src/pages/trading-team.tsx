import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LivePrice } from "@/components/LivePrice";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Analytics } from "@shared/schema";
import { Users, Target, TrendingUp, AlertCircle, Brain, Zap, Eye, Activity, Star } from "lucide-react";

interface TraderAgent {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  winRate: number;
  tradesTotal: number;
  todayTrades: number;
  todayWins: number;
  avgGain: number;
  status: 'active' | 'scanning' | 'analyzing' | 'trading';
  currentTrade?: {
    symbol: string;
    action: 'BUY' | 'SELL';
    price: number;
    reason: string;
    confidence: number;
  };
  recentSignals: Array<{
    symbol: string;
    action: string;
    time: string;
    result: 'WIN' | 'LOSS' | 'PENDING';
    gain: number;
  }>;
}

export default function TradingTeamPage() {
  const [teamActive, setTeamActive] = useState(true);
  const [dailyPnL, setDailyPnL] = useState(2847.65);
  const [totalTrades, setTotalTrades] = useState(23);
  const [winningTrades, setWinningTrades] = useState(18);

  const { data: analytics } = useQuery<Analytics>({
    queryKey: ["/api/analytics"],
  });

  const tradingTeam: TraderAgent[] = [
    {
      id: 'momentum_mike',
      name: 'Momentum Mike',
      specialty: 'Low-Float Momentum',
      experience: '8 years',
      winRate: 87.3,
      tradesTotal: 1247,
      todayTrades: 5,
      todayWins: 4,
      avgGain: 12.8,
      status: 'active',
      currentTrade: {
        symbol: 'PROG',
        action: 'BUY',
        price: 1.84,
        reason: 'Ultra-low float breakout with volume surge',
        confidence: 92
      },
      recentSignals: [
        { symbol: 'KOSS', action: 'BUY', time: '09:45', result: 'WIN', gain: 23.4 },
        { symbol: 'BBIG', action: 'SELL', time: '10:15', result: 'WIN', gain: 18.7 },
        { symbol: 'SAVA', action: 'BUY', time: '11:30', result: 'PENDING', gain: 0 },
        { symbol: 'MULN', action: 'BUY', time: '13:20', result: 'WIN', gain: 31.2 },
        { symbol: 'CLOV', action: 'SELL', time: '14:45', result: 'LOSS', gain: -5.8 }
      ]
    },
    {
      id: 'biotech_betty',
      name: 'Biotech Betty',
      specialty: 'Healthcare Catalysts',
      experience: '12 years',
      winRate: 79.6,
      tradesTotal: 892,
      todayTrades: 3,
      todayWins: 3,
      avgGain: 18.4,
      status: 'scanning',
      recentSignals: [
        { symbol: 'AVXL', action: 'BUY', time: '09:30', result: 'WIN', gain: 42.8 },
        { symbol: 'CYDY', action: 'BUY', time: '12:00', result: 'WIN', gain: 28.3 },
        { symbol: 'ATOS', action: 'BUY', time: '15:15', result: 'WIN', gain: 19.7 }
      ]
    },
    {
      id: 'scalp_sam',
      name: 'Scalp Sam',
      specialty: 'High-Frequency Scalping',
      experience: '6 years',
      winRate: 91.2,
      tradesTotal: 3418,
      todayTrades: 12,
      todayWins: 11,
      avgGain: 3.4,
      status: 'trading',
      currentTrade: {
        symbol: 'GME',
        action: 'SELL',
        price: 14.23,
        reason: 'Quick scalp on volume spike',
        confidence: 85
      },
      recentSignals: [
        { symbol: 'AMC', action: 'BUY', time: '09:31', result: 'WIN', gain: 4.2 },
        { symbol: 'GME', action: 'BUY', time: '09:33', result: 'WIN', gain: 2.8 },
        { symbol: 'BB', action: 'SELL', time: '09:45', result: 'WIN', gain: 5.1 },
        { symbol: 'KOSS', action: 'BUY', time: '10:02', result: 'WIN', gain: 3.7 },
        { symbol: 'AMC', action: 'SELL', time: '10:15', result: 'LOSS', gain: -1.9 }
      ]
    },
    {
      id: 'pattern_pete',
      name: 'Pattern Pete',
      specialty: 'Technical Analysis',
      experience: '15 years',
      winRate: 84.1,
      tradesTotal: 2156,
      todayTrades: 4,
      todayWins: 3,
      avgGain: 15.7,
      status: 'analyzing',
      currentTrade: {
        symbol: 'SPCE',
        action: 'BUY',
        price: 8.92,
        reason: 'Cup and handle pattern completion',
        confidence: 88
      },
      recentSignals: [
        { symbol: 'RIVN', action: 'BUY', time: '10:30', result: 'WIN', gain: 22.1 },
        { symbol: 'LCID', action: 'SELL', time: '12:45', result: 'WIN', gain: 16.4 },
        { symbol: 'NIO', action: 'BUY', time: '14:20', result: 'WIN', gain: 11.8 },
        { symbol: 'XPEV', action: 'SELL', time: '15:45', result: 'LOSS', gain: -7.3 }
      ]
    },
    {
      id: 'news_nancy',
      name: 'News Nancy',
      specialty: 'Catalyst Trading',
      experience: '10 years',
      winRate: 76.8,
      tradesTotal: 1834,
      todayTrades: 2,
      todayWins: 2,
      avgGain: 24.3,
      status: 'active',
      currentTrade: {
        symbol: 'WKHS',
        action: 'BUY',
        price: 0.87,
        reason: 'Positive news catalyst on EV contract',
        confidence: 78
      },
      recentSignals: [
        { symbol: 'GOEV', action: 'BUY', time: '11:00', result: 'WIN', gain: 35.6 },
        { symbol: 'HYLN', action: 'BUY', time: '13:30', result: 'WIN', gain: 21.9 }
      ]
    },
    {
      id: 'volatility_vic',
      name: 'Volatility Vic',
      specialty: 'Options & Volatility',
      experience: '9 years',
      winRate: 82.4,
      tradesTotal: 1643,
      todayTrades: 6,
      todayWins: 5,
      avgGain: 19.8,
      status: 'scanning',
      recentSignals: [
        { symbol: 'BBBY', action: 'BUY', time: '09:35', result: 'WIN', gain: 48.2 },
        { symbol: 'EXPR', action: 'BUY', time: '10:50', result: 'WIN', gain: 27.4 },
        { symbol: 'NAKD', action: 'SELL', time: '12:15', result: 'WIN', gain: 19.8 },
        { symbol: 'WISH', action: 'BUY', time: '13:45', result: 'WIN', gain: 22.7 },
        { symbol: 'ATER', action: 'SELL', time: '14:30', result: 'WIN', gain: 15.3 },
        { symbol: 'INDO', action: 'BUY', time: '15:20', result: 'LOSS', gain: -8.9 }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-900/20 border-green-800';
      case 'trading': return 'text-blue-400 bg-blue-900/20 border-blue-800';
      case 'analyzing': return 'text-yellow-400 bg-yellow-900/20 border-yellow-800';
      case 'scanning': return 'text-purple-400 bg-purple-900/20 border-purple-800';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-800';
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'WIN': return 'text-green-400';
      case 'LOSS': return 'text-red-400';
      case 'PENDING': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const teamWinRate = ((winningTrades / totalTrades) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-[var(--trading-dark)]">
      <Header analytics={analytics} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-64">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">AI Trading Team</h1>
                <p className="text-gray-400">6 specialized AI traders working 24/7 to find winning trades</p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="text-green-400 border-green-400">
                  <Users className="h-3 w-3 mr-1" />
                  Team Active
                </Badge>
                <Badge variant="outline" className="text-blue-400 border-blue-400">
                  <Brain className="h-3 w-3 mr-1" />
                  AI Powered
                </Badge>
              </div>
            </div>

            {/* Daily Performance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <div>
                      <div className="text-2xl font-bold text-green-400">
                        +${dailyPnL.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">Daily P&L</div>
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
                        {teamWinRate}%
                      </div>
                      <div className="text-sm text-gray-400">Team Win Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-purple-400" />
                    <div>
                      <div className="text-2xl font-bold text-purple-400">
                        {totalTrades}
                      </div>
                      <div className="text-sm text-gray-400">Trades Today</div>
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
                        {winningTrades}
                      </div>
                      <div className="text-sm text-gray-400">Winning Trades</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trading Team Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tradingTeam.map((trader) => (
                <Card key={trader.id} className="bg-[var(--trading-slate)] border-gray-700">
                  <CardHeader className="border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <Brain className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{trader.name}</h3>
                          <p className="text-sm text-gray-400">{trader.specialty} • {trader.experience}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(trader.status)}>
                        {trader.status.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    {/* Performance Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-400">{trader.winRate}%</div>
                        <div className="text-xs text-gray-400">Win Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-400">{trader.todayTrades}</div>
                        <div className="text-xs text-gray-400">Today</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-400">+{trader.avgGain}%</div>
                        <div className="text-xs text-gray-400">Avg Gain</div>
                      </div>
                    </div>

                    {/* Current Trade */}
                    {trader.currentTrade && (
                      <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">Current Trade</span>
                          <Badge className={trader.currentTrade.action === 'BUY' ? 'text-green-400 bg-green-900/20 border-green-800' : 'text-red-400 bg-red-900/20 border-red-800'}>
                            {trader.currentTrade.action}
                          </Badge>
                        </div>
                        <div className="text-lg font-bold text-white mb-1 flex items-center space-x-2">
                          <span>{trader.currentTrade.symbol} @</span>
                          <LivePrice symbol={trader.currentTrade.symbol} className="text-white" showLabel={false} />
                        </div>
                        <div className="text-sm text-gray-400 mb-2">{trader.currentTrade.reason}</div>
                        <div className="text-xs text-blue-400">Confidence: {trader.currentTrade.confidence}%</div>
                      </div>
                    )}

                    {/* Recent Signals */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Recent Signals</h4>
                      <div className="space-y-2">
                        {trader.recentSignals.slice(0, 3).map((signal, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <span className="text-white font-medium">{signal.symbol}</span>
                              <Badge className={signal.action === 'BUY' ? 'text-green-400 bg-green-900/20 border-green-800 text-xs' : 'text-red-400 bg-red-900/20 border-red-800 text-xs'}>
                                {signal.action}
                              </Badge>
                              <span className="text-gray-400">{signal.time}</span>
                            </div>
                            <div className={`font-medium ${getResultColor(signal.result)}`}>
                              {signal.result === 'PENDING' ? 'PENDING' : `${signal.gain >= 0 ? '+' : ''}${signal.gain.toFixed(1)}%`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Team Strategy Notice */}
            <Card className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-700">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Users className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">AI Trading Team Strategy</h3>
                    <p className="text-gray-300 text-sm mb-3">
                      Your specialized AI trading team works around the clock to identify winning opportunities in low-float stocks.
                      Each trader has unique expertise and proven track records for consistent daily profits.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-green-400 font-medium">Team Advantages:</span>
                        <ul className="text-gray-400 mt-1 space-y-1">
                          <li>• 24/7 market monitoring</li>
                          <li>• Specialized expertise areas</li>
                          <li>• Proven win rates 76-91%</li>
                          <li>• Real-time signal generation</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-blue-400 font-medium">Trading Focus:</span>
                        <ul className="text-gray-400 mt-1 space-y-1">
                          <li>• Low-float momentum plays</li>
                          <li>• Biotech catalyst events</li>
                          <li>• High-frequency scalping</li>
                          <li>• Technical pattern breakouts</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-purple-400 font-medium">Risk Management:</span>
                        <ul className="text-gray-400 mt-1 space-y-1">
                          <li>• Position size limits</li>
                          <li>• Stop-loss automation</li>
                          <li>• Daily P&L monitoring</li>
                          <li>• Team performance tracking</li>
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