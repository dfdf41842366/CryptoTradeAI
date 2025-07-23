import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LivePrice } from "@/components/LivePrice";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Analytics } from "@shared/schema";
import { Zap, TrendingUp, TrendingDown, Target, Clock, BarChart3, Activity, AlertCircle } from "lucide-react";

interface OptionsFlow {
  symbol: string;
  totalPremium: number;
  callPremium: number;
  putPremium: number;
  callPutRatio: number;
  unusualActivity: boolean;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  largestTrade: {
    type: 'call' | 'put';
    strike: number;
    expiration: string;
    premium: number;
    volume: number;
  };
  ivRank: number;
  deltaFlow: number;
  gammaExposure: number;
}

interface UnusualOptionsActivity {
  symbol: string;
  strike: number;
  expiration: string;
  type: 'call' | 'put';
  volume: number;
  openInterest: number;
  premium: number;
  impliedVolatility: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  timestamp: Date;
  suspiciousActivity: boolean;
  institutionalFlow: boolean;
}

export function OptionsFlowPage() {
  const [flowType, setFlowType] = useState<'all' | 'unusual' | 'institutional'>('all');
  const [scanning, setScanning] = useState(false);

  const { data: analytics } = useQuery<Analytics>({
    queryKey: ['/api/analytics'],
  });

  const optionsFlow: OptionsFlow[] = [
    {
      symbol: 'TSLA',
      totalPremium: 45670000,
      callPremium: 31250000,
      putPremium: 14420000,
      callPutRatio: 2.17,
      unusualActivity: true,
      sentiment: 'bullish',
      largestTrade: {
        type: 'call',
        strike: 250,
        expiration: '2025-01-17',
        premium: 2850000,
        volume: 12400
      },
      ivRank: 78.4,
      deltaFlow: 8.2,
      gammaExposure: 145.7
    },
    {
      symbol: 'NVDA',
      totalPremium: 67840000,
      callPremium: 52100000,
      putPremium: 15740000,
      callPutRatio: 3.31,
      unusualActivity: true,
      sentiment: 'bullish',
      largestTrade: {
        type: 'call',
        strike: 520,
        expiration: '2025-02-21',
        premium: 4200000,
        volume: 8950
      },
      ivRank: 82.1,
      deltaFlow: 12.8,
      gammaExposure: 234.2
    },
    {
      symbol: 'AAPL',
      totalPremium: 23450000,
      callPremium: 12800000,
      putPremium: 10650000,
      callPutRatio: 1.20,
      unusualActivity: false,
      sentiment: 'neutral',
      largestTrade: {
        type: 'put',
        strike: 190,
        expiration: '2025-01-31',
        premium: 1650000,
        volume: 15600
      },
      ivRank: 45.7,
      deltaFlow: -2.1,
      gammaExposure: 89.3
    },
    {
      symbol: 'SPY',
      totalPremium: 189300000,
      callPremium: 98200000,
      putPremium: 91100000,
      callPutRatio: 1.08,
      unusualActivity: true,
      sentiment: 'bearish',
      largestTrade: {
        type: 'put',
        strike: 580,
        expiration: '2025-01-24',
        premium: 12400000,
        volume: 45000
      },
      ivRank: 67.3,
      deltaFlow: -18.4,
      gammaExposure: 456.8
    }
  ];

  const unusualActivity: UnusualOptionsActivity[] = [
    {
      symbol: 'TSLA',
      strike: 250,
      expiration: '2025-01-17',
      type: 'call',
      volume: 12400,
      openInterest: 8500,
      premium: 2850000,
      impliedVolatility: 0.67,
      delta: 0.58,
      gamma: 0.034,
      theta: -0.12,
      vega: 0.89,
      timestamp: new Date(Date.now() - 1800000),
      suspiciousActivity: true,
      institutionalFlow: true
    },
    {
      symbol: 'NVDA',
      strike: 520,
      expiration: '2025-02-21',
      type: 'call',
      volume: 8950,
      openInterest: 12300,
      premium: 4200000,
      impliedVolatility: 0.72,
      delta: 0.61,
      gamma: 0.028,
      theta: -0.08,
      vega: 1.14,
      timestamp: new Date(Date.now() - 2700000),
      suspiciousActivity: false,
      institutionalFlow: true
    },
    {
      symbol: 'GME',
      strike: 35,
      expiration: '2025-01-31',
      type: 'call',
      volume: 25600,
      openInterest: 2100,
      premium: 890000,
      impliedVolatility: 1.24,
      delta: 0.42,
      gamma: 0.067,
      theta: -0.18,
      vega: 0.52,
      timestamp: new Date(Date.now() - 3600000),
      suspiciousActivity: true,
      institutionalFlow: false
    }
  ];

  const getSentimentColor = (sentiment: OptionsFlow['sentiment']) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-400 bg-green-900/20 border-green-800';
      case 'bearish': return 'text-red-400 bg-red-900/20 border-red-800';
      case 'neutral': return 'text-gray-400 bg-gray-900/20 border-gray-800';
    }
  };

  const getTypeColor = (type: 'call' | 'put') => {
    return type === 'call' ? 'text-green-400' : 'text-red-400';
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const startScan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 2000);
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
                <h1 className="text-3xl font-bold text-white mb-2">Options Flow Intelligence</h1>
                <p className="text-gray-400">Real-time options activity and unusual flow detection</p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="text-orange-400 border-orange-400">
                  <Activity className="h-3 w-3 mr-1" />
                  Live Flow
                </Badge>
                <Button 
                  onClick={startScan}
                  disabled={scanning}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {scanning ? 'Scanning...' : 'Flow Scan'}
                </Button>
              </div>
            </div>

            {/* Flow Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-orange-400" />
                    <div>
                      <div className="text-2xl font-bold text-orange-400">
                        ${(optionsFlow.reduce((sum, f) => sum + f.totalPremium, 0) / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-sm text-gray-400">Total Premium</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <div>
                      <div className="text-2xl font-bold text-green-400">
                        ${(optionsFlow.reduce((sum, f) => sum + f.callPremium, 0) / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-sm text-gray-400">Call Premium</div>
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
                        ${(optionsFlow.reduce((sum, f) => sum + f.putPremium, 0) / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-sm text-gray-400">Put Premium</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-yellow-400" />
                    <div>
                      <div className="text-2xl font-bold text-yellow-400">
                        {optionsFlow.filter(f => f.unusualActivity).length}
                      </div>
                      <div className="text-sm text-gray-400">Unusual Activity</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Flow Type Controls */}
            <Card className="bg-[var(--trading-slate)] border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-400">View:</span>
                  <div className="flex space-x-2">
                    {(['all', 'unusual', 'institutional'] as const).map((type) => (
                      <Button
                        key={type}
                        size="sm"
                        variant={flowType === type ? "default" : "outline"}
                        onClick={() => setFlowType(type)}
                        className={flowType === type ? "bg-orange-600" : ""}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Options Flow Summary */}
            <Card className="bg-[var(--trading-slate)] border-gray-700">
              <CardHeader className="border-b border-gray-700">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-orange-400" />
                  <h2 className="text-lg font-semibold text-white">Options Flow Summary</h2>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2 text-gray-400">Symbol</th>
                        <th className="text-right py-2 text-gray-400">Total Premium</th>
                        <th className="text-right py-2 text-gray-400">C/P Ratio</th>
                        <th className="text-center py-2 text-gray-400">Sentiment</th>
                        <th className="text-right py-2 text-gray-400">IV Rank</th>
                        <th className="text-right py-2 text-gray-400">Delta Flow</th>
                        <th className="text-center py-2 text-gray-400">Unusual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {optionsFlow.map((flow, index) => (
                        <tr key={index} className="border-b border-gray-800">
                          <td className="py-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-white font-medium">${flow.symbol}</span>
                              <LivePrice symbol={flow.symbol} showLabel={false} className="text-gray-400 text-xs" />
                              {flow.unusualActivity && (
                                <AlertCircle className="h-3 w-3 text-yellow-400" />
                              )}
                            </div>
                          </td>
                          <td className="py-3 text-right text-orange-400 font-medium">
                            ${(flow.totalPremium / 1000000).toFixed(1)}M
                          </td>
                          <td className="py-3 text-right">
                            <span className={`font-medium ${
                              flow.callPutRatio > 2 ? 'text-green-400' : 
                              flow.callPutRatio < 0.8 ? 'text-red-400' : 'text-gray-300'
                            }`}>
                              {flow.callPutRatio.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <Badge className={getSentimentColor(flow.sentiment)}>
                              {flow.sentiment.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-3 text-right">
                            <span className={`font-medium ${
                              flow.ivRank > 80 ? 'text-red-400' : 
                              flow.ivRank > 60 ? 'text-yellow-400' : 'text-gray-300'
                            }`}>
                              {flow.ivRank.toFixed(1)}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <span className={`font-medium ${
                              flow.deltaFlow > 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {flow.deltaFlow > 0 ? '+' : ''}{flow.deltaFlow.toFixed(1)}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            {flow.unusualActivity ? (
                              <Badge className="text-orange-400 bg-orange-900/20 border-orange-800">
                                YES
                              </Badge>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Unusual Activity Feed */}
            <Card className="bg-[var(--trading-slate)] border-gray-700">
              <CardHeader className="border-b border-gray-700">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-yellow-400" />
                  <h2 className="text-lg font-semibold text-white">Unusual Activity Feed</h2>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  {unusualActivity.map((activity, index) => (
                    <div key={index} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-blue-600 text-white">${activity.symbol}</Badge>
                          <span className={`font-medium ${getTypeColor(activity.type)}`}>
                            {activity.type.toUpperCase()} ${activity.strike}
                          </span>
                          <Badge variant="outline" className="text-gray-400">
                            {activity.expiration}
                          </Badge>
                          {activity.suspiciousActivity && (
                            <Badge className="text-red-400 bg-red-900/20 border-red-800">
                              SUSPICIOUS
                            </Badge>
                          )}
                          {activity.institutionalFlow && (
                            <Badge className="text-purple-400 bg-purple-900/20 border-purple-800">
                              INSTITUTIONAL
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">
                            ${(activity.premium / 1000000).toFixed(1)}M premium
                          </div>
                          <div className="text-gray-400 text-sm">
                            {formatTimeAgo(activity.timestamp)}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                        <div>
                          <div className="text-gray-400">Volume</div>
                          <div className="text-white font-medium">{activity.volume.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Open Int</div>
                          <div className="text-white font-medium">{activity.openInterest.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">IV</div>
                          <div className="text-yellow-400 font-medium">{(activity.impliedVolatility * 100).toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Delta</div>
                          <div className="text-blue-400 font-medium">{activity.delta.toFixed(3)}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Gamma</div>
                          <div className="text-green-400 font-medium">{activity.gamma.toFixed(3)}</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Theta</div>
                          <div className="text-red-400 font-medium">{activity.theta.toFixed(3)}</div>
                        </div>
                      </div>

                      <div className="mt-3 p-2 bg-gray-900 rounded flex justify-between items-center">
                        <div className="text-xs text-gray-400">
                          Vol/OI Ratio: {(activity.volume / activity.openInterest).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-400">
                          Vega: {activity.vega.toFixed(3)}
                        </div>
                        {activity.volume > activity.openInterest * 2 && (
                          <Badge size="sm" className="text-orange-400 bg-orange-900/20 border-orange-800">
                            HIGH ACTIVITY
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}