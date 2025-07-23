import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  BarChart3,
  Zap,
  Target,
  PlayCircle,
  PauseCircle,
  RefreshCw,
  Eye,
  Bell,
  Calendar,
  History,
  Filter
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { EmojiSentiment, QuickSentiment, SentimentTrend, type SentimentData } from '@/components/EmojiSentiment';

interface PreMarketOpportunity {
  symbol: string;
  company: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  gap: number;
  gapPercent: number;
  volume: number;
  avgVolume: number;
  rvol: number;
  float: number;
  volumeImpactScore: number;
  marketSession: string;
  rank?: number;
}

interface ScanAlert {
  id: number;
  symbol: string;
  alertType: string;
  title: string;
  message: string;
  priority: string;
  timestamp: string;
  acknowledged: boolean;
  data?: PreMarketOpportunity;
}

interface ScanStatus {
  isActive: boolean;
  currentSession: string;
  nextScanTime: string;
  timezone: string;
  currentTime: string;
  criteria: {
    priceRange: string;
    maxFloat: string;
    minRvol: string;
    minChange: string;
    minGap: string;
  };
}

export default function PreMarketScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState<'live' | 'historical'>('live');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('16:40');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [endTime, setEndTime] = useState('09:25');
  const [useTimeRange, setUseTimeRange] = useState(false);
  const [historicalResults, setHistoricalResults] = useState<PreMarketOpportunity[]>([]);
  const queryClient = useQueryClient();

  // Fetch scanner status
  const { data: scanStatus } = useQuery<ScanStatus>({
    queryKey: ['/api/scanner/pre-market/status'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch scan results
  const { data: scanResults = [], isLoading: resultsLoading } = useQuery<PreMarketOpportunity[]>({
    queryKey: ['/api/scanner/pre-market/results'],
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch alerts
  const { data: alerts = [], isLoading: alertsLoading } = useQuery<ScanAlert[]>({
    queryKey: ['/api/scanner/pre-market/alerts'],
    refetchInterval: 30000,
  });

  // Manual scan mutation (live)
  const scanMutation = useMutation({
    mutationFn: async (forceRun: boolean) => {
      const response = await fetch('/api/scanner/pre-market/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceRun }),
      });
      return response.json();
    },
    onMutate: () => setIsScanning(true),
    onSettled: () => setIsScanning(false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scanner/pre-market/results'] });
      queryClient.invalidateQueries({ queryKey: ['/api/scanner/pre-market/alerts'] });
    },
  });

  // Historical scan mutation
  const historicalScanMutation = useMutation({
    mutationFn: async ({ date, time, endDate, endTime, useRange }: { 
      date: string; 
      time: string; 
      endDate?: string; 
      endTime?: string; 
      useRange?: boolean; 
    }) => {
      const response = await fetch('/api/scanner/pre-market/historical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          date, 
          time, 
          endDate: useRange ? endDate : undefined,
          endTime: useRange ? endTime : undefined,
          useRange 
        }),
      });
      return response.json();
    },
    onMutate: () => setIsScanning(true),
    onSettled: () => setIsScanning(false),
    onSuccess: (data) => {
      setHistoricalResults(data.opportunities || []);
    },
  });

  // Auto-refresh timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (scanStatus?.isActive && !isScanning) {
        queryClient.invalidateQueries({ queryKey: ['/api/scanner/pre-market/results'] });
      }
    }, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [scanStatus, isScanning, queryClient]);

  const handleManualScan = () => {
    if (scanMode === 'live') {
      scanMutation.mutate(true);
    } else {
      historicalScanMutation.mutate({ 
        date: selectedDate, 
        time: selectedTime,
        endDate: endDate,
        endTime: endTime,
        useRange: useTimeRange
      });
    }
  };

  const getMarketSession = (time: string): string => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 4 && hour < 9) return 'Pre-Market';
    if (hour >= 9 && hour < 16) return 'Regular Hours';
    if (hour >= 16 && hour < 20) return 'After Hours';
    return 'Overnight';
  };

  const getCurrentResults = () => {
    return scanMode === 'live' ? scanResults : historicalResults;
  };

  const getSessionColor = (session: string) => {
    switch (session) {
      case 'pre-market': return 'bg-blue-500';
      case 'after-hours': return 'bg-purple-500';
      case 'extended': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'default';
      case 'LOW': return 'secondary';
      default: return 'outline';
    }
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(0)}K`;
    }
    return volume.toString();
  };

  const formatFloat = (floatShares: number) => {
    return `${floatShares.toFixed(1)}M`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Pre-Market Scanner
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Automated scanner for high-opportunity low-float stocks
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Scan Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              variant={scanMode === 'live' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setScanMode('live')}
              className="text-xs"
            >
              <Activity className="w-3 h-3 mr-1" />
              Live
            </Button>
            <Button
              variant={scanMode === 'historical' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setScanMode('historical')}
              className="text-xs"
            >
              <History className="w-3 h-3 mr-1" />
              Historical
            </Button>
          </div>

          {/* Historical Date and Time Picker */}
          {scanMode === 'historical' && (
            <div className="space-y-4">
              {/* Time Range Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="time-range"
                  checked={useTimeRange}
                  onChange={(e) => setUseTimeRange(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="time-range" className="text-sm">Use time range (from-to)</Label>
              </div>

              {/* Start Date/Time */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="scan-date" className="text-sm font-medium">
                    {useTimeRange ? 'From Date:' : 'Date:'}
                  </Label>
                  <Input
                    id="scan-date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-40"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="scan-time" className="text-sm font-medium">
                    {useTimeRange ? 'From Time:' : 'Time:'}
                  </Label>
                  <Input
                    id="scan-time"
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-32"
                    step="300"
                  />
                </div>
                <Badge variant="outline" className="text-xs">
                  ET
                </Badge>
              </div>

              {/* End Date/Time (only show when range is enabled) */}
              {useTimeRange && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="end-date" className="text-sm font-medium">To Date:</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-40"
                      min={selectedDate}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="end-time" className="text-sm font-medium">To Time:</Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-32"
                      step="300"
                    />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    ET
                  </Badge>
                </div>
              )}

              {/* Quick Time Presets */}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTime('04:00');
                    if (useTimeRange) setEndTime('09:00');
                  }}
                >
                  Pre-Market
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTime('09:30');
                    if (useTimeRange) setEndTime('16:00');
                  }}
                >
                  Regular Hours
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTime('16:00');
                    if (useTimeRange) setEndTime('20:00');
                  }}
                >
                  After Hours
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTime('00:00');
                    if (useTimeRange) setEndTime('04:00');
                  }}
                >
                  Overnight
                </Button>
              </div>
            </div>
          )}

          <Button
            onClick={handleManualScan}
            disabled={isScanning}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                {scanMode === 'live' ? <PlayCircle className="w-4 h-4 mr-2" /> : <Calendar className="w-4 h-4 mr-2" />}
                {scanMode === 'live' ? 'Run Live Scan' : 'Scan Date'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Scan Mode Info */}
      {scanMode === 'historical' && (
        <Alert>
          <History className="h-4 w-4" />
          <AlertTitle>
            Historical Scan Mode - {
              useTimeRange 
                ? `${getMarketSession(selectedTime)} to ${getMarketSession(endTime)}` 
                : getMarketSession(selectedTime)
            }
          </AlertTitle>
          <AlertDescription>
            {useTimeRange ? (
              <>
                Analyzing market data from {new Date(selectedDate).toLocaleDateString()} {selectedTime} ET 
                to {new Date(endDate).toLocaleDateString()} {endTime} ET using criteria: 
                Price $1-20, Float &lt;10M shares, RVOL ≥1.5x, Change ≥2%, Gap ≥2%
              </>
            ) : (
              <>
                Analyzing market data for {new Date(selectedDate).toLocaleDateString()} at {selectedTime} ET using criteria: 
                Price $1-20, Float &lt;10M shares, RVOL ≥1.5x, Change ≥2%, Gap ≥2%
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Scanner Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scanStatus ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${scanStatus.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className="text-sm font-medium">
                    {scanStatus.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getSessionColor(scanStatus.currentSession)}>
                    {scanStatus.currentSession}
                  </Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {scanStatus.currentTime}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Scan Criteria</div>
                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <div>Price: {scanStatus.criteria.priceRange}</div>
                  <div>Float: {scanStatus.criteria.maxFloat}</div>
                  <div>RVOL: {scanStatus.criteria.minRvol}</div>
                  <div>Change: {scanStatus.criteria.minChange}</div>
                  <div>Gap: {scanStatus.criteria.minGap}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Next Scan</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {scanStatus.nextScanTime}
                </div>
                <div className="text-xs text-gray-500">
                  Timezone: {scanStatus.timezone}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-500">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Loading scanner status...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Active Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <Alert key={alert.id} className={`border-l-4 ${
                  alert.priority === 'HIGH' ? 'border-l-red-500' :
                  alert.priority === 'MEDIUM' ? 'border-l-yellow-500' : 'border-l-blue-500'
                }`}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="flex items-center justify-between">
                    <span>{alert.title}</span>
                    <Badge variant={getPriorityColor(alert.priority)}>
                      {alert.priority}
                    </Badge>
                  </AlertTitle>
                  <AlertDescription>
                    <div className="mt-2">
                      <p>{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(alert.timestamp))} ago
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Tabs */}
      <Tabs defaultValue="opportunities" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="opportunities">
            Opportunities ({getCurrentResults().length})
            {scanMode === 'historical' && (
              <Badge variant="outline" className="ml-2 text-xs">
                {useTimeRange 
                  ? `${new Date(selectedDate).toLocaleDateString()} ${selectedTime} - ${new Date(endDate).toLocaleDateString()} ${endTime} ET`
                  : `${new Date(selectedDate).toLocaleDateString()} ${selectedTime} ET (${getMarketSession(selectedTime)})`
                }
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="watchlist">
            Watchlist
          </TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-4">
          {(resultsLoading && scanMode === 'live') || isScanning ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                {scanMode === 'live' ? 'Loading scan results...' : 'Scanning historical data...'}
              </CardContent>
            </Card>
          ) : getCurrentResults().length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
                <Eye className="w-6 h-6 mr-2" />
                {scanMode === 'live' 
                  ? 'No opportunities found. Try running a manual scan.' 
                  : useTimeRange 
                    ? `No opportunities found from ${new Date(selectedDate).toLocaleDateString()} ${selectedTime} to ${new Date(endDate).toLocaleDateString()} ${endTime} ET. Try a different time range.`
                    : `No opportunities found for ${new Date(selectedDate).toLocaleDateString()} at ${selectedTime} ET (${getMarketSession(selectedTime)}). Try a different date or time.`
                }
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {getCurrentResults().length} opportunities found
                    {scanMode === 'historical' && (useTimeRange 
                      ? ` from ${new Date(selectedDate).toLocaleDateString()} ${selectedTime} to ${new Date(endDate).toLocaleDateString()} ${endTime} ET`
                      : ` for ${new Date(selectedDate).toLocaleDateString()} at ${selectedTime} ET (${getMarketSession(selectedTime)})`
                    )}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  Ranked by Volume Impact Score
                </Badge>
              </div>
              
              <div className="space-y-2">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-muted rounded-t-lg text-sm font-semibold text-muted-foreground">
                  <div className="col-span-2">Symbol</div>
                  <div className="col-span-1 text-right">Price</div>
                  <div className="col-span-1 text-right">Change</div>
                  <div className="col-span-1 text-right">Gap</div>
                  <div className="col-span-1 text-right">Volume</div>
                  <div className="col-span-1 text-right">RVOL</div>
                  <div className="col-span-1 text-right">Float</div>
                  <div className="col-span-1 text-right">Score</div>
                  <div className="col-span-2">Session</div>
                  <div className="col-span-1 text-right">Rank</div>
                </div>

                {/* Results List */}
                {getCurrentResults().slice(0, 50).map((opportunity, index) => (
                  <div 
                    key={`${opportunity.symbol}-${index}`} 
                    className="grid grid-cols-12 gap-4 px-4 py-3 bg-background border border-border hover:bg-accent/50 transition-colors text-sm text-foreground"
                  >
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-primary">{opportunity.symbol}</div>
                        <QuickSentiment
                          data={{
                            price: opportunity.price,
                            change: opportunity.change,
                            changePercent: opportunity.changePercent,
                            volume: opportunity.volume
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{opportunity.company}</div>
                    </div>
                    <div className="col-span-1 text-right font-semibold">
                      {formatCurrency(opportunity.price)}
                    </div>
                    <div className={`col-span-1 text-right font-semibold ${getChangeColor(opportunity.change)}`}>
                      {opportunity.changePercent > 0 ? '+' : ''}{opportunity.changePercent.toFixed(2)}%
                    </div>
                    <div className={`col-span-1 text-right font-semibold ${getChangeColor(opportunity.gap)}`}>
                      {opportunity.gapPercent > 0 ? '+' : ''}{opportunity.gapPercent.toFixed(2)}%
                    </div>
                    <div className="col-span-1 text-right">
                      {formatVolume(opportunity.volume)}
                    </div>
                    <div className="col-span-1 text-right font-semibold">
                      {opportunity.rvol.toFixed(1)}x
                    </div>
                    <div className="col-span-1 text-right">
                      {formatFloat(opportunity.float)}
                    </div>
                    <div className="col-span-1 text-right">
                      <div className="font-bold text-purple-600">
                        {opportunity.volumeImpactScore.toFixed(1)}
                      </div>
                      <EmojiSentiment
                        data={{
                          price: opportunity.price,
                          change: opportunity.change,
                          changePercent: opportunity.changePercent,
                          volume: opportunity.volume,
                          trend: opportunity.changePercent >= 2 ? 'bullish' : opportunity.changePercent <= -2 ? 'bearish' : 'neutral',
                          volatility: opportunity.rvol >= 3 ? 'high' : opportunity.rvol >= 1.5 ? 'medium' : 'low'
                        }}
                        size="sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <Badge variant="outline" className="text-xs">
                        {opportunity.marketSession}
                      </Badge>
                    </div>
                    <div className="col-span-1 text-right text-muted-foreground">
                      #{opportunity.rank || index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="watchlist" className="space-y-4">
          <Card>
            <CardContent className="flex items-center justify-center py-12 text-gray-500">
              <Clock className="w-6 h-6 mr-2" />
              Watchlist feature coming soon
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}