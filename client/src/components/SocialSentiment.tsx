import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, MessageCircle, Hash } from "lucide-react";

interface StockTwitsSentiment {
  symbol: string;
  bullishCount: number;
  bearishCount: number;
  totalMessages: number;
  bullishPercentage: number;
  bearishPercentage: number;
  influencerSentiment: 'Bullish' | 'Bearish' | 'Neutral';
  topMessages: Array<{
    id: number;
    body: string;
    user: {
      username: string;
      followers: number;
    };
    likes: {
      total: number;
    };
  }>;
  volumeScore: number;
}

interface MarketMood {
  overallBullish: number;
  overallBearish: number;
  trendingSymbols: string[];
  marketMood: 'Bullish' | 'Bearish' | 'Neutral';
  activeDiscussions: number;
}

interface SocialSentimentProps {
  symbol?: string;
}

export function SocialSentiment({ symbol }: SocialSentimentProps) {
  const { data: marketMood, isLoading: moodLoading } = useQuery<MarketMood>({
    queryKey: ['/api/social/market-mood'],
    refetchInterval: 60000 // Refresh every minute
  });

  const { data: symbolSentiment, isLoading: symbolLoading } = useQuery<StockTwitsSentiment>({
    queryKey: ['/api/social/sentiment', symbol],
    enabled: !!symbol,
    refetchInterval: 30000
  });

  const { data: trending, isLoading: trendingLoading } = useQuery<string[]>({
    queryKey: ['/api/social/trending'],
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Bullish': return 'text-green-400 bg-green-900/20 border-green-800';
      case 'Bearish': return 'text-red-400 bg-red-900/20 border-red-800';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-800';
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'Bullish': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'Bearish': return <TrendingDown className="h-4 w-4 text-red-400" />;
      default: return <MessageCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Market Social Mood */}
      <Card className="bg-[var(--trading-slate)] border-gray-700">
        <CardHeader className="border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Social Market Mood</h2>
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              StockTwits
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {moodLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-800 rounded w-3/4"></div>
              <div className="h-8 bg-gray-800 rounded"></div>
            </div>
          ) : marketMood ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getMoodIcon(marketMood.marketMood)}
                  <span className="text-white font-medium">Overall: {marketMood.marketMood}</span>
                </div>
                <div className="text-gray-400 text-sm">
                  {marketMood.activeDiscussions} active discussions
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-900/20 border border-green-800 rounded-lg p-3">
                  <div className="text-green-400 text-2xl font-bold">
                    {marketMood.overallBullish.toFixed(1)}%
                  </div>
                  <div className="text-green-300 text-sm">Bullish Sentiment</div>
                </div>
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                  <div className="text-red-400 text-2xl font-bold">
                    {marketMood.overallBearish.toFixed(1)}%
                  </div>
                  <div className="text-red-300 text-sm">Bearish Sentiment</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-center py-8">
              Social sentiment data unavailable
            </div>
          )}
        </CardContent>
      </Card>

      {/* Symbol-Specific Sentiment */}
      {symbol && (
        <Card className="bg-[var(--trading-slate)] border-gray-700">
          <CardHeader className="border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <Hash className="h-5 w-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">${symbol} Social Sentiment</h2>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {symbolLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                <div className="h-20 bg-gray-800 rounded"></div>
              </div>
            ) : symbolSentiment ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {symbolSentiment.totalMessages}
                    </div>
                    <div className="text-gray-400 text-sm">Messages</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {symbolSentiment.bullishPercentage.toFixed(1)}%
                    </div>
                    <div className="text-green-300 text-sm">Bullish</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">
                      {symbolSentiment.bearishPercentage.toFixed(1)}%
                    </div>
                    <div className="text-red-300 text-sm">Bearish</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge className={getSentimentColor(symbolSentiment.influencerSentiment)}>
                    Influencer: {symbolSentiment.influencerSentiment}
                  </Badge>
                  <div className="text-gray-400 text-sm">
                    Volume Score: {symbolSentiment.volumeScore}/100
                  </div>
                </div>

                {symbolSentiment.topMessages.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-white font-medium text-sm">Top Messages</h3>
                    {symbolSentiment.topMessages.slice(0, 3).map((message, index) => (
                      <div key={index} className="bg-gray-800 rounded-lg p-3">
                        <div className="text-gray-300 text-sm mb-1">
                          {message.body.substring(0, 120)}...
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>@{message.user.username}</span>
                          <div className="flex items-center space-x-2">
                            <span>{message.user.followers} followers</span>
                            <span>{message.likes.total} likes</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8">
                No social data available for ${symbol}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Trending Symbols */}
      <Card className="bg-[var(--trading-slate)] border-gray-700">
        <CardHeader className="border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-yellow-400" />
            <h2 className="text-lg font-semibold text-white">Trending on StockTwits</h2>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {trendingLoading ? (
            <div className="animate-pulse">
              <div className="grid grid-cols-5 gap-2">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-8 bg-gray-800 rounded"></div>
                ))}
              </div>
            </div>
          ) : trending && trending.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {trending.slice(0, 10).map((symbol, index) => (
                <Badge key={index} variant="outline" className="text-yellow-400 border-yellow-400">
                  ${symbol}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-center py-4">
              Trending symbols unavailable
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}