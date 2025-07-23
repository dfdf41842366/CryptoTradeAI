import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, MessageSquare, Activity } from "lucide-react";

interface SentimentOverview {
  overallMarket: number;
  fearGreedIndex: number;
  volatilityIndex: number;
  sectorRotation: string;
}

interface SentimentData {
  symbol: string;
  overallSentiment: number;
  newsCount: number;
  socialMentions: number;
  bullishPercentage: number;
  bearishPercentage: number;
  keyNewsHeadlines: string[];
  institutionalFlow: 'bullish' | 'bearish' | 'neutral';
}

export function SentimentDashboard() {
  const { data: overview } = useQuery<SentimentOverview>({
    queryKey: ['/api/sentiment/overview']
  });

  const { data: sentimentData = [] } = useQuery<SentimentData[]>({
    queryKey: ['/api/sentiment/NVDA,TSLA,AAPL,MSFT,AMZN']
  });

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 20) return 'text-green-400';
    if (sentiment < -20) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getFearGreedColor = (index: number) => {
    if (index > 70) return 'text-red-400'; // Extreme Greed
    if (index > 50) return 'text-yellow-400'; // Greed
    if (index > 30) return 'text-blue-400'; // Neutral
    return 'text-green-400'; // Fear
  };

  const getFearGreedLabel = (index: number) => {
    if (index > 80) return 'Extreme Greed';
    if (index > 70) return 'Greed';
    if (index > 50) return 'Neutral';
    if (index > 30) return 'Fear';
    return 'Extreme Fear';
  };

  const getFlowBadgeColor = (flow: string) => {
    switch (flow) {
      case 'bullish': return 'bg-green-600';
      case 'bearish': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <Card className="bg-[var(--trading-slate)] border-gray-700">
        <CardHeader className="border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Market Sentiment Overview</h2>
          <p className="text-gray-400 text-sm mt-1">Real-time market psychology and sentiment indicators</p>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Overall Market</span>
                {(overview?.overallMarket || 0) >= 0 ? 
                  <TrendingUp className="h-4 w-4 text-green-400" /> : 
                  <TrendingDown className="h-4 w-4 text-red-400" />
                }
              </div>
              <div className={`text-white font-semibold text-lg ${getSentimentColor(overview?.overallMarket || 0)}`}>
                {overview?.overallMarket || 0}
              </div>
              <div className="text-gray-500 text-xs mt-1">Sentiment Score</div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Fear & Greed</span>
                <Activity className="h-4 w-4 text-blue-400" />
              </div>
              <div className={`text-white font-semibold text-lg ${getFearGreedColor(overview?.fearGreedIndex || 50)}`}>
                {overview?.fearGreedIndex || 50}
              </div>
              <div className="text-gray-500 text-xs mt-1">{getFearGreedLabel(overview?.fearGreedIndex || 50)}</div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Volatility Index</span>
                <Activity className="h-4 w-4 text-orange-400" />
              </div>
              <div className="text-white font-semibold text-lg">
                {overview?.volatilityIndex?.toFixed(1) || '25.0'}
              </div>
              <div className="text-gray-500 text-xs mt-1">VIX Level</div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Sector Rotation</span>
                <TrendingUp className="h-4 w-4 text-purple-400" />
              </div>
              <div className="text-white font-semibold text-lg">
                {overview?.sectorRotation || 'Technology'}
              </div>
              <div className="text-gray-500 text-xs mt-1">Leading Sector</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock-Specific Sentiment */}
      <Card className="bg-[var(--trading-slate)] border-gray-700">
        <CardHeader className="border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Stock Sentiment Analysis</h2>
          <p className="text-gray-400 text-sm mt-1">Individual stock sentiment from news and social media</p>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-4">
            {sentimentData.map((stock, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <h3 className="text-white font-semibold text-lg">{stock.symbol}</h3>
                      <div className={`text-sm font-medium ${getSentimentColor(stock.overallSentiment)}`}>
                        Sentiment: {stock.overallSentiment > 0 ? '+' : ''}{stock.overallSentiment}
                      </div>
                      <Badge className={`${getFlowBadgeColor(stock.institutionalFlow)} text-white text-xs`}>
                        {stock.institutionalFlow} flow
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-blue-400" />
                        <span className="text-gray-300 text-sm">{stock.newsCount} news</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-green-400" />
                        <span className="text-gray-300 text-sm">{stock.socialMentions} mentions</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-400">Bullish:</span>
                        <span className="text-green-400 ml-1">{stock.bullishPercentage.toFixed(0)}%</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-400">Bearish:</span>
                        <span className="text-red-400 ml-1">{stock.bearishPercentage.toFixed(0)}%</span>
                      </div>
                    </div>
                    
                    {stock.keyNewsHeadlines.length > 0 && (
                      <div>
                        <p className="text-gray-400 text-xs mb-2">Recent Headlines:</p>
                        <ul className="space-y-1">
                          {stock.keyNewsHeadlines.slice(0, 2).map((headline, i) => (
                            <li key={i} className="text-gray-300 text-sm truncate">
                              • {headline}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 text-center">
                    <div className="w-16 h-16 relative">
                      <div className={`absolute inset-0 rounded-full border-4 ${
                        stock.overallSentiment > 20 ? 'border-green-400' :
                        stock.overallSentiment < -20 ? 'border-red-400' : 'border-yellow-400'
                      }`} 
                      style={{
                        background: `conic-gradient(${
                          stock.overallSentiment > 20 ? '#4ade80' :
                          stock.overallSentiment < -20 ? '#f87171' : '#facc15'
                        } ${Math.abs(stock.overallSentiment)}%, #374151 0)`
                      }}
                      />
                      <div className="absolute inset-2 bg-gray-800 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {Math.abs(stock.overallSentiment)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}