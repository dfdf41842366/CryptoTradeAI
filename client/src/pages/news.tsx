import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LivePrice } from "@/components/LivePrice";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Analytics } from "@shared/schema";
import { Newspaper, ExternalLink, Search, Filter, TrendingUp, Clock, Eye } from "lucide-react";

interface NewsArticle {
  id: string;
  headline: string;
  summary: string;
  source: string;
  publishedAt: Date;
  category: 'breaking' | 'earnings' | 'analyst' | 'market' | 'sector';
  sentiment: 'bullish' | 'bearish' | 'neutral';
  relevantSymbols: string[];
  readTime: number;
  views: number;
  url: string;
  imageUrl?: string;
}

export function NewsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('all');

  const { data: analytics } = useQuery<Analytics>({
    queryKey: ['/api/analytics'],
  });

  const { data: newsArticles, isLoading } = useQuery<NewsArticle[]>({
    queryKey: ['/api/news/financial'],
    staleTime: 300000, // 5 minutes
    refetchInterval: 300000
  });

  const mockNews: NewsArticle[] = [
    {
      id: '1',
      headline: 'Tesla Q4 Earnings Beat Expectations as EV Demand Surges',
      summary: 'Tesla reported Q4 earnings that exceeded analyst expectations, driven by strong EV demand and improved manufacturing efficiency. Revenue grew 15% YoY.',
      source: 'Bloomberg',
      publishedAt: new Date(Date.now() - 900000),
      category: 'earnings',
      sentiment: 'bullish',
      relevantSymbols: ['TSLA'],
      readTime: 3,
      views: 12543,
      url: '#'
    },
    {
      id: '2',
      headline: 'Federal Reserve Signals Potential Rate Cut in March Meeting',
      summary: 'Fed officials hint at possible interest rate reduction following recent inflation data, which could benefit growth stocks and technology sector.',
      source: 'Reuters',
      publishedAt: new Date(Date.now() - 1800000),
      category: 'market',
      sentiment: 'bullish',
      relevantSymbols: ['SPY', 'QQQ', 'NVDA', 'AAPL'],
      readTime: 4,
      views: 8721,
      url: '#'
    },
    {
      id: '3',
      headline: 'NVIDIA Faces New AI Chip Export Restrictions to China',
      summary: 'The Biden administration announced additional restrictions on AI chip exports to China, potentially impacting NVIDIA\'s revenue from the region.',
      source: 'Wall Street Journal',
      publishedAt: new Date(Date.now() - 2700000),
      category: 'breaking',
      sentiment: 'bearish',
      relevantSymbols: ['NVDA', 'AMD'],
      readTime: 5,
      views: 15234,
      url: '#'
    },
    {
      id: '4',
      headline: 'Apple Announces $10B Share Buyback Program',
      summary: 'Apple board approves additional $10 billion share repurchase program, signaling confidence in future cash flow and commitment to shareholder returns.',
      source: 'CNBC',
      publishedAt: new Date(Date.now() - 3600000),
      category: 'analyst',
      sentiment: 'bullish',
      relevantSymbols: ['AAPL'],
      readTime: 2,
      views: 9876,
      url: '#'
    },
    {
      id: '5',
      headline: 'Renewable Energy Stocks Rally on New Climate Policy',
      summary: 'Clean energy sector sees broad gains following announcement of new federal renewable energy incentives and tax credits.',
      source: 'MarketWatch',
      publishedAt: new Date(Date.now() - 5400000),
      category: 'sector',
      sentiment: 'bullish',
      relevantSymbols: ['ENPH', 'SEDG', 'NEE'],
      readTime: 3,
      views: 5432,
      url: '#'
    }
  ];

  const getCategoryColor = (category: NewsArticle['category']) => {
    switch (category) {
      case 'breaking': return 'text-red-400 bg-red-900/20 border-red-800';
      case 'earnings': return 'text-green-400 bg-green-900/20 border-green-800';
      case 'analyst': return 'text-blue-400 bg-blue-900/20 border-blue-800';
      case 'market': return 'text-purple-400 bg-purple-900/20 border-purple-800';
      case 'sector': return 'text-yellow-400 bg-yellow-900/20 border-yellow-800';
    }
  };

  const getSentimentColor = (sentiment: NewsArticle['sentiment']) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-400 bg-green-900/20 border-green-800';
      case 'bearish': return 'text-red-400 bg-red-900/20 border-red-800';
      case 'neutral': return 'text-gray-400 bg-gray-900/20 border-gray-800';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const filteredNews = mockNews.filter(article => {
    const matchesSearch = searchQuery === '' || 
      article.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.relevantSymbols.some(symbol => symbol.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSentiment = selectedSentiment === 'all' || article.sentiment === selectedSentiment;
    
    return matchesSearch && matchesCategory && matchesSentiment;
  });

  return (
    <div className="min-h-screen bg-[var(--trading-dark)]">
      <Header analytics={analytics} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-64">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Financial News</h1>
                <p className="text-gray-400">Stay updated with latest market news and analysis</p>
              </div>
              <Badge variant="outline" className="text-green-400 border-green-400">
                Live Updates
              </Badge>
            </div>

            {/* News Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Newspaper className="h-4 w-4 text-blue-400" />
                    <div>
                      <div className="text-2xl font-bold text-blue-400">{mockNews.length}</div>
                      <div className="text-sm text-gray-400">Articles Today</div>
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
                        {mockNews.filter(n => n.sentiment === 'bullish').length}
                      </div>
                      <div className="text-sm text-gray-400">Bullish</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-red-400" />
                    <div>
                      <div className="text-2xl font-bold text-red-400">
                        {mockNews.filter(n => n.category === 'breaking').length}
                      </div>
                      <div className="text-sm text-gray-400">Breaking</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-purple-400" />
                    <div>
                      <div className="text-2xl font-bold text-purple-400">
                        {mockNews.reduce((sum, n) => sum + n.views, 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">Total Views</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card className="bg-[var(--trading-slate)] border-gray-700">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search news, symbols, or keywords..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-600"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <div className="flex items-center space-x-1">
                      <Filter className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400 text-sm">Category:</span>
                    </div>
                    <div className="flex space-x-1">
                      {['all', 'breaking', 'earnings', 'analyst', 'market', 'sector'].map((category) => (
                        <Button
                          key={category}
                          size="sm"
                          variant={selectedCategory === category ? "default" : "outline"}
                          onClick={() => setSelectedCategory(category)}
                          className={selectedCategory === category ? "bg-blue-600" : ""}
                        >
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <span className="text-gray-400 text-sm">Sentiment:</span>
                    <div className="flex space-x-1">
                      {['all', 'bullish', 'bearish', 'neutral'].map((sentiment) => (
                        <Button
                          key={sentiment}
                          size="sm"
                          variant={selectedSentiment === sentiment ? "default" : "outline"}
                          onClick={() => setSelectedSentiment(sentiment)}
                          className={selectedSentiment === sentiment ? "bg-blue-600" : ""}
                        >
                          {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* News Articles */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1,2,3,4,5].map(i => (
                    <Card key={i} className="bg-[var(--trading-slate)] border-gray-700 animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-800 rounded w-full mb-4"></div>
                        <div className="flex space-x-2">
                          <div className="h-6 bg-gray-800 rounded w-16"></div>
                          <div className="h-6 bg-gray-800 rounded w-20"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                filteredNews.map((article) => (
                  <Card key={article.id} className="bg-[var(--trading-slate)] border-gray-700 hover:border-gray-600 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-2">
                          <Badge className={getCategoryColor(article.category)}>
                            {article.category.toUpperCase()}
                          </Badge>
                          <Badge className={getSentimentColor(article.sentiment)}>
                            {article.sentiment.toUpperCase()}
                          </Badge>
                          <span className="text-gray-400 text-sm">•</span>
                          <span className="text-gray-400 text-sm">{article.source}</span>
                          <span className="text-gray-400 text-sm">•</span>
                          <span className="text-gray-400 text-sm">{formatTimeAgo(article.publishedAt)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-gray-400 text-sm">
                          <Clock className="h-3 w-3" />
                          <span>{article.readTime}m read</span>
                          <span>•</span>
                          <Eye className="h-3 w-3" />
                          <span>{article.views.toLocaleString()} views</span>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-white mb-2 hover:text-blue-400 cursor-pointer">
                        {article.headline}
                      </h3>
                      
                      <p className="text-gray-300 mb-4 line-clamp-2">
                        {article.summary}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400 text-sm">Symbols:</span>
                          {article.relevantSymbols.map((symbol, index) => (
                            <div key={index} className="flex items-center space-x-1">
                              <Badge variant="outline" size="sm" className="text-blue-400 border-blue-400">
                                ${symbol}
                              </Badge>
                              <LivePrice symbol={symbol} showLabel={false} className="text-gray-400 text-xs" />
                            </div>
                          ))}
                        </div>
                        
                        <Button size="sm" variant="outline" className="text-blue-400 border-blue-400 hover:bg-blue-900/20">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Read More
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {filteredNews.length === 0 && !isLoading && (
              <Card className="bg-[var(--trading-slate)] border-gray-700">
                <CardContent className="p-8 text-center">
                  <Newspaper className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-white font-medium mb-2">No articles found</h3>
                  <p className="text-gray-400">Try adjusting your search or filter criteria</p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}