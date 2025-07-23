import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LivePrice } from "@/components/LivePrice";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Analytics } from "@shared/schema";
import { Eye, EyeOff, TrendingUp, TrendingDown, DollarSign, Users, Activity, AlertTriangle, Target } from "lucide-react";

interface DarkPoolActivity {
  symbol: string;
  darkVolume: number;
  darkVolumePercent: number;
  totalVolume: number;
  avgDarkPrice: number;
  currentPrice: number;
  institutionalFlow: 'bullish' | 'bearish' | 'neutral';
  confidenceLevel: number;
  unusualActivity: boolean;
  blockTrades: number;
  participantCount: number;
  timeframe: string;
}

interface WhaleActivity {
  symbol: string;
  tradeSize: number;
  tradePrice: number;
  direction: 'buy' | 'sell';
  timestamp: Date;
  estimatedInstitution: string;
  marketImpact: number;
  followTrade: boolean;
}

export function DarkPoolsPage() {
  const [showOnlyUnusual, setShowOnlyUnusual] = useState(false);
  const [scanning, setScanning] = useState(false);

  const { data: analytics } = useQuery<Analytics>({
    queryKey: ['/api/analytics'],
  });

  const darkPoolData: DarkPoolActivity[] = [
    {
      symbol: 'TSLA',
      darkVolume: 12450000,
      darkVolumePercent: 34.7,
      totalVolume: 35873000,
      avgDarkPrice: 242.15,
      currentPrice: 238.92,
      institutionalFlow: 'bullish',
      confidenceLevel: 87.3,
      unusualActivity: true,
      blockTrades: 47,
      participantCount: 23,
      timeframe: '1D'
    },
    {
      symbol: 'NVDA',
      darkVolume: 8730000,
      darkVolumePercent: 41.2,
      totalVolume: 21203000,
      avgDarkPrice: 515.80,
      currentPrice: 512.43,
      institutionalFlow: 'bullish',
      confidenceLevel: 92.1,
      unusualActivity: true,
      blockTrades: 63,
      participantCount: 31,
      timeframe: '1D'
    },
    {
      symbol: 'AAPL',
      darkVolume: 15680000,
      darkVolumePercent: 28.9,
      totalVolume: 54280000,
      avgDarkPrice: 193.45,
      currentPrice: 192.35,
      institutionalFlow: 'neutral',
      confidenceLevel: 74.8,
      unusualActivity: false,
      blockTrades: 32,
      participantCount: 18,
      timeframe: '1D'
    },
    {
      symbol: 'GME',
      darkVolume: 2340000,
      darkVolumePercent: 52.1,
      totalVolume: 4492000,
      avgDarkPrice: 32.80,
      currentPrice: 31.20,
      institutionalFlow: 'bearish',
      confidenceLevel: 68.9,
      unusualActivity: true,
      blockTrades: 18,
      participantCount: 12,
      timeframe: '1D'
    }
  ];

  const whaleActivity: WhaleActivity[] = [
    {
      symbol: 'TSLA',
      tradeSize: 850000,
      tradePrice: 241.75,
      direction: 'buy',
      timestamp: new Date(Date.now() - 900000),
      estimatedInstitution: 'BlackRock',
      marketImpact: 2.3,
      followTrade: true
    },
    {
      symbol: 'NVDA',
      tradeSize: 520000,
      tradePrice: 514.20,
      direction: 'buy',
      timestamp: new Date(Date.now() - 1800000),
      estimatedInstitution: 'Vanguard',
      marketImpact: 1.8,
      followTrade: true
    },
    {
      symbol: 'GME',
      tradeSize: 1200000,
      tradePrice: 32.10,
      direction: 'sell',
      timestamp: new Date(Date.now() - 2700000),
      estimatedInstitution: 'Citadel',
      marketImpact: -3.4,
      followTrade: false
    }
  ];

  const getFlowColor = (flow: DarkPoolActivity['institutionalFlow']) => {
    switch (flow) {
      case 'bullish': return 'text-green-400 bg-green-900/20 border-green-800';
      case 'bearish': return 'text-red-400 bg-red-900/20 border-red-800';
      case 'neutral': return 'text-gray-400 bg-gray-900/20 border-gray-800';
    }
  };

  const getDirectionIcon = (direction: WhaleActivity['direction']) => {
    return direction === 'buy' ? 
      <TrendingUp className="h-4 w-4 text-green-400" /> : 
      <TrendingDown className="h-4 w-4 text-red-400" />;
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

  const filteredData = showOnlyUnusual ? darkPoolData.filter(d => d.unusualActivity) : darkPoolData;

  return (
    <div className="min-h-screen bg-[var(--trading-dark)]">
      <Header analytics={analytics} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-64">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Dark Pool Intelligence</h1>
                <p className="text-gray-400">Track institutional whale activity and hidden order flow</p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="text-green-400 border-green-400">
                  <Eye className="h-3 w-3 mr-1" />
                  Live Monitoring
                </Badge>
                <Button 
                  onClick={startScan}
                  disabled={scanning}
                  className="bg-gray-800 hover:bg-gray-700"
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  {scanning ? 'Scanning...' : 'Deep Scan'}
                </Button>
              </div>
            </div>

            {/* Dark Pool Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <EyeOff className="h-4 w-4 text-purple-400" />
                    <div>
                      <div className="text-2xl font-bold text-purple-400">
                        {darkPoolData.reduce((sum, d) => sum + d.darkVolume, 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">Dark Volume</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-400" />
                    <div>
                      <div className="text-2xl font-bold text-blue-400">
                        {darkPoolData.reduce((sum, d) => sum + d.blockTrades, 0)}
                      </div>
                      <div className="text-sm text-gray-400">Block Trades</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <div>
                      <div className="text-2xl font-bold text-yellow-400">
                        {darkPoolData.filter(d => d.unusualActivity).length}
                      </div>
                      <div className="text-sm text-gray-400">Unusual Activity</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-green-400" />
                    <div>
                      <div className="text-2xl font-bold text-green-400">89.4%</div>
                      <div className="text-sm text-gray-400">Detection Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Controls */}
            <Card className="bg-[var(--trading-slate)] border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="unusualOnly"
                      checked={showOnlyUnusual}
                      onChange={(e) => setShowOnlyUnusual(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="unusualOnly" className="text-gray-400">Show only unusual activity</label>
                  </div>
                  <Badge variant="outline" className="text-orange-400 border-orange-400">
                    {filteredData.length} symbols tracked
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Dark Pool Data */}
            <Card className="bg-[var(--trading-slate)] border-gray-700">
              <CardHeader className="border-b border-gray-700">
                <div className="flex items-center space-x-2">
                  <EyeOff className="h-5 w-5 text-purple-400" />
                  <h2 className="text-lg font-semibold text-white">Dark Pool Activity</h2>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2 text-gray-400">Symbol</th>
                        <th className="text-right py-2 text-gray-400">Dark Vol</th>
                        <th className="text-right py-2 text-gray-400">% of Total</th>
                        <th className="text-right py-2 text-gray-400">Avg Price</th>
                        <th className="text-right py-2 text-gray-400">Current</th>
                        <th className="text-center py-2 text-gray-400">Flow</th>
                        <th className="text-right py-2 text-gray-400">Confidence</th>
                        <th className="text-center py-2 text-gray-400">Unusual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((data, index) => (
                        <tr key={index} className="border-b border-gray-800">
                          <td className="py-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-white font-medium">${data.symbol}</span>
                              {data.unusualActivity && (
                                <AlertTriangle className="h-3 w-3 text-yellow-400" />
                              )}
                            </div>
                          </td>
                          <td className="py-3 text-right text-purple-400 font-medium">
                            {(data.darkVolume / 1000000).toFixed(1)}M
                          </td>
                          <td className="py-3 text-right">
                            <span className={`font-medium ${
                              data.darkVolumePercent > 35 ? 'text-red-400' : 
                              data.darkVolumePercent > 25 ? 'text-yellow-400' : 'text-gray-300'
                            }`}>
                              {data.darkVolumePercent.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 text-right text-gray-300">
                            ${data.avgDarkPrice.toFixed(2)}
                          </td>
                          <td className="py-3 text-right text-white">
                            <LivePrice symbol={data.symbol} showLabel={false} className="text-white" />
                          </td>
                          <td className="py-3 text-center">
                            <Badge className={getFlowColor(data.institutionalFlow)}>
                              {data.institutionalFlow.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-3 text-right">
                            <span className={`font-medium ${
                              data.confidenceLevel > 85 ? 'text-green-400' : 
                              data.confidenceLevel > 70 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {data.confidenceLevel.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            {data.unusualActivity ? (
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

            {/* Whale Activity */}
            <Card className="bg-[var(--trading-slate)] border-gray-700">
              <CardHeader className="border-b border-gray-700">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">Whale Activity Feed</h2>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  {whaleActivity.map((whale, index) => (
                    <div key={index} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-blue-600 text-white">${whale.symbol}</Badge>
                          <LivePrice symbol={whale.symbol} showLabel={false} className="text-white text-sm" />
                          {getDirectionIcon(whale.direction)}
                          <span className="text-white font-medium">
                            {whale.direction === 'buy' ? 'BUY' : 'SELL'} {(whale.tradeSize / 1000).toFixed(0)}K shares
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">
                            ${whale.tradePrice.toFixed(2)}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {formatTimeAgo(whale.timestamp)}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Institution:</span>
                          <span className="text-blue-400 font-medium">{whale.estimatedInstitution}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Market Impact:</span>
                          <span className={`font-medium ${
                            whale.marketImpact > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {whale.marketImpact > 0 ? '+' : ''}{whale.marketImpact.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Follow Trade:</span>
                          {whale.followTrade ? (
                            <Badge className="text-green-400 bg-green-900/20 border-green-800">
                              RECOMMENDED
                            </Badge>
                          ) : (
                            <Badge className="text-red-400 bg-red-900/20 border-red-800">
                              AVOID
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 p-2 bg-gray-900 rounded text-xs text-gray-400">
                        Trade Value: ${(whale.tradeSize * whale.tradePrice).toLocaleString()}
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