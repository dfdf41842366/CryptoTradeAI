import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, MessageCircle, ArrowUp, ArrowDown, Minus } from "lucide-react";

interface RedditSentiment {
  symbol: string;
  mentions: number;
  bullishCount: number;
  bearishCount: number;
  bullishPercentage: number;
  bearishPercentage: number;
  averageScore: number;
  topPosts: Array<{
    id: string;
    title: string;
    score: number;
    num_comments: number;
    author: string;
    upvote_ratio: number;
  }>;
  momentum: 'rising' | 'falling' | 'stable';
  retailInterest: 'high' | 'medium' | 'low';
}

interface WSBTrending {
  symbol: string;
  mentions: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  score: number;
}

interface RedditSentimentProps {
  symbol?: string;
}

export function RedditSentiment({ symbol }: RedditSentimentProps) {
  const { data: trending, isLoading: trendingLoading } = useQuery<WSBTrending[]>({
    queryKey: ['/api/reddit/trending'],
    refetchInterval: 300000 // 5 minutes
  });

  const { data: symbolSentiment, isLoading: symbolLoading } = useQuery<RedditSentiment>({
    queryKey: ['/api/reddit/sentiment', symbol],
    enabled: !!symbol,
    refetchInterval: 300000
  });

  const getMomentumIcon = (momentum: string) => {
    switch (momentum) {
      case 'rising': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'falling': return <TrendingDown className="h-4 w-4 text-red-400" />;
      default: return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-400 bg-green-900/20 border-green-800';
      case 'bearish': return 'text-red-400 bg-red-900/20 border-red-800';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-800';
    }
  };

  const getInterestColor = (interest: string) => {
    switch (interest) {
      case 'high': return 'text-red-400 bg-red-900/20 border-red-800';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-800';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* WallStreetBets Trending */}
      <Card className="bg-[var(--trading-slate)] border-gray-700">
        <CardHeader className="border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">r/</span>
            </div>
            <h2 className="text-lg font-semibold text-white">WallStreetBets Trending</h2>
            <Badge variant="outline" className="text-orange-400 border-orange-400">
              Live
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {trendingLoading ? (
            <div className="animate-pulse">
              <div className="grid grid-cols-4 gap-2">
                {[1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} className="h-16 bg-gray-800 rounded"></div>
                ))}
              </div>
            </div>
          ) : trending && trending.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trending.slice(0, 8).map((item, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-3 text-center">
                  <div className="font-bold text-white text-lg">${item.symbol}</div>
                  <div className="text-sm text-gray-400">{item.mentions} mentions</div>
                  <Badge className={`mt-1 ${getSentimentColor(item.sentiment)}`}>
                    {item.sentiment}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-center py-4">
              Reddit data unavailable
            </div>
          )}
        </CardContent>
      </Card>

      {/* Symbol-Specific Reddit Sentiment */}
      {symbol && (
        <Card className="bg-[var(--trading-slate)] border-gray-700">
          <CardHeader className="border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-orange-400" />
              <h2 className="text-lg font-semibold text-white">${symbol} Reddit Sentiment</h2>
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">r/</span>
              </div>
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
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {symbolSentiment.mentions}
                    </div>
                    <div className="text-gray-400 text-sm">Mentions</div>
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
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {symbolSentiment.averageScore.toFixed(0)}
                    </div>
                    <div className="text-blue-300 text-sm">Avg Score</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getMomentumIcon(symbolSentiment.momentum)}
                    <span className="text-white text-sm">Momentum: {symbolSentiment.momentum}</span>
                  </div>
                  <Badge className={getInterestColor(symbolSentiment.retailInterest)}>
                    {symbolSentiment.retailInterest} retail interest
                  </Badge>
                </div>

                {symbolSentiment.topPosts.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-white font-medium text-sm">Top WSB Posts</h3>
                    {symbolSentiment.topPosts.slice(0, 3).map((post, index) => (
                      <div key={index} className="bg-gray-800 rounded-lg p-3">
                        <div className="text-gray-300 text-sm mb-2 font-medium">
                          {post.title.length > 80 ? post.title.substring(0, 80) + '...' : post.title}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>u/{post.author}</span>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <ArrowUp className="h-3 w-3" />
                              <span>{post.score}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="h-3 w-3" />
                              <span>{post.num_comments}</span>
                            </div>
                            <span>{(post.upvote_ratio * 100).toFixed(0)}% upvoted</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8">
                No Reddit data available for ${symbol}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}