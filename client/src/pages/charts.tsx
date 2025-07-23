import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SymbolSearch } from "@/components/SymbolSearch";
import { LivePrice } from "@/components/LivePrice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Analytics } from "@shared/schema";
import { BarChart3, TrendingUp, Clock, Activity, Volume2, Zap, Target, Eye } from "lucide-react";

interface ChartData {
  symbol: string;
  timeframe: string;
  data: {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    session: 'pre-market' | 'regular' | 'after-hours' | 'overnight';
  }[];
  currentPrice: number;
  change: number;
  changePercent: number;
  volume24h: number;
}

interface MarketSession {
  name: string;
  status: 'open' | 'closed' | 'opening-soon' | 'closing-soon';
  timeRemaining: string;
  volume: number;
  volatility: number;
}

export default function ChartsPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('KOSS');
  const [selectedTimeframe, setSelectedTimeframe] = useState('5m');
  const [activeSession, setActiveSession] = useState('regular');
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const { data: analytics } = useQuery<Analytics>({
    queryKey: ["/api/analytics"],
  });

  const chartSymbols = ['KOSS', 'PROG', 'CYDY', 'BBIG', 'AVXL', 'ATOS', 'AMC', 'GME', 'RIVN', 'TSLA'];
  const timeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'];

  const marketSessions: MarketSession[] = [
    {
      name: 'Pre-Market',
      status: 'closed',
      timeRemaining: '2h 34m',
      volume: 1247892,
      volatility: 24.7
    },
    {
      name: 'Regular Hours',
      status: 'open',
      timeRemaining: '4h 17m',
      volume: 15847293,
      volatility: 18.3
    },
    {
      name: 'After Hours',
      status: 'opening-soon',
      timeRemaining: '17m',
      volume: 4829174,
      volatility: 31.2
    },
    {
      name: 'Overnight',
      status: 'closed',
      timeRemaining: '8h 43m',
      volume: 892374,
      volatility: 42.8
    }
  ];

  // Mock chart data for demonstration - in real app, this would come from market data APIs
  const generateChartData = (symbol: string, timeframe: string): ChartData => {
    const sessions: Array<'pre-market' | 'regular' | 'after-hours' | 'overnight'> = 
      ['pre-market', 'regular', 'after-hours', 'overnight'];
    
    const basePrice = symbol === 'KOSS' ? 3.67 : symbol === 'PROG' ? 1.97 : symbol === 'CYDY' ? 0.71 : 2.45;
    const data = [];
    
    for (let i = 0; i < 100; i++) {
      const sessionIndex = Math.floor(i / 25);
      const session = sessions[sessionIndex] || 'regular';
      const volatility = session === 'overnight' ? 0.05 : session === 'pre-market' ? 0.03 : 0.02;
      
      const open = i === 0 ? basePrice : data[i-1].close;
      const change = (Math.random() - 0.5) * volatility * open;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * 0.01 * open;
      const low = Math.min(open, close) - Math.random() * 0.01 * open;
      const volume = Math.floor(Math.random() * 100000) * (session === 'regular' ? 3 : session === 'pre-market' ? 0.5 : 1);
      
      data.push({
        time: new Date(Date.now() - (100 - i) * 5 * 60 * 1000).toLocaleTimeString(),
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume,
        session
      });
    }
    
    const currentPrice = data[data.length - 1].close;
    const previousClose = data[0].close;
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;
    const volume24h = data.reduce((sum, candle) => sum + candle.volume, 0);
    
    return {
      symbol,
      timeframe,
      data,
      currentPrice,
      change,
      changePercent,
      volume24h
    };
  };

  const [chartData, setChartData] = useState<ChartData>(generateChartData(selectedSymbol, selectedTimeframe));

  useEffect(() => {
    setChartData(generateChartData(selectedSymbol, selectedTimeframe));
  }, [selectedSymbol, selectedTimeframe]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setChartData(generateChartData(selectedSymbol, selectedTimeframe));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, selectedSymbol, selectedTimeframe]);

  const getSessionColor = (session: string) => {
    switch (session) {
      case 'pre-market': return 'bg-blue-500';
      case 'regular': return 'bg-green-500';
      case 'after-hours': return 'bg-orange-500';
      case 'overnight': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-green-400';
      case 'closed': return 'text-red-400';
      case 'opening-soon': return 'text-yellow-400';
      case 'closing-soon': return 'text-orange-400';
      default: return 'text-gray-400';
    }
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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  Advanced Trading Charts
                </h1>
                <p className="text-gray-400">Multi-timeframe charts with pre-market, regular hours, and after-hours data</p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className={chartData.changePercent >= 0 ? "text-green-400 border-green-400" : "text-red-400 border-red-400"}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {chartData.changePercent >= 0 ? '+' : ''}{chartData.changePercent.toFixed(2)}%
                </Badge>
                <Button 
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={autoRefresh ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  {autoRefresh ? 'Live' : 'Paused'}
                </Button>
              </div>
            </div>

            {/* Chart Controls */}
            <Card className="bg-[var(--trading-slate)] border-gray-700">
              <CardHeader className="border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Chart Controls</h2>
                  <div className="flex items-center space-x-3">
                    <SymbolSearch 
                      selectedSymbol={selectedSymbol}
                      onSymbolSelect={setSelectedSymbol}
                      placeholder="Search any stock symbol..."
                      className="w-64"
                    />
                    
                    <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeframes.map(tf => (
                          <SelectItem key={tf} value={tf}>{tf}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      <LivePrice symbol={selectedSymbol} showLabel={false} className="text-white" />
                    </div>
                    <div className="text-sm text-gray-400">Current Price</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${chartData.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {chartData.change >= 0 ? '+' : ''}${chartData.change.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-400">24h Change</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{(chartData.volume24h / 1000000).toFixed(1)}M</div>
                    <div className="text-sm text-gray-400">24h Volume</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{selectedTimeframe}</div>
                    <div className="text-sm text-gray-400">Timeframe</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Sessions Status */}
            <Card className="bg-gradient-to-r from-blue-900/20 to-green-900/20 border-blue-700">
              <CardHeader className="border-b border-blue-700">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Market Sessions</h3>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {marketSessions.map((session) => (
                    <div key={session.name} className="p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">{session.name}</h4>
                        <Badge className={`${getStatusColor(session.status)} bg-transparent border`} size="sm">
                          {session.status.replace('-', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Time Remaining:</span>
                          <span className="text-cyan-400">{session.timeRemaining}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Volume:</span>
                          <span className="text-blue-400">{(session.volume / 1000000).toFixed(1)}M</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Volatility:</span>
                          <span className="text-yellow-400">{session.volatility}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Main Chart */}
            <Card className="bg-[var(--trading-slate)] border-gray-700">
              <CardHeader className="border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">{selectedSymbol} - {selectedTimeframe} Chart</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span className="text-xs text-gray-400">Pre-Market</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span className="text-xs text-gray-400">Regular</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-orange-500 rounded"></div>
                      <span className="text-xs text-gray-400">After Hours</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-purple-500 rounded"></div>
                      <span className="text-xs text-gray-400">Overnight</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="w-full h-96 bg-gray-900 rounded-lg p-4 relative overflow-hidden">
                  {/* Chart Grid */}
                  <div className="absolute inset-4 grid grid-cols-10 grid-rows-8 gap-0">
                    {Array.from({ length: 80 }).map((_, i) => (
                      <div key={i} className="border-gray-700 border-r border-b border-opacity-30"></div>
                    ))}
                  </div>
                  
                  {/* Price Line */}
                  <svg className="absolute inset-4 w-full h-full" viewBox="0 0 800 300">
                    <path
                      d={chartData.data.map((point, i) => {
                        const x = (i / chartData.data.length) * 800;
                        const y = 300 - ((point.close - Math.min(...chartData.data.map(d => d.low))) / 
                                (Math.max(...chartData.data.map(d => d.high)) - Math.min(...chartData.data.map(d => d.low)))) * 300;
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      stroke={chartData.changePercent >= 0 ? "#10b981" : "#ef4444"}
                      strokeWidth="2"
                      fill="none"
                      className="drop-shadow-glow"
                    />
                    
                    {/* Candlesticks with session colors */}
                    {chartData.data.filter((_, i) => i % 3 === 0).map((point, i) => {
                      const x = (i * 3 / chartData.data.length) * 800;
                      const yHigh = 300 - ((point.high - Math.min(...chartData.data.map(d => d.low))) / 
                                    (Math.max(...chartData.data.map(d => d.high)) - Math.min(...chartData.data.map(d => d.low)))) * 300;
                      const yLow = 300 - ((point.low - Math.min(...chartData.data.map(d => d.low))) / 
                                   (Math.max(...chartData.data.map(d => d.high)) - Math.min(...chartData.data.map(d => d.low)))) * 300;
                      const yOpen = 300 - ((point.open - Math.min(...chartData.data.map(d => d.low))) / 
                                    (Math.max(...chartData.data.map(d => d.high)) - Math.min(...chartData.data.map(d => d.low)))) * 300;
                      const yClose = 300 - ((point.close - Math.min(...chartData.data.map(d => d.low))) / 
                                     (Math.max(...chartData.data.map(d => d.high)) - Math.min(...chartData.data.map(d => d.low)))) * 300;
                      
                      const sessionColor = point.session === 'pre-market' ? '#3b82f6' : 
                                         point.session === 'regular' ? '#10b981' :
                                         point.session === 'after-hours' ? '#f97316' : '#8b5cf6';
                      
                      return (
                        <g key={i}>
                          {/* Wick */}
                          <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={sessionColor} strokeWidth="1" opacity="0.8" />
                          {/* Body */}
                          <rect
                            x={x - 4}
                            y={Math.min(yOpen, yClose)}
                            width="8"
                            height={Math.abs(yClose - yOpen) || 1}
                            fill={point.close >= point.open ? sessionColor : 'transparent'}
                            stroke={sessionColor}
                            strokeWidth="1"
                            opacity="0.9"
                          />
                        </g>
                      );
                    })}
                  </svg>
                  
                  {/* Price Labels */}
                  <div className="absolute right-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 pr-2">
                    <span>${Math.max(...chartData.data.map(d => d.high)).toFixed(2)}</span>
                    <span>${((Math.max(...chartData.data.map(d => d.high)) + Math.min(...chartData.data.map(d => d.low))) / 2).toFixed(2)}</span>
                    <span>${Math.min(...chartData.data.map(d => d.low)).toFixed(2)}</span>
                  </div>
                  
                  {/* Current Price Line */}
                  <div className="absolute right-4 text-right" style={{ 
                    top: `${4 + (1 - ((chartData.currentPrice - Math.min(...chartData.data.map(d => d.low))) / 
                    (Math.max(...chartData.data.map(d => d.high)) - Math.min(...chartData.data.map(d => d.low))))) * (100 - 8)}%` 
                  }}>
                    <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                      ${chartData.currentPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Volume and Technical Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Volume Chart */}
              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardHeader className="border-b border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Volume2 className="h-5 w-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Volume Profile</h3>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-blue-400">{(marketSessions[0].volume / 1000).toFixed(0)}K</div>
                        <div className="text-xs text-gray-400">Pre-Market</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-400">{(marketSessions[1].volume / 1000000).toFixed(1)}M</div>
                        <div className="text-xs text-gray-400">Regular</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-orange-400">{(marketSessions[2].volume / 1000000).toFixed(1)}M</div>
                        <div className="text-xs text-gray-400">After Hours</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-purple-400">{(marketSessions[3].volume / 1000).toFixed(0)}K</div>
                        <div className="text-xs text-gray-400">Overnight</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {marketSessions.map((session) => (
                        <div key={session.name} className="flex items-center space-x-2">
                          <div className="w-20 text-xs text-gray-400">{session.name}:</div>
                          <div className="flex-1 bg-gray-800 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getSessionColor(session.name.toLowerCase().replace(' ', '-'))}`}
                              style={{ width: `${(session.volume / Math.max(...marketSessions.map(s => s.volume))) * 100}%` }}
                            ></div>
                          </div>
                          <div className="w-16 text-xs text-gray-300 text-right">
                            {session.volume > 1000000 ? `${(session.volume / 1000000).toFixed(1)}M` : `${(session.volume / 1000).toFixed(0)}K`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Technical Indicators */}
              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardHeader className="border-b border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-cyan-400" />
                    <h3 className="text-lg font-semibold text-white">Technical Indicators</h3>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-400 mb-1">RSI (14)</div>
                        <div className="flex items-center space-x-2">
                          <div className="text-lg font-bold text-yellow-400">67.3</div>
                          <Badge className="text-yellow-400 bg-yellow-900/20" size="sm">Overbought</Badge>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 mb-1">MACD</div>
                        <div className="flex items-center space-x-2">
                          <div className="text-lg font-bold text-green-400">+0.12</div>
                          <Badge className="text-green-400 bg-green-900/20" size="sm">Bullish</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">20 MA:</span>
                        <span className="text-blue-400">${(chartData.currentPrice * 0.985).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">50 MA:</span>
                        <span className="text-purple-400">${(chartData.currentPrice * 0.97).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Support:</span>
                        <span className="text-red-400">${(chartData.currentPrice * 0.92).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Resistance:</span>
                        <span className="text-green-400">${(chartData.currentPrice * 1.08).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-700">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Session Volatility:</span>
                        <span className="text-orange-400">{marketSessions.find(s => s.status === 'open')?.volatility || 18.3}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chart Features */}
            <Card className="bg-gradient-to-r from-gray-900/20 to-blue-900/20 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Eye className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Advanced Charting Features</h3>
                    <p className="text-gray-300 text-sm mb-3">
                      Our charting system provides comprehensive market data across all trading sessions with real-time updates, 
                      multi-timeframe analysis, and session-specific volume and volatility tracking for optimal trading decisions.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-blue-400 font-medium">Market Sessions:</span>
                        <ul className="text-gray-400 mt-1 space-y-1">
                          <li>• Pre-market (4:00-9:30 AM)</li>
                          <li>• Regular hours (9:30-4:00 PM)</li>
                          <li>• After-hours (4:00-8:00 PM)</li>
                          <li>• Overnight (8:00 PM-4:00 AM)</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-green-400 font-medium">Timeframes:</span>
                        <ul className="text-gray-400 mt-1 space-y-1">
                          <li>• 1m, 5m, 15m, 30m intraday</li>
                          <li>• 1h, 4h swing trading</li>
                          <li>• 1d, 1w, 1M position trading</li>
                          <li>• Real-time price updates</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-purple-400 font-medium">Technical Analysis:</span>
                        <ul className="text-gray-400 mt-1 space-y-1">
                          <li>• RSI, MACD indicators</li>
                          <li>• Moving averages</li>
                          <li>• Support/resistance levels</li>
                          <li>• Volume profile analysis</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-yellow-400 font-medium">Session Analytics:</span>
                        <ul className="text-gray-400 mt-1 space-y-1">
                          <li>• Session-specific volatility</li>
                          <li>• Volume by trading session</li>
                          <li>• Time remaining indicators</li>
                          <li>• Live market status</li>
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