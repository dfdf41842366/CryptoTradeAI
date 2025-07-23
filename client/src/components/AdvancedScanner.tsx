import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Zap, BarChart3, Search } from "lucide-react";

interface AdvancedStockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  momentum?: number;
  rsi?: number;
  sentiment?: number;
  optionsFlow?: 'bullish' | 'bearish' | 'neutral';
  float?: number;
  volatility?: number;
}

export function AdvancedScanner() {
  const [activeStrategy, setActiveStrategy] = useState<'momentum' | 'low-float' | 'oversold'>('momentum');

  const { data: momentumData = [], isLoading: momentumLoading, refetch: refetchMomentum } = useQuery<AdvancedStockData[]>({
    queryKey: ['/api/scanner/momentum'],
    enabled: activeStrategy === 'momentum'
  });

  const { data: lowFloatData = [], isLoading: lowFloatLoading, refetch: refetchLowFloat } = useQuery<AdvancedStockData[]>({
    queryKey: ['/api/scanner/low-float'],
    enabled: activeStrategy === 'low-float'
  });

  const { data: oversoldData = [], isLoading: oversoldLoading, refetch: refetchOversold } = useQuery<AdvancedStockData[]>({
    queryKey: ['/api/scanner/oversold'],
    enabled: activeStrategy === 'oversold'
  });

  const getCurrentData = () => {
    switch (activeStrategy) {
      case 'momentum': return momentumData;
      case 'low-float': return lowFloatData;
      case 'oversold': return oversoldData;
      default: return [];
    }
  };

  const getCurrentLoading = () => {
    switch (activeStrategy) {
      case 'momentum': return momentumLoading;
      case 'low-float': return lowFloatLoading;
      case 'oversold': return oversoldLoading;
      default: return false;
    }
  };

  const handleRefresh = () => {
    switch (activeStrategy) {
      case 'momentum': refetchMomentum(); break;
      case 'low-float': refetchLowFloat(); break;
      case 'oversold': refetchOversold(); break;
    }
  };

  const getFlowBadgeColor = (flow?: string) => {
    switch (flow) {
      case 'bullish': return 'bg-green-600';
      case 'bearish': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const formatMomentum = (momentum?: number) => {
    if (!momentum) return 'N/A';
    return momentum > 0 ? `+${momentum.toFixed(1)}` : momentum.toFixed(1);
  };

  return (
    <Card className="bg-[var(--trading-slate)] border-gray-700">
      <CardHeader className="border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Advanced Market Scanner</h2>
            <p className="text-gray-400 text-sm mt-1">AI-powered stock screening strategies</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={getCurrentLoading()}
            variant="outline"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
          >
            <Search className={`h-4 w-4 mr-1 ${getCurrentLoading() ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs value={activeStrategy} onValueChange={(value) => setActiveStrategy(value as any)}>
          <TabsList className="grid grid-cols-3 mb-6 bg-gray-800">
            <TabsTrigger value="momentum" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Momentum</span>
            </TabsTrigger>
            <TabsTrigger value="low-float" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Low Float</span>
            </TabsTrigger>
            <TabsTrigger value="oversold" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Oversold</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="momentum" className="space-y-0">
            <div className="mb-4">
              <h3 className="text-white font-medium">Momentum Breakouts</h3>
              <p className="text-gray-400 text-sm">Stocks with high volume and price momentum</p>
            </div>
          </TabsContent>

          <TabsContent value="low-float" className="space-y-0">
            <div className="mb-4">
              <h3 className="text-white font-medium">Low Float High Volume</h3>
              <p className="text-gray-400 text-sm">Small float stocks with unusual volume activity</p>
            </div>
          </TabsContent>

          <TabsContent value="oversold" className="space-y-0">
            <div className="mb-4">
              <h3 className="text-white font-medium">Oversold Bounce Candidates</h3>
              <p className="text-gray-400 text-sm">Oversold stocks with bounce potential</p>
            </div>
          </TabsContent>

          {getCurrentLoading() ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse bg-gray-800 rounded-lg p-4 h-16"></div>
              ))}
            </div>
          ) : getCurrentData().length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No opportunities found with current criteria</p>
              <Button onClick={handleRefresh} className="mt-4 bg-blue-600 hover:bg-blue-700">
                Run Scan
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 text-gray-400 font-medium">Symbol</th>
                    <th className="text-left py-3 text-gray-400 font-medium">Price</th>
                    <th className="text-left py-3 text-gray-400 font-medium">Change</th>
                    <th className="text-left py-3 text-gray-400 font-medium">Volume</th>
                    <th className="text-left py-3 text-gray-400 font-medium">Momentum</th>
                    <th className="text-left py-3 text-gray-400 font-medium">RSI</th>
                    <th className="text-left py-3 text-gray-400 font-medium">Options</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {getCurrentData().slice(0, 10).map((stock, index) => (
                    <tr key={index} className="hover:bg-gray-800 transition-colors">
                      <td className="py-3 text-white font-medium">{stock.symbol}</td>
                      <td className="py-3 text-white">${stock.price?.toFixed(2)}</td>
                      <td className="py-3">
                        <span className={`${
                          stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {stock.changePercent >= 0 ? '+' : ''}${stock.change?.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent?.toFixed(1)}%)
                        </span>
                      </td>
                      <td className="py-3 text-gray-300">{stock.volume}</td>
                      <td className="py-3">
                        <span className={`${
                          (stock.momentum || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatMomentum(stock.momentum)}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`${
                          !stock.rsi ? 'text-gray-400' :
                          stock.rsi < 30 ? 'text-red-400' :
                          stock.rsi > 70 ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {stock.rsi?.toFixed(0) || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3">
                        <Badge className={`${getFlowBadgeColor(stock.optionsFlow)} text-white text-xs`}>
                          {stock.optionsFlow || 'neutral'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}