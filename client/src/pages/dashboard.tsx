import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { StatsCard } from "@/components/StatsCard";
import { SignalCard } from "@/components/SignalCard";
import { MarketScanner } from "@/components/MarketScanner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { RefreshCw, Bot, TrendingUp, Clock, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { Signal, Analytics, MarketData } from "@shared/schema";
import { EmojiSentiment, QuickSentiment, SentimentTrend, type SentimentData } from '@/components/EmojiSentiment';
import { DataFeedStatus } from '@/components/DataFeedStatus';

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Optimized refresh rates to prevent flickering while maintaining real-time data
  const { data: signals = [], isLoading: signalsLoading, refetch: refetchSignals } = useQuery<Signal[]>({
    queryKey: ["/api/signals"],
    refetchInterval: 30000, // Refresh every 30 seconds - signals don't change that frequently
    staleTime: 15000, // Consider data stale after 15 seconds
    refetchOnWindowFocus: false, // Prevent flickering on focus
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics>({
    queryKey: ["/api/analytics"],
    refetchInterval: 60000, // Refresh every minute - analytics change slowly
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const { data: topMovers = [], isLoading: moversLoading } = useQuery<MarketData[]>({
    queryKey: ["/api/market-data/movers"],
    refetchInterval: 15000, // Refresh every 15 seconds for market data
    staleTime: 10000,
    refetchOnWindowFocus: false, // Prevent flickering on focus
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      console.log("⚡ Refreshing all data...");
      await Promise.all([
        refetchSignals(),
        fetch("/api/market-data/movers").then(() => {
          // Force refresh market data
        })
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTriggerScan = async () => {
    setIsScanning(true);
    try {
      console.log("🔍 Triggering ultra-fast scan...");
      const response = await fetch("/api/scan/trigger", { method: "POST" });
      if (response.ok) {
        // Generate new signals with real-time data
        await fetch("/api/signals/generate-live", { 
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ count: 8 })
        });
        // Refresh data after scan
        setTimeout(() => refetchSignals(), 1000);
      }
    } catch (error) {
      console.error("Error triggering scan:", error);
    } finally {
      setIsScanning(false);
    }
  };

  if (analyticsLoading) {
    return (
      <div className="min-h-screen bg-[var(--trading-dark)] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-cyan-200">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--trading-dark)] text-gray-100">
      <Header analytics={analytics} />
      
      <div className="flex">
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        
        <main className={cn(
          "flex-1 p-6 space-y-6 transition-all duration-300"
        )}>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Active Signals"
              value={signals.length.toString()}
              change="+12% from yesterday"
              icon={<Bot className="h-5 w-5" />}
              trend="up"
              bgColor="bg-blue-600"
            />
            <StatsCard
              title="Win Rate"
              value={`${analytics?.winRate?.toFixed(1) || 0}%`}
              change="+2.1% this week"
              icon={<TrendingUp className="h-5 w-5" />}
              trend="up"
              bgColor="bg-[var(--profit-green)]"
            />
            <StatsCard
              title="Avg Hold Time"
              value={analytics?.avgHoldTime || "2.4h"}
              change="-15min from avg"
              icon={<Clock className="h-5 w-5" />}
              trend="down"
              bgColor="bg-[var(--warning-yellow)]"
            />
            <StatsCard
              title="AI Confidence"
              value={`${analytics?.aiConfidence?.toFixed(0) || 87}%`}
              change="High confidence day"
              icon={<Brain className="h-5 w-5" />}
              trend="up"
              bgColor="bg-purple-600"
            />
          </div>

          {/* Top Signals Section */}
          <Card className="bg-[var(--trading-slate)] border-gray-700">
            <CardHeader className="border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-blue-200">Top AI Signals</h2>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={handleRefresh}
                    disabled={isRefreshing || signalsLoading}
                    variant="outline"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-cyan-100 border-blue-600"
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                  </Button>
                  <Button
                    onClick={handleTriggerScan}
                    disabled={isScanning}
                    variant="outline"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-emerald-100 border-green-600"
                  >
                    <Bot className={`h-4 w-4 mr-1 ${isScanning ? 'animate-pulse' : ''}`} />
                    {isScanning ? 'Scanning...' : 'Trigger Scan'}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {signalsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-800 rounded-lg p-4 h-24"></div>
                    </div>
                  ))}
                </div>
              ) : signals.length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                  <p className="text-slate-300 mb-4">No signals available</p>
                  <Button onClick={handleTriggerScan} className="bg-blue-600 hover:bg-blue-700">
                    Generate Signals
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {signals.slice(0, 10).map((signal) => (
                    <SignalCard key={signal.id} signal={signal} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Feed Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <DataFeedStatus />
            <div className="col-span-3">
              <EmojiSentiment data={{
                price: 0,
                change: 0,
                changePercent: 0,
                volume: 0,
                trend: 'neutral' as const,
                volatility: 'medium' as const,
                momentum: 'moderate' as const,
                confidence: 85
              }} />
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <MarketScanner data={topMovers} isLoading={moversLoading} />
            
            {/* Performance Analytics */}
            <Card className="bg-[var(--trading-slate)] border-gray-700">
              <CardHeader className="border-b border-gray-700">
                <h2 className="text-xl font-semibold text-violet-200">Performance Analytics</h2>
                <p className="text-indigo-300 text-sm mt-1">Last 30 days trading performance</p>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-cyan-300 text-sm">Total Trades</span>
                        <TrendingUp className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="text-white font-semibold text-lg">
                        {analytics?.totalTrades || 0}
                      </div>
                      <div className="text-[var(--profit-green)] text-sm">+89 this week</div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-emerald-300 text-sm">Avg Daily P&L</span>
                        <span className="text-[var(--profit-green)]">$</span>
                      </div>
                      <div className="text-white font-semibold text-lg">
                        ${analytics?.avgDailyPnL?.toLocaleString() || 0}
                      </div>
                      <div className="text-[var(--profit-green)] text-sm">+12.4% vs last month</div>
                    </div>
                  </div>
                  
                  {/* Signal Grades Distribution */}
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h4 className="text-amber-200 font-medium mb-3">Signal Grade Distribution</h4>
                    <div className="space-y-2">
                      {analytics?.gradeDistribution && Object.entries(analytics.gradeDistribution as Record<string, number>).map(([grade, percentage]) => (
                        <div key={grade} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className={`w-3 h-3 rounded-full ${
                              grade === 'A+/A' ? 'bg-green-500' :
                              grade === 'B+/B' ? 'bg-blue-500' :
                              grade === 'C+/C' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></span>
                            <span className="text-slate-200 text-sm">Grade {grade}</span>
                          </div>
                          <span className="text-white text-sm font-medium">
                            {typeof percentage === 'number' ? percentage.toFixed(0) : 0}%
                          </span>
                        </div>
                      ))}
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
