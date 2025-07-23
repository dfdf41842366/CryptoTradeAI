import { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SymbolSearch } from "@/components/SymbolSearch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { Analytics } from "@shared/schema";
import { CandlestickChart } from "@/components/CandlestickChart";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  LineChart, 
  CandlestickChart as CandlestickIcon, 
  Activity,
  Layers,
  Target,
  Zap,
  Settings,
  Eye,
  EyeOff,
  Volume2,
  Crosshair,
  Ruler,
  Pencil,
  Square,
  Circle,
  Triangle,
  Move,
  RotateCcw,
  Play,
  Pause,
  FastForward,
  Rewind,
  Monitor,
  Smartphone,
  Tablet,
  Download,
  Share2,
  Bookmark,
  Bell,
  Calculator,
  PieChart,
  AreaChart,
  Maximize2,
  Minimize2
} from "lucide-react";

interface TechnicalIndicator {
  id: string;
  name: string;
  category: string;
  enabled: boolean;
  settings: Record<string, any>;
  color: string;
  description: string;
}

interface CandlestickData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface LiveChartData {
  symbol: string;
  timeframe: string;
  data: CandlestickData[];
  lastUpdate: number;
}

interface CurrentPrice {
  symbol: string;
  price: number;
  timestamp: number;
  session?: string;
  isMarketOpen?: boolean;
  marketTime?: string;
  nextSession?: string;
}

interface MarketSession {
  session: 'pre' | 'regular' | 'after' | 'closed';
  isOpen: boolean;
  localTime: string;
  marketTime: string;
  timezone: string;
  nextSession: string;
  volatilityMultiplier: number;
  volumeMultiplier: number;
}

interface TradingStrategy {
  id: string;
  name: string;
  type: 'momentum' | 'reversal' | 'breakout' | 'scalping' | 'swing';
  winRate: number;
  avgReturn: number;
  maxDrawdown: number;
  enabled: boolean;
  signals: Array<{
    type: 'BUY' | 'SELL';
    price: number;
    confidence: number;
    reason: string;
    timestamp: Date;
  }>;
  description: string;
}

interface DrawingTool {
  id: string;
  name: string;
  icon: any;
  active: boolean;
}

export default function SuperChartsPage() {
  const [selectedSymbol, setSelectedSymbol] = useState("TSLA");
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const [chartType, setChartType] = useState("candlestick");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRealTime, setIsRealTime] = useState(true);
  const [volume, setVolume] = useState([100]);
  const [showGrid, setShowGrid] = useState(true);
  const [activeTab, setActiveTab] = useState("indicators");
  const [chartData, setChartData] = useState<CandlestickData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<CurrentPrice | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [marketSession, setMarketSession] = useState<MarketSession | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { data: analytics } = useQuery<Analytics>({
    queryKey: ["/api/analytics"],
  });

  // Query for live chart data
  const { data: liveChartData, refetch: refetchChartData } = useQuery<LiveChartData>({
    queryKey: ["/api/charts", selectedSymbol, selectedTimeframe],
    refetchInterval: isRealTime ? 5000 : false, // Refetch every 5 seconds when real-time is enabled
    enabled: !!selectedSymbol && !!selectedTimeframe,
  });

  // Query for current price
  const { data: priceData, refetch: refetchPrice } = useQuery<CurrentPrice>({
    queryKey: ["/api/price", selectedSymbol],
    refetchInterval: isRealTime ? 1500 : false, // Refetch every 1.5 seconds for smoother updates
    enabled: !!selectedSymbol,
  });

  // Query for market session
  const { data: sessionData, refetch: refetchSession } = useQuery<MarketSession>({
    queryKey: ["/api/market/session"],
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: true,
  });

  // Technical Indicators
  const [indicators, setIndicators] = useState<TechnicalIndicator[]>([
    {
      id: 'sma20',
      name: 'SMA (20)',
      category: 'Moving Averages',
      enabled: true,
      settings: { period: 20 },
      color: '#3B82F6',
      description: 'Simple Moving Average over 20 periods'
    },
    {
      id: 'ema50',
      name: 'EMA (50)', 
      category: 'Moving Averages',
      enabled: true,
      settings: { period: 50 },
      color: '#EF4444',
      description: 'Exponential Moving Average over 50 periods'
    },
    {
      id: 'rsi',
      name: 'RSI (14)',
      category: 'Momentum',
      enabled: true,
      settings: { period: 14, overbought: 70, oversold: 30 },
      color: '#8B5CF6',
      description: 'Relative Strength Index'
    },
    {
      id: 'macd',
      name: 'MACD',
      category: 'Momentum', 
      enabled: true,
      settings: { fast: 12, slow: 26, signal: 9 },
      color: '#F59E0B',
      description: 'Moving Average Convergence Divergence'
    },
    {
      id: 'bollinger',
      name: 'Bollinger Bands',
      category: 'Volatility',
      enabled: false,
      settings: { period: 20, stdDev: 2 },
      color: '#10B981',
      description: 'Bollinger Bands with 2 standard deviations'
    },
    {
      id: 'stochastic',
      name: 'Stochastic',
      category: 'Momentum',
      enabled: false,
      settings: { kPeriod: 14, dPeriod: 3 },
      color: '#F97316',
      description: 'Stochastic Oscillator'
    },
    {
      id: 'atr',
      name: 'ATR (14)',
      category: 'Volatility',
      enabled: false,
      settings: { period: 14 },
      color: '#EC4899',
      description: 'Average True Range'
    },
    {
      id: 'volume_sma',
      name: 'Volume SMA',
      category: 'Volume',
      enabled: true,
      settings: { period: 20 },
      color: '#6366F1',
      description: 'Volume Simple Moving Average'
    }
  ]);

  // Trading Strategies
  const [strategies, setStrategies] = useState<TradingStrategy[]>([
    {
      id: 'momentum_breakout',
      name: 'Momentum Breakout',
      type: 'breakout',
      winRate: 72.4,
      avgReturn: 5.8,
      maxDrawdown: -12.3,
      enabled: true,
      signals: [
        {
          type: 'BUY',
          price: 248.75,
          confidence: 87,
          reason: 'Volume breakout above resistance at $245',
          timestamp: new Date()
        }
      ],
      description: 'Identifies strong momentum breakouts with volume confirmation'
    },
    {
      id: 'mean_reversion',
      name: 'Mean Reversion',
      type: 'reversal',
      winRate: 68.1,
      avgReturn: 3.2,
      maxDrawdown: -8.7,
      enabled: true,
      signals: [
        {
          type: 'SELL',
          price: 251.20,
          confidence: 74,
          reason: 'RSI overbought, price touching upper Bollinger',
          timestamp: new Date()
        }
      ],
      description: 'Captures reversals when price extends too far from mean'
    },
    {
      id: 'scalping_master',
      name: 'Scalping Master',
      type: 'scalping',
      winRate: 89.3,
      avgReturn: 0.8,
      maxDrawdown: -2.1,
      enabled: false,
      signals: [],
      description: 'High-frequency scalping strategy for quick profits'
    },
    {
      id: 'swing_trader',
      name: 'Swing Trader Pro',
      type: 'swing',
      winRate: 64.7,
      avgReturn: 12.4,
      maxDrawdown: -18.9,
      enabled: false,
      signals: [],
      description: 'Multi-day swing trading with trend following'
    }
  ]);

  // Drawing Tools
  const [drawingTools, setDrawingTools] = useState<DrawingTool[]>([
    { id: 'cursor', name: 'Cursor', icon: Move, active: true },
    { id: 'line', name: 'Trend Line', icon: Ruler, active: false },
    { id: 'horizontal', name: 'Horizontal Line', icon: Ruler, active: false },
    { id: 'rectangle', name: 'Rectangle', icon: Square, active: false },
    { id: 'circle', name: 'Circle', icon: Circle, active: false },
    { id: 'triangle', name: 'Triangle', icon: Triangle, active: false },
    { id: 'fib', name: 'Fibonacci', icon: Target, active: false },
    { id: 'text', name: 'Text', icon: Pencil, active: false }
  ]);

  const timeframes = [
    { value: "1m", label: "1m" },
    { value: "5m", label: "5m" },
    { value: "15m", label: "15m" },
    { value: "30m", label: "30m" },
    { value: "1H", label: "1H" },
    { value: "4H", label: "4H" },
    { value: "1D", label: "1D" },
    { value: "1W", label: "1W" },
    { value: "1M", label: "1M" }
  ];

  const chartTypes = [
    { value: "candlestick", label: "Candlestick", icon: CandlestickChart },
    { value: "line", label: "Line", icon: LineChart },
    { value: "bar", label: "Bar", icon: BarChart3 },
    { value: "area", label: "Area", icon: AreaChart },
    { value: "heikin", label: "Heikin-Ashi", icon: CandlestickChart }
  ];

  const toggleIndicator = (id: string) => {
    setIndicators(prev => prev.map(indicator => 
      indicator.id === id ? { ...indicator, enabled: !indicator.enabled } : indicator
    ));
  };

  const toggleStrategy = (id: string) => {
    setStrategies(prev => prev.map(strategy => 
      strategy.id === id ? { ...strategy, enabled: !strategy.enabled } : strategy
    ));
  };

  const selectDrawingTool = (id: string) => {
    setDrawingTools(prev => prev.map(tool => 
      ({ ...tool, active: tool.id === id })
    ));
  };

  // Update chart data when live data changes
  useEffect(() => {
    if (liveChartData?.data && Array.isArray(liveChartData.data)) {
      setChartData(liveChartData.data);
      setLastUpdate(liveChartData.lastUpdate);
    }
  }, [liveChartData]);

  // Update current price when price data changes
  useEffect(() => {
    if (priceData) {
      setCurrentPrice(priceData);
    }
  }, [priceData]);

  // Update market session when session data changes
  useEffect(() => {
    if (sessionData) {
      setMarketSession(sessionData);
    }
  }, [sessionData]);

  // Handle real-time updates
  useEffect(() => {
    if (isRealTime && selectedSymbol && selectedTimeframe) {
      // Clear existing interval
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }

      // Set up new interval for more frequent updates
      updateIntervalRef.current = setInterval(() => {
        refetchChartData();
        refetchPrice();
        refetchSession();
      }, 800); // Update every 800ms for very smooth real-time experience

      return () => {
        if (updateIntervalRef.current) {
          clearInterval(updateIntervalRef.current);
        }
      };
    } else {
      // Clear interval when real-time is disabled
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    }
  }, [isRealTime, selectedSymbol, selectedTimeframe, refetchChartData, refetchPrice, refetchSession]);

  // Get market session display info
  const getSessionDisplay = () => {
    if (!marketSession) return { color: 'text-gray-400', text: 'Loading...', icon: '●' };
    
    switch (marketSession.session) {
      case 'pre':
        return { color: 'text-orange-400', text: 'PRE-MARKET', icon: '◐' };
      case 'regular':
        return { color: 'text-green-400', text: 'MARKET OPEN', icon: '●' };
      case 'after':
        return { color: 'text-blue-400', text: 'AFTER-HOURS', icon: '◑' };
      case 'closed':
        return { color: 'text-red-400', text: 'MARKET CLOSED', icon: '○' };
      default:
        return { color: 'text-gray-400', text: 'UNKNOWN', icon: '●' };
    }
  };

  const sessionDisplay = getSessionDisplay();

  // Calculate price change
  const getPriceChange = useCallback(() => {
    if (!chartData.length || !currentPrice) return { change: 0, percentage: 0 };
    
    const previousClose = chartData[chartData.length - 2]?.close || chartData[chartData.length - 1]?.open;
    const change = currentPrice.price - previousClose;
    const percentage = (change / previousClose) * 100;
    
    return { change, percentage };
  }, [chartData, currentPrice]);

  const priceChange = getPriceChange();

  // Format price for display
  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  // Format volume for display
  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  return (
    <div className="min-h-screen bg-[var(--trading-dark)] text-gray-100">
      <Header analytics={analytics} />
      
      <div className="flex">
        <Sidebar />
        
        <main className={`flex-1 ${isFullscreen ? 'ml-0' : 'ml-64'} transition-all duration-300`}>
          <div className="h-screen flex flex-col">
            {/* Top Toolbar */}
            <div className="bg-[var(--trading-slate)] border-b border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
                      SuperCharts Pro
                    </h1>
                    <Badge variant="outline" className="text-purple-400 border-purple-400">
                      TradingView Enhanced
                    </Badge>
                  </div>
                  
                  <div className="w-80">
                    <SymbolSearch 
                      selectedSymbol={selectedSymbol}
                      onSymbolSelect={setSelectedSymbol}
                      placeholder="Search any symbol..."
                      showSuggestions={true}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Timeframe Selector */}
                  <div className="flex items-center space-x-1 bg-gray-800 rounded-lg p-1">
                    {timeframes.map(tf => (
                      <button
                        key={tf.value}
                        onClick={() => setSelectedTimeframe(tf.value)}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          selectedTimeframe === tf.value
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {tf.label}
                      </button>
                    ))}
                  </div>

                  {/* Chart Type Selector */}
                  <div className="flex items-center space-x-1 bg-gray-800 rounded-lg p-1">
                    {chartTypes.map(type => (
                      <button
                        key={type.value}
                        onClick={() => setChartType(type.value)}
                        className={`p-2 rounded transition-colors ${
                          chartType === type.value
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-400 hover:text-white'
                        }`}
                        title={type.label}
                      >
                        <type.icon className="h-4 w-4" />
                      </button>
                    ))}
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant={isRealTime ? "default" : "outline"}
                      onClick={() => setIsRealTime(!isRealTime)}
                    >
                      {isRealTime ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {isRealTime ? "Live" : "Paused"}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsFullscreen(!isFullscreen)}
                    >
                      {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex">
              {/* Chart Area */}
              <div className="flex-1 flex flex-col bg-gray-900">
                {/* Drawing Toolbar */}
                <div className="bg-gray-800 border-b border-gray-700 p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {drawingTools.map(tool => (
                        <button
                          key={tool.id}
                          onClick={() => selectDrawingTool(tool.id)}
                          className={`p-2 rounded transition-colors ${
                            tool.active
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-400 hover:text-white hover:bg-gray-700'
                          }`}
                          title={tool.name}
                        >
                          <tool.icon className="h-4 w-4" />
                        </button>
                      ))}
                      
                      <Separator orientation="vertical" className="h-6 mx-2" />
                      
                      <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded">
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-400">Grid:</span>
                      <Switch
                        checked={showGrid}
                        onCheckedChange={setShowGrid}
                      />
                      
                      {currentPrice && (
                        <>
                          <span className="text-gray-400 ml-4">Price: ${formatPrice(currentPrice.price)}</span>
                          <span className={`${priceChange.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {priceChange.change >= 0 ? '+' : ''}{priceChange.percentage.toFixed(2)}%
                          </span>
                          <span className={`text-xs ${sessionDisplay.color}`}>
                            {isRealTime ? `${sessionDisplay.icon} ${sessionDisplay.text}` : '⏸ PAUSED'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Chart Canvas */}
                <div className="flex-1 bg-gray-900 relative">
                  {/* Live Chart Area */}
                  <div className="w-full h-full border border-gray-700 rounded-lg m-2 p-4">
                    {chartData.length > 0 ? (
                      <div className="h-full flex flex-col">
                        {/* Chart Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <h3 className="text-xl font-semibold text-white">
                              {selectedSymbol} - {selectedTimeframe}
                            </h3>
                            {isRealTime && (
                              <div className="flex items-center space-x-2 text-sm">
                                <div className={`w-2 h-2 ${sessionDisplay.color.replace('text-', 'bg-')} rounded-full animate-pulse`}></div>
                                <span className={sessionDisplay.color}>{sessionDisplay.text}</span>
                                {marketSession && (
                                  <span className="text-xs text-gray-400">
                                    EST {marketSession.marketTime}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {currentPrice && (
                            <div className="text-right">
                              <div className="text-2xl font-bold text-white">
                                ${formatPrice(currentPrice.price)}
                              </div>
                              <div className={`text-sm ${priceChange.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {priceChange.change >= 0 ? '+' : ''}${formatPrice(Math.abs(priceChange.change))} 
                                ({priceChange.change >= 0 ? '+' : ''}{priceChange.percentage.toFixed(2)}%)
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* OHLC Data */}
                        {chartData.length > 0 && (
                          <div className="grid grid-cols-5 gap-4 mb-4 text-sm">
                            <div className="text-center">
                              <div className="text-gray-400 font-semibold">Open</div>
                              <div className="text-white">${formatPrice(chartData[chartData.length - 1].open)}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-green-400 font-semibold">High</div>
                              <div className="text-white">${formatPrice(chartData[chartData.length - 1].high)}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-red-400 font-semibold">Low</div>
                              <div className="text-white">${formatPrice(chartData[chartData.length - 1].low)}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-blue-400 font-semibold">Volume</div>
                              <div className="text-white">{formatVolume(chartData[chartData.length - 1].volume)}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-purple-400 font-semibold">Last Update</div>
                              <div className="text-white text-xs">
                                {new Date(lastUpdate).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* TradingView SuperCharts */}
                        <div className="flex-1 bg-slate-900 rounded border border-slate-600 overflow-hidden">
                          {chartData && Array.isArray(chartData) && chartData.length > 0 ? (
                            <CandlestickChart 
                              data={chartData || []}
                              width={1000}
                              height={500}
                              showVolume={true}
                              showGrid={showGrid}
                              symbol={selectedSymbol}
                              timeframe={selectedTimeframe}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-96">
                              <div className="text-center">
                                <div className="mb-4">
                                  <CandlestickIcon className="h-16 w-16 text-gray-400 mx-auto animate-pulse" />
                                </div>
                                <h4 className="text-lg font-semibold text-white mb-2">
                                  Loading Authentic Market Data
                                </h4>
                                <p className="text-gray-400 mb-4">
                                  Connecting to professional data sources for {selectedSymbol}
                                </p>
                                <div className="text-sm text-blue-400">
                                  Using most reliable API sources only...
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Active Indicators Display */}
                        <div className="mt-4">
                          <div className="text-gray-400 text-xs mb-2">Active Indicators:</div>
                          <div className="flex flex-wrap gap-2">
                            {indicators.filter(i => i.enabled).map(indicator => (
                              <Badge key={indicator.id} style={{ color: indicator.color, borderColor: indicator.color }}>
                                {indicator.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin h-8 w-8 border-2 border-blue-400 rounded-full border-t-transparent mx-auto mb-4"></div>
                          <p className="text-gray-400">Loading live chart data for {selectedSymbol}...</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Strategy Signals Overlay */}
                  <div className="absolute top-4 right-4 space-y-2">
                    {strategies.filter(s => s.enabled && s.signals.length > 0).map(strategy => 
                      strategy.signals.map((signal, idx) => (
                        <div key={`${strategy.id}-${idx}`} className={`
                          px-3 py-2 rounded-lg shadow-lg border-l-4 backdrop-blur-sm
                          ${signal.type === 'BUY' 
                            ? 'bg-green-900/50 border-green-400' 
                            : 'bg-red-900/50 border-red-400'
                          }
                        `}>
                          <div className="flex items-center space-x-2">
                            <span className={`font-semibold ${
                              signal.type === 'BUY' ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {signal.type}
                            </span>
                            <span className="text-white font-medium">${signal.price}</span>
                            <span className="text-xs text-gray-400">({signal.confidence}%)</span>
                          </div>
                          <div className="text-xs text-gray-300 mt-1">{signal.reason}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right Panel */}
              <div className="w-80 bg-[var(--trading-slate)] border-l border-gray-700 flex flex-col">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                  <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-b border-gray-700 rounded-none">
                    <TabsTrigger value="indicators" className="text-xs">
                      <Layers className="h-4 w-4 mr-1" />
                      Indicators
                    </TabsTrigger>
                    <TabsTrigger value="strategies" className="text-xs">
                      <Target className="h-4 w-4 mr-1" />
                      Strategies
                    </TabsTrigger>
                    <TabsTrigger value="tools" className="text-xs">
                      <Settings className="h-4 w-4 mr-1" />
                      Tools
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="indicators" className="flex-1 overflow-y-auto p-4 space-y-3">
                    <h3 className="font-semibold text-white mb-4">Technical Indicators</h3>
                    
                    {/* Indicator Categories */}
                    {['Moving Averages', 'Momentum', 'Volatility', 'Volume'].map(category => (
                      <div key={category} className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-400">{category}</h4>
                        {indicators.filter(i => i.category === category).map(indicator => (
                          <Card key={indicator.id} className="bg-gray-800 border-gray-700">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <div 
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: indicator.color }}
                                  />
                                  <span className="text-sm text-white">{indicator.name}</span>
                                </div>
                                <Switch
                                  checked={indicator.enabled}
                                  onCheckedChange={() => toggleIndicator(indicator.id)}
                                />
                              </div>
                              <p className="text-xs text-gray-400 mt-1">{indicator.description}</p>
                              
                              {indicator.enabled && (
                                <div className="mt-2 text-xs space-y-1">
                                  {Object.entries(indicator.settings).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                      <span className="text-gray-400">{key}:</span>
                                      <span className="text-white">{value}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="strategies" className="flex-1 overflow-y-auto p-4 space-y-3">
                    <h3 className="font-semibold text-white mb-4">Trading Strategies</h3>
                    
                    {strategies.map(strategy => (
                      <Card key={strategy.id} className="bg-gray-800 border-gray-700">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-white">{strategy.name}</span>
                            <Switch
                              checked={strategy.enabled}
                              onCheckedChange={() => toggleStrategy(strategy.id)}
                            />
                          </div>
                          
                          <p className="text-xs text-gray-400 mb-3">{strategy.description}</p>
                          
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <div className="text-gray-400">Win Rate</div>
                              <div className="text-green-400 font-semibold">{strategy.winRate}%</div>
                            </div>
                            <div>
                              <div className="text-gray-400">Avg Return</div>
                              <div className="text-blue-400 font-semibold">{strategy.avgReturn}%</div>
                            </div>
                            <div>
                              <div className="text-gray-400">Max DD</div>
                              <div className="text-red-400 font-semibold">{strategy.maxDrawdown}%</div>
                            </div>
                          </div>
                          
                          {strategy.signals.length > 0 && strategy.enabled && (
                            <div className="mt-3 pt-2 border-t border-gray-700">
                              <div className="text-xs text-gray-400 mb-1">Latest Signal:</div>
                              {strategy.signals.slice(-1).map((signal, idx) => (
                                <div key={idx} className="text-xs">
                                  <span className={`font-semibold ${
                                    signal.type === 'BUY' ? 'text-green-400' : 'text-red-400'
                                  }`}>
                                    {signal.type}
                                  </span>
                                  <span className="text-white ml-2">${signal.price}</span>
                                  <span className="text-gray-400 ml-2">({signal.confidence}%)</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="tools" className="flex-1 overflow-y-auto p-4 space-y-4">
                    <h3 className="font-semibold text-white mb-4">Chart Tools</h3>
                    
                    {/* Chart Settings */}
                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-3 space-y-3">
                        <h4 className="text-sm font-medium text-white">Display Settings</h4>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs text-gray-400">Show Grid</Label>
                            <Switch checked={showGrid} onCheckedChange={setShowGrid} />
                          </div>
                          
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-400">Volume: {volume[0]}%</Label>
                            <Slider
                              value={volume}
                              onValueChange={setVolume}
                              max={100}
                              step={1}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-3 space-y-3">
                        <h4 className="text-sm font-medium text-white">Quick Actions</h4>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <Button size="sm" variant="outline" className="text-xs">
                            <Download className="h-3 w-3 mr-1" />
                            Export
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs">
                            <Share2 className="h-3 w-3 mr-1" />
                            Share
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs">
                            <Bookmark className="h-3 w-3 mr-1" />
                            Save Layout
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs">
                            <Bell className="h-3 w-3 mr-1" />
                            Alert
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Performance Stats */}
                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-3">
                        <h4 className="text-sm font-medium text-white mb-3">Live Performance</h4>
                        
                        <div className="space-y-2 text-xs">
                          {chartData.length > 0 ? (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Open:</span>
                                <span className="text-white">${formatPrice(chartData[chartData.length - 1].open)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">High:</span>
                                <span className="text-green-400">${formatPrice(chartData[chartData.length - 1].high)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Low:</span>
                                <span className="text-red-400">${formatPrice(chartData[chartData.length - 1].low)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Volume:</span>
                                <span className="text-white">{formatVolume(chartData[chartData.length - 1].volume)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Avg Vol:</span>
                                <span className="text-gray-300">
                                  {chartData.length > 10 
                                    ? formatVolume(chartData.slice(-10).reduce((sum, candle) => sum + candle.volume, 0) / 10)
                                    : formatVolume(chartData[chartData.length - 1].volume)
                                  }
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Data Points:</span>
                                <span className="text-blue-400">{chartData.length}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Session:</span>
                                <span className={sessionDisplay.color.replace('text-', 'text-')}>
                                  {sessionDisplay.icon} {sessionDisplay.text}
                                </span>
                              </div>
                              {marketSession && (
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Next:</span>
                                  <span className="text-gray-300 text-xs">{marketSession.nextSession}</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-center text-gray-400 py-2">
                              Loading market data...
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}