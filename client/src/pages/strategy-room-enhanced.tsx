import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { apiRequest } from '@/lib/queryClient';
import { LivePrice } from '@/components/LivePrice';
import { 
  Target,
  TrendingUp,
  Brain,
  Clock,
  DollarSign,
  TrendingDown,
  Activity,
  Calendar,
  BarChart3,
  Shield,
  Eye,
  Zap,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Rocket,
  RefreshCw,
  History,
  PlayCircle
} from 'lucide-react';

interface StrategyAnalysis {
  symbol: string;
  company: string;
  currentPrice: number;
  analysisType: 'OPTIONS_FLOW' | 'CLAUDE_MULTIBRAIN';
  entryPrice: number;
  targets: Array<{
    level: number;
    price: number;
    probability: string;
    expectedDate: string;
    gainPercent: number;
    isReached?: boolean;
    reachedDate?: string;
  }>;
  stopLoss: number;
  strategy: string;
  riskRewardRatio: number;
  expectedHoldingDays: number;
  positionSize: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  optionsFlow?: {
    callVolume: number;
    putVolume: number;
    impliedVolatility: number;
    unusualActivity: boolean;
    majorStrikes: Array<{ strike: number; volume: number; expiry: string }>;
  };
  reasoning: string;
  catalyst?: string;
  timestamp: number;
}

export default function StrategyRoomEnhanced() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [scanMode, setScanMode] = useState<'live' | 'historical'>('live');
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:30');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [endTime, setEndTime] = useState('16:00');
  const queryClient = useQueryClient();

  // Fetch enhanced strategy analysis
  const { data: strategyData, isLoading, refetch } = useQuery({
    queryKey: ['/api/strategy-room/enhanced', scanMode, startDate, startTime, endDate, endTime],
    queryFn: async () => {
      if (scanMode === 'historical') {
        const startDateTime = `${startDate}T${startTime}:00.000Z`;
        const endDateTime = `${endDate}T${endTime}:00.000Z`;
        const response = await fetch(`/api/strategy-room/enhanced?mode=historical&start=${startDateTime}&end=${endDateTime}`);
        return response.json();
      } else {
        const response = await fetch('/api/strategy-room/enhanced');
        return response.json();
      }
    },
    refetchInterval: scanMode === 'live' ? 30000 : undefined,
  });

  // Check target status mutation
  const checkTargetsMutation = useMutation({
    mutationFn: (analyses: StrategyAnalysis[]) => 
      apiRequest('/api/strategy-room/check-targets', 'POST', { analyses }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/strategy-room/enhanced'] });
    }
  });

  const analyses = strategyData?.analyses || [];
  const summary = strategyData?.summary || {};

  // Auto-check targets every minute
  useEffect(() => {
    if (analyses.length > 0) {
      const interval = setInterval(() => {
        checkTargetsMutation.mutate(analyses);
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [analyses]);

  const getAnalysisTypeBadge = (type: 'OPTIONS_FLOW' | 'CLAUDE_MULTIBRAIN') => {
    if (type === 'OPTIONS_FLOW') {
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
          Options Flow
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
        Claude AI
      </Badge>
    );
  };

  const getConfidenceBadge = (confidence: string) => {
    const colors = {
      HIGH: 'bg-slate-700 text-slate-300',
      MEDIUM: 'bg-slate-700 text-slate-300',
      LOW: 'bg-slate-700 text-slate-300'
    };
    return (
      <Badge className={`${colors[confidence] || colors.MEDIUM} text-xs`}>
        {confidence}
      </Badge>
    );
  };

  const getTargetStatus = (target: any) => {
    if (target.isReached) {
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          <CheckCircle className="w-3 h-3 mr-1" />
          TARGET REACHED {target.reachedDate}
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <div className="flex">
        <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
        <main className="flex-1 min-h-screen">
          <div className="p-6">
            {/* Clean Header Section */}
            <div className="bg-slate-900 rounded-lg p-6 border border-slate-800 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-white">
                    Strategy Room Enhanced
                  </h1>
                  <p className="text-slate-400 mt-1 text-sm">
                    {scanMode === 'historical' 
                      ? 'Historical analysis with timestamped opportunities'
                      : 'Live scanner with options flow analysis'
                    }
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button 
                    onClick={() => refetch()} 
                    disabled={isLoading}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700"
                    size="sm"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {isLoading ? 'Analyzing...' : 'Refresh'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Scanner Control Section */}
            <div className="mb-6">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Eye className="w-5 h-5 text-slate-400" />
                    <span>Scanner Integration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={scanMode} onValueChange={(value) => setScanMode(value as 'live' | 'historical')}>
                    <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-800">
                      <TabsTrigger value="live" className="flex items-center space-x-2 data-[state=active]:bg-slate-700">
                        <PlayCircle className="w-4 h-4" />
                        <span>Live</span>
                      </TabsTrigger>
                      <TabsTrigger value="historical" className="flex items-center space-x-2 data-[state=active]:bg-slate-700">
                        <History className="w-4 h-4" />
                        <span>Historical</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="live" className="space-y-4">
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                        <div className="bg-blue-500/10 p-3 rounded">
                          <p className="text-blue-400 font-semibold">Price Range</p>
                          <p className="text-white">$1 - $20</p>
                        </div>
                        <div className="bg-purple-500/10 p-3 rounded">
                          <p className="text-purple-400 font-semibold">Max Float</p>
                          <p className="text-white">&lt; 10M shares</p>
                        </div>
                        <div className="bg-emerald-500/10 p-3 rounded">
                          <p className="text-emerald-400 font-semibold">Min Change</p>
                          <p className="text-white">&ge; 2.0%</p>
                        </div>
                        <div className="bg-yellow-500/10 p-3 rounded">
                          <p className="text-yellow-400 font-semibold">Min RVOL</p>
                          <p className="text-white">&ge; 1.5x</p>
                        </div>
                        <div className="bg-cyan-500/10 p-3 rounded flex items-center">
                          <Button
                            onClick={() => refetch()}
                            disabled={isLoading}
                            size="sm"
                            className="w-full bg-cyan-600 hover:bg-cyan-700"
                          >
                            {isLoading ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Scanning...
                              </>
                            ) : (
                              <>
                                <Zap className="w-4 h-4 mr-2" />
                                Live Scan
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="historical" className="space-y-4">
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-300">Start Date</Label>
                          <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-slate-700 border-slate-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">Start Time</Label>
                          <Input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="bg-slate-700 border-slate-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">End Date</Label>
                          <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-slate-700 border-slate-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">End Time</Label>
                          <Input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="bg-slate-700 border-slate-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-300">Action</Label>
                          <Button
                            onClick={() => refetch()}
                            disabled={isLoading}
                            className="w-full bg-orange-600 hover:bg-orange-700"
                          >
                            {isLoading ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <History className="w-4 h-4 mr-2" />
                                Historical Scan
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Activity className="w-6 h-6 text-green-400" />
                    <div className="ml-3">
                      <p className="text-xs text-slate-400">Options Flow</p>
                      <p className="text-lg font-semibold text-white">{summary.optionsFlowTrades || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Brain className="w-6 h-6 text-blue-400" />
                    <div className="ml-3">
                      <p className="text-xs text-slate-400">Claude Trades</p>
                      <p className="text-lg font-semibold text-white">{summary.claudeTrades || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                    <div className="ml-3">
                      <p className="text-xs text-slate-400">Total</p>
                      <p className="text-lg font-semibold text-white">{summary.totalOpportunities || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Clock className="w-6 h-6 text-slate-400" />
                    <div className="ml-3">
                      <p className="text-xs text-slate-400">
                        {scanMode === 'historical' ? 'Range' : 'Updated'}
                      </p>
                      <p className="text-xs font-medium text-white">
                        {scanMode === 'historical' && strategyData?.scanRange ? 
                          `${new Date(strategyData.scanRange.start).toLocaleDateString()} - ${new Date(strategyData.scanRange.end).toLocaleDateString()}` :
                          strategyData?.timestamp ? new Date(strategyData.timestamp).toLocaleTimeString() : 'Never'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Strategy Analysis Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                  <p className="text-slate-400">Analyzing market opportunities...</p>
                </div>
              </div>
            ) : analyses.length === 0 ? (
              <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-8 text-center">
                  <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No Opportunities Found</h3>
                  <p className="text-slate-400">No stocks meet scanner criteria at this time.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {analyses.map((analysis: StrategyAnalysis, index: number) => (
                  <Card key={`${analysis.symbol}-${index}`} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl font-bold text-white">{analysis.symbol}</div>
                          <LivePrice symbol={analysis.symbol} />
                        </div>
                        <div className="flex items-center space-x-2">
                          {getAnalysisTypeBadge(analysis.analysisType)}
                          {analysis.timestamp && (
                            <Badge variant="outline" className="text-xs text-slate-400 border-slate-600">
                              {scanMode === 'historical' ? 
                                new Date(analysis.timestamp).toLocaleString() : 
                                'Live'
                              }
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getConfidenceBadge(analysis.confidence)}
                        <Badge className="bg-slate-700 text-slate-300">
                          {analysis.strategy}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Entry & Stop Loss */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-slate-400">Entry</p>
                          <p className="text-sm font-medium text-white">${analysis.entryPrice.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Stop Loss</p>
                          <p className="text-sm font-medium text-red-400">${analysis.stopLoss.toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Targets */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-slate-300">Targets</p>
                        {analysis.targets.map((target, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-slate-800 rounded text-xs">
                            <div className="flex items-center space-x-2">
                              <span className="text-slate-400">T{target.level}</span>
                              <span className="text-white font-medium">${target.price.toFixed(2)}</span>
                              <span className="text-slate-400">({target.probability})</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-slate-400">{target.expectedDate}</span>
                              <span className="text-emerald-400">+{target.gainPercent.toFixed(1)}%</span>
                              {getTargetStatus(target)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Options Flow Data (if available) */}
                      {analysis.optionsFlow && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-slate-300">Options Flow</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-slate-800 p-2 rounded">
                              <span className="text-slate-300">Calls: {analysis.optionsFlow.callVolume.toLocaleString()}</span>
                            </div>
                            <div className="bg-slate-800 p-2 rounded">
                              <span className="text-slate-300">Puts: {analysis.optionsFlow.putVolume.toLocaleString()}</span>
                            </div>
                            <div className="bg-slate-800 p-2 rounded">
                              <span className="text-slate-300">IV: {(analysis.optionsFlow.impliedVolatility * 100).toFixed(1)}%</span>
                            </div>
                            <div className="bg-slate-800 p-2 rounded">
                              <span className="text-slate-300">
                                {analysis.optionsFlow.unusualActivity ? 'Unusual' : 'Normal'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Trade Details */}
                      <div className="grid grid-cols-3 gap-2 text-xs bg-slate-800 p-2 rounded">
                        <div>
                          <span className="text-slate-400">R/R: </span>
                          <span className="text-white">{analysis.riskRewardRatio.toFixed(1)}:1</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Hold: </span>
                          <span className="text-white">{analysis.expectedHoldingDays}d</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Size: </span>
                          <span className="text-white">{analysis.positionSize}</span>
                        </div>
                      </div>

                      {/* Analysis Reasoning */}
                      <div className="bg-slate-800 p-3 rounded">
                        <p className="text-xs font-medium text-slate-300 mb-2">Analysis</p>
                        <p className="text-xs text-slate-400 leading-relaxed">{analysis.reasoning}</p>
                        {analysis.catalyst && (
                          <p className="text-xs text-emerald-400 mt-2">
                            <span className="font-medium">Catalyst:</span> {analysis.catalyst}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}