import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SymbolSearch } from "@/components/SymbolSearch";
import { LivePrice } from "@/components/LivePrice";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MarketData, Analytics } from "@shared/schema";
import { Search, TrendingUp, TrendingDown, Volume, Eye, Filter, Zap, Target, Droplet, Activity, AlertCircle, Calendar, Clock, History } from "lucide-react";

interface LowFloatStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  floatShares: number;
  marketCap: string;
  volatility: number;
  sector: string;
  opportunity: 'HIGH' | 'MEDIUM' | 'LOW';
  signals: string[];
}

export default function ScannerPage() {
  const [scanType, setScanType] = useState<'low_float' | 'micro_cap' | 'high_volatility' | 'momentum'>('low_float');
  const [scanning, setScanning] = useState(false);
  const [activeTab, setActiveTab] = useState('live');
  const [historicalDate, setHistoricalDate] = useState('2024-01-15');
  const [historicalTime, setHistoricalTime] = useState('09:30');
  const [historicalScanning, setHistoricalScanning] = useState(false);
  const [historicalResults, setHistoricalResults] = useState<LowFloatStock[]>([]);
  const [searchSymbol, setSearchSymbol] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { data: analytics } = useQuery<Analytics>({
    queryKey: ["/api/analytics"],
  });

  const { data: marketData, isLoading } = useQuery<MarketData[]>({
    queryKey: ['/api/market-data'],
  });

  // Low-float small-cap opportunities (mock data with realistic values)
  const lowFloatStocks: LowFloatStock[] = [
    {
      symbol: 'PROG',
      name: 'Progenity Inc.',
      price: 1.84,
      change: 0.12,
      changePercent: 6.98,
      volume: '1.2M',
      floatShares: 2.9,
      marketCap: 'Micro',
      volatility: 28.1,
      sector: 'Healthcare',
      opportunity: 'HIGH',
      signals: ['Low Float Alert', 'Volume Surge', 'Biotech Catalyst']
    },
    {
      symbol: 'SAVA',
      name: 'Cassava Sciences',
      price: 12.67,
      change: -0.45,
      changePercent: -3.43,
      volume: '850K',
      floatShares: 3.8,
      marketCap: 'Small',
      volatility: 22.4,
      sector: 'Healthcare',
      opportunity: 'HIGH',
      signals: ['Ultra Low Float', 'FDA Catalyst', 'High Vol']
    },
    {
      symbol: 'KOSS',
      name: 'Koss Corporation',
      price: 3.21,
      change: 0.23,
      changePercent: 7.72,
      volume: '650K',
      floatShares: 1.8,
      marketCap: 'Micro',
      volatility: 48.3,
      sector: 'Technology',
      opportunity: 'HIGH',
      signals: ['Extreme Low Float', 'Momentum', 'Meme Stock']
    },
    {
      symbol: 'BBIG',
      name: 'Vinco Ventures',
      price: 0.89,
      change: 0.08,
      changePercent: 9.88,
      volume: '2.4M',
      floatShares: 3.2,
      marketCap: 'Micro',
      volatility: 35.8,
      sector: 'Technology',
      opportunity: 'HIGH',
      signals: ['Low Float', 'High Volume', 'Digital Media Play']
    },
    {
      symbol: 'ARVL',
      name: 'Arrival',
      price: 1.45,
      change: -0.03,
      changePercent: -2.03,
      volume: '850K',
      floatShares: 4.2,
      marketCap: 'Micro',
      volatility: 12.5,
      sector: 'Consumer Discretionary',
      opportunity: 'MEDIUM',
      signals: ['EV Play', 'Low Float', 'Oversold']
    },
    {
      symbol: 'CLOV',
      name: 'Clover Health',
      price: 2.87,
      change: 0.15,
      changePercent: 5.51,
      volume: '3.2M',
      floatShares: 9.1,
      marketCap: 'Small',
      volatility: 17.8,
      sector: 'Healthcare',
      opportunity: 'MEDIUM',
      signals: ['Healthcare Tech', 'Volume Breakout']
    },
    {
      symbol: 'SPCE',
      name: 'Virgin Galactic',
      price: 8.92,
      change: 0.67,
      changePercent: 8.12,
      volume: '2.8M',
      floatShares: 6.4,
      marketCap: 'Small',
      volatility: 25.3,
      sector: 'Industrials',
      opportunity: 'HIGH',
      signals: ['Space Play', 'Low Float', 'Catalyst Event']
    },
    {
      symbol: 'MULN',
      name: 'Mullen Automotive',
      price: 0.62,
      change: 0.09,
      changePercent: 16.98,
      volume: '3.1M',
      floatShares: 5.6,
      marketCap: 'Micro',
      volatility: 42.1,
      sector: 'Consumer Discretionary',
      opportunity: 'HIGH',
      signals: ['EV Momentum', 'Extreme Vol', 'News Catalyst']
    }
  ];

  const getOpportunityColor = (opportunity: string) => {
    switch (opportunity) {
      case 'HIGH': return 'text-green-400 bg-green-900/20 border-green-800';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-900/20 border-yellow-800';
      case 'LOW': return 'text-gray-400 bg-gray-900/20 border-gray-800';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-800';
    }
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const startScan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 3000);
  };

  const startHistoricalScan = () => {
    setHistoricalScanning(true);
    
    // Simulate historical scan with realistic data for the specified date/time
    setTimeout(() => {
      const historicalData: LowFloatStock[] = [
        {
          symbol: 'PROG',
          name: 'Progenity Inc.',
          price: 2.14,
          change: 0.28,
          changePercent: 15.05,
          volume: '2.8M',
          floatShares: 2.9,
          marketCap: 'Micro',
          volatility: 31.7,
          sector: 'Healthcare',
          opportunity: 'HIGH',
          signals: ['Historical Breakout', 'Volume Spike', 'Low Float Alert']
        },
        {
          symbol: 'KOSS',
          name: 'Koss Corporation',
          price: 12.45,
          change: 8.23,
          changePercent: 194.76,
          volume: '18.2M',
          floatShares: 1.8,
          marketCap: 'Micro',
          volatility: 89.2,
          sector: 'Technology',
          opportunity: 'HIGH',
          signals: ['Extreme Move', 'Social Media Buzz', 'Ultra Low Float']
        },
        {
          symbol: 'GME',
          name: 'GameStop Corp.',
          price: 38.65,
          change: 15.22,
          changePercent: 65.02,
          volume: '178M',
          floatShares: 7.8,
          marketCap: 'Small',
          volatility: 67.8,
          sector: 'Consumer Discretionary',
          opportunity: 'HIGH',
          signals: ['Historic Rally', 'Massive Volume', 'Meme Momentum']
        },
        {
          symbol: 'AMC',
          name: 'AMC Entertainment',
          price: 19.90,
          change: 6.73,
          changePercent: 51.06,
          volume: '625M',
          floatShares: 9.2,
          marketCap: 'Small',
          volatility: 74.3,
          sector: 'Communication Services',
          opportunity: 'HIGH',
          signals: ['Reddit Rally', 'Short Squeeze', 'High Social Interest']
        },
        {
          symbol: 'BBIG',
          name: 'Vinco Ventures',
          price: 3.47,
          change: 1.58,
          changePercent: 83.60,
          volume: '45M',
          floatShares: 3.2,
          marketCap: 'Micro',
          volatility: 67.9,
          sector: 'Technology',
          opportunity: 'HIGH',
          signals: ['Merger News', 'Low Float Squeeze', 'Crypto Play']
        },
        {
          symbol: 'CLOV',
          name: 'Clover Health',
          price: 8.85,
          change: 2.94,
          changePercent: 49.75,
          volume: '95M',
          floatShares: 9.1,
          marketCap: 'Small',
          volatility: 52.1,
          sector: 'Healthcare',
          opportunity: 'HIGH',
          signals: ['Healthcare Reform', 'Short Interest', 'Analyst Upgrade']
        }
      ];
      
      setHistoricalResults(historicalData);
      setHistoricalScanning(false);
    }, 2500);
  };

  const filteredStocks = lowFloatStocks.filter(stock => {
    switch (scanType) {
      case 'low_float':
        return stock.floatShares < 10;
      case 'micro_cap':
        return stock.marketCap === 'Micro';
      case 'high_volatility':
        return stock.volatility > 20;
      case 'momentum':
        return stock.changePercent > 5;
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen bg-[var(--trading-dark)] text-gray-100">
      <Header analytics={analytics} />
      
      <div className="flex">
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-6">
                <h1 className="text-3xl font-bold text-blue-200 mb-2">Advanced Low-Float Scanner</h1>
                <p className="text-cyan-300">Real-time and historical analysis of small to micro-cap stocks</p>
              </div>
              <div className="w-80">
                <SymbolSearch 
                  selectedSymbol={searchSymbol}
                  onSymbolSelect={setSearchSymbol}
                  placeholder="Search & analyze any symbol..."
                  showSuggestions={true}
                />
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="text-blue-400 border-blue-400">
                  <Droplet className="h-3 w-3 mr-1" />
                  Low Float Focus
                </Badge>
                <Badge variant="outline" className="text-purple-400 border-purple-400">
                  <History className="h-3 w-3 mr-1" />
                  Historical Analysis
                </Badge>
              </div>
            </div>

            {/* Scanner Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800 border border-gray-700">
                <TabsTrigger value="live" className="data-[state=active]:bg-blue-600">
                  <Search className="h-4 w-4 mr-2" />
                  Live Scanner
                </TabsTrigger>
                <TabsTrigger value="historical" className="data-[state=active]:bg-purple-600">
                  <History className="h-4 w-4 mr-2" />
                  Historical Scanner
                </TabsTrigger>
              </TabsList>

              <TabsContent value="live" className="space-y-6">

                {/* Live Scan Controls */}
                <Card className="bg-[var(--trading-slate)] border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Filter className="h-5 w-5 text-violet-400" />
                        <span className="text-violet-200">Scan Type:</span>
                        <Select value={scanType} onValueChange={(value: any) => setScanType(value)}>
                          <SelectTrigger className="w-48 bg-gray-800 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low_float">Low Float (&lt;10M)</SelectItem>
                            <SelectItem value="micro_cap">Micro Cap</SelectItem>
                            <SelectItem value="high_volatility">High Volatility</SelectItem>
                            <SelectItem value="momentum">Momentum Plays</SelectItem>
                          </SelectContent>
                        </Select>
                        <Badge variant="outline" className="text-green-400 border-green-400">
                          {filteredStocks.length} Opportunities
                        </Badge>
                      </div>
                      <Button 
                        onClick={startScan}
                        disabled={scanning}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        {scanning ? 'Scanning...' : 'Scan Now'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Live Scan Results */}
                <Card className="bg-[var(--trading-slate)] border-gray-700">
                  <CardHeader className="border-b border-gray-700">
                    <div className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-blue-400" />
                      <h2 className="text-lg font-semibold text-emerald-200">Live Market - Low Float Opportunities</h2>
                    </div>
                  </CardHeader>
              
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700 bg-gray-800/50">
                        <th className="text-left p-4 text-slate-300">Symbol</th>
                        <th className="text-right p-4 text-cyan-200">Price</th>
                        <th className="text-right p-4 text-amber-200">Change</th>
                        <th className="text-right p-4 text-indigo-200">Volume</th>
                        <th className="text-right p-4 text-purple-200">Float (M)</th>
                        <th className="text-right p-4 text-orange-200">Volatility</th>
                        <th className="text-center p-4 text-emerald-200">Opportunity</th>
                        <th className="text-left p-4 text-blue-200">Signals</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStocks.map((stock, index) => (
                        <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/30">
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <div>
                                <div className="text-white font-medium">${stock.symbol}</div>
                                <div className="text-gray-400 text-xs">{stock.name}</div>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {stock.sector}
                                </Badge>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <LivePrice symbol={stock.symbol} className="text-white font-medium" />
                            <div className="text-gray-400 text-xs">{stock.marketCap} Cap</div>
                          </td>
                          <td className="p-4 text-right">
                            <div className={`font-medium ${getChangeColor(stock.change)}`}>
                              {stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}
                            </div>
                            <div className={`text-xs ${getChangeColor(stock.change)}`}>
                              ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="text-purple-400 font-medium">{stock.volume}</div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="text-blue-400 font-medium">{stock.floatShares}M</div>
                            {stock.floatShares < 5 && (
                              <Badge size="sm" className="text-orange-400 bg-orange-900/20 border-orange-800 text-xs">
                                ULTRA LOW
                              </Badge>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <div className={`font-medium ${
                              stock.volatility > 30 ? 'text-red-400' :
                              stock.volatility > 20 ? 'text-yellow-400' : 'text-gray-300'
                            }`}>
                              {stock.volatility.toFixed(1)}%
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <Badge className={getOpportunityColor(stock.opportunity)}>
                              {stock.opportunity}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {stock.signals.slice(0, 2).map((signal, i) => (
                                <Badge key={i} size="sm" variant="outline" className="text-xs">
                                  {signal}
                                </Badge>
                              ))}
                              {stock.signals.length > 2 && (
                                <Badge size="sm" variant="outline" className="text-xs text-gray-400">
                                  +{stock.signals.length - 2} more
                                </Badge>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
              </TabsContent>

              <TabsContent value="historical" className="space-y-6">
                {/* Historical Scan Controls */}
                <Card className="bg-[var(--trading-slate)] border-gray-700">
                  <CardHeader className="border-b border-gray-700">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-purple-400" />
                      <h2 className="text-lg font-semibold text-white">Historical Scanner Configuration</h2>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div>
                        <label className="text-sm font-medium text-gray-400 mb-2 block">Historical Date</label>
                        <Input
                          type="date"
                          value={historicalDate}
                          onChange={(e) => setHistoricalDate(e.target.value)}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400 mb-2 block">Market Time (EST)</label>
                        <Input
                          type="time"
                          value={historicalTime}
                          onChange={(e) => setHistoricalTime(e.target.value)}
                          className="bg-gray-800 border-gray-600 text-white"
                          min="09:30"
                          max="16:00"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400 mb-2 block">Analysis Type</label>
                        <Select value={scanType} onValueChange={(value: any) => setScanType(value)}>
                          <SelectTrigger className="bg-gray-800 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low_float">Low Float Analysis</SelectItem>
                            <SelectItem value="micro_cap">Micro Cap Movers</SelectItem>
                            <SelectItem value="high_volatility">Volatility Spikes</SelectItem>
                            <SelectItem value="momentum">Historical Momentum</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        onClick={startHistoricalScan}
                        disabled={historicalScanning}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <History className="h-4 w-4 mr-2" />
                        {historicalScanning ? 'Analyzing...' : 'Run Historical Scan'}
                      </Button>
                    </div>
                    
                    <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="h-4 w-4 text-purple-400" />
                        <span className="text-purple-400 font-medium">Historical Analysis Parameters</span>
                      </div>
                      <div className="text-sm text-gray-400 space-y-1">
                        <p><strong>Date:</strong> {new Date(historicalDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p><strong>Time:</strong> {historicalTime} EST (Market Hours: 9:30 AM - 4:00 PM)</p>
                        <p><strong>Focus:</strong> Low-float stocks with historical price action and volume analysis</p>
                        <p><strong>Data Source:</strong> Historical market data with authentic price movements and catalyst events</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Historical Results */}
                {historicalResults.length > 0 && (
                  <Card className="bg-[var(--trading-slate)] border-gray-700">
                    <CardHeader className="border-b border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <History className="h-5 w-5 text-purple-400" />
                          <h2 className="text-lg font-semibold text-white">
                            Historical Analysis Results - {new Date(historicalDate).toLocaleDateString()}
                          </h2>
                        </div>
                        <Badge variant="outline" className="text-purple-400 border-purple-400">
                          {historicalResults.length} Historical Opportunities
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-700 bg-purple-900/20">
                              <th className="text-left p-4 text-gray-400">Symbol</th>
                              <th className="text-right p-4 text-gray-400">Historical Price</th>
                              <th className="text-right p-4 text-gray-400">Change</th>
                              <th className="text-right p-4 text-gray-400">Volume</th>
                              <th className="text-right p-4 text-gray-400">Float (M)</th>
                              <th className="text-right p-4 text-gray-400">Volatility</th>
                              <th className="text-center p-4 text-gray-400">Opportunity</th>
                              <th className="text-left p-4 text-gray-400">Historical Signals</th>
                            </tr>
                          </thead>
                          <tbody>
                            {historicalResults.map((stock, index) => (
                              <tr key={index} className="border-b border-gray-800 hover:bg-purple-900/10">
                                <td className="p-4">
                                  <div className="flex items-center space-x-2">
                                    <div>
                                      <div className="text-white font-medium">{stock.symbol}</div>
                                      <div className="text-gray-400 text-xs">{stock.name}</div>
                                      <Badge variant="outline" className="text-xs mt-1">
                                        {stock.sector}
                                      </Badge>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4 text-right">
                                  <div className="text-white font-medium">${stock.price.toFixed(2)}</div>
                                  <div className="text-gray-400 text-xs">{stock.marketCap} Cap</div>
                                </td>
                                <td className="p-4 text-right">
                                  <div className={`font-medium ${getChangeColor(stock.change)}`}>
                                    {stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}
                                  </div>
                                  <div className={`text-xs ${getChangeColor(stock.change)}`}>
                                    ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                                  </div>
                                </td>
                                <td className="p-4 text-right">
                                  <div className="text-purple-400 font-medium">{stock.volume}</div>
                                </td>
                                <td className="p-4 text-right">
                                  <div className="text-blue-400 font-medium">{stock.floatShares}M</div>
                                  {stock.floatShares < 5 && (
                                    <Badge size="sm" className="text-orange-400 bg-orange-900/20 border-orange-800 text-xs">
                                      ULTRA LOW
                                    </Badge>
                                  )}
                                </td>
                                <td className="p-4 text-right">
                                  <div className={`font-medium ${
                                    stock.volatility > 50 ? 'text-red-400' :
                                    stock.volatility > 30 ? 'text-orange-400' :
                                    stock.volatility > 20 ? 'text-yellow-400' : 'text-gray-300'
                                  }`}>
                                    {stock.volatility.toFixed(1)}%
                                  </div>
                                </td>
                                <td className="p-4 text-center">
                                  <Badge className={getOpportunityColor(stock.opportunity)}>
                                    {stock.opportunity}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <div className="flex flex-wrap gap-1">
                                    {stock.signals.slice(0, 2).map((signal, i) => (
                                      <Badge key={i} size="sm" variant="outline" className="text-xs text-purple-300">
                                        {signal}
                                      </Badge>
                                    ))}
                                    {stock.signals.length > 2 && (
                                      <Badge size="sm" variant="outline" className="text-xs text-gray-400">
                                        +{stock.signals.length - 2} more
                                      </Badge>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Historical Analysis Notice */}
                <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-700">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3">
                      <History className="h-6 w-6 text-purple-400 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg font-medium text-white mb-2">Historical Low-Float Analysis</h3>
                        <p className="text-gray-300 text-sm mb-3">
                          Analyze past market conditions to identify patterns and opportunities in low-float stocks.
                          Perfect for backtesting strategies and understanding historical catalyst events.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-purple-400 font-medium">Historical Benefits:</span>
                            <ul className="text-gray-400 mt-1 space-y-1">
                              <li>• Study past squeeze events</li>
                              <li>• Identify seasonal patterns</li>
                              <li>• Analyze catalyst reactions</li>
                            </ul>
                          </div>
                          <div>
                            <span className="text-blue-400 font-medium">Use Cases:</span>
                            <ul className="text-gray-400 mt-1 space-y-1">
                              <li>• Strategy backtesting</li>
                              <li>• Pattern recognition</li>
                              <li>• Event-driven analysis</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Scanner Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Droplet className="h-4 w-4 text-blue-400" />
                    <div>
                      <div className="text-2xl font-bold text-blue-400">
                        {lowFloatStocks.filter(s => s.floatShares < 5).length}
                      </div>
                      <div className="text-sm text-gray-400">Ultra Low Float</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-orange-400" />
                    <div>
                      <div className="text-2xl font-bold text-orange-400">
                        {lowFloatStocks.filter(s => s.opportunity === 'HIGH').length}
                      </div>
                      <div className="text-sm text-gray-400">High Opportunity</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-red-400" />
                    <div>
                      <div className="text-2xl font-bold text-red-400">
                        {lowFloatStocks.filter(s => s.volatility > 30).length}
                      </div>
                      <div className="text-sm text-gray-400">High Volatility</div>
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
                        {lowFloatStocks.filter(s => s.changePercent > 5).length}
                      </div>
                      <div className="text-sm text-gray-400">Strong Momentum</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trading Strategy Notice */}
            <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-700">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Target className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Low Float Trading Strategy</h3>
                    <p className="text-gray-300 text-sm mb-3">
                      Small to micro-cap stocks with low float offer exceptional volatility and profit potential. 
                      These stocks can move rapidly on news, catalysts, or volume surges due to limited share availability.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-blue-400 font-medium">Key Advantages:</span>
                        <ul className="text-gray-400 mt-1 space-y-1">
                          <li>• Higher percentage moves</li>
                          <li>• Less institutional competition</li>
                          <li>• Catalyst-driven opportunities</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-yellow-400 font-medium">Risk Management:</span>
                        <ul className="text-gray-400 mt-1 space-y-1">
                          <li>• Use proper position sizing</li>
                          <li>• Set strict stop losses</li>
                          <li>• Monitor volume closely</li>
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