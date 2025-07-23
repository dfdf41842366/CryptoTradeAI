import axios from 'axios';

export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  score: number;
  num_comments: number;
  created_utc: number;
  author: string;
  upvote_ratio: number;
  url: string;
  subreddit: string;
}

export interface RedditSentiment {
  symbol: string;
  mentions: number;
  bullishCount: number;
  bearishCount: number;
  bullishPercentage: number;
  bearishPercentage: number;
  averageScore: number;
  topPosts: RedditPost[];
  momentum: 'rising' | 'falling' | 'stable';
  retailInterest: 'high' | 'medium' | 'low';
}

export interface WSBTrending {
  symbol: string;
  mentions: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  score: number;
  change24h: number;
}

export class RedditService {
  private clientId: string;
  private clientSecret: string;
  private userAgent: string;
  private accessToken?: string;
  private tokenExpiry?: number;

  constructor() {
    this.clientId = process.env.REDDIT_CLIENT_ID || 'KlutzyInteraction650';
    this.clientSecret = process.env.REDDIT_CLIENT_SECRET || 'rKMJMqGwoiZRIFSrYaRRJwiEi6lacw';
    this.userAgent = 'AI-Trading-Platform/1.0 by Ahmed.taha274';
  }

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios.post('https://www.reddit.com/api/v1/access_token', 
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': this.userAgent
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // Refresh 1 min early
      
      return this.accessToken;
    } catch (error) {
      console.error('Reddit API authentication failed:', error.message);
      throw new Error('Failed to authenticate with Reddit API');
    }
  }

  async getWallStreetBetsPosts(limit: number = 25): Promise<RedditPost[]> {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.get('https://oauth.reddit.com/r/wallstreetbets/hot', {
        params: { limit },
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': this.userAgent
        }
      });

      return response.data.data.children.map((child: any) => ({
        id: child.data.id,
        title: child.data.title,
        selftext: child.data.selftext || '',
        score: child.data.score,
        num_comments: child.data.num_comments,
        created_utc: child.data.created_utc,
        author: child.data.author,
        upvote_ratio: child.data.upvote_ratio,
        url: child.data.url,
        subreddit: child.data.subreddit
      }));
    } catch (error) {
      console.warn('Reddit API error:', error.message);
      return [];
    }
  }

  async getSymbolSentiment(symbol: string): Promise<RedditSentiment> {
    try {
      const posts = await this.getWallStreetBetsPosts(100);
      const symbolRegex = new RegExp(`\\$?${symbol}\\b`, 'gi');
      
      const relevantPosts = posts.filter(post => 
        symbolRegex.test(post.title) || symbolRegex.test(post.selftext)
      );

      if (relevantPosts.length === 0) {
        return {
          symbol,
          mentions: 0,
          bullishCount: 0,
          bearishCount: 0,
          bullishPercentage: 50,
          bearishPercentage: 50,
          averageScore: 0,
          topPosts: [],
          momentum: 'stable',
          retailInterest: 'low'
        };
      }

      const { bullish, bearish } = this.analyzeSentiment(relevantPosts);
      const totalSentiment = bullish + bearish;
      const bullishPercentage = totalSentiment > 0 ? (bullish / totalSentiment) * 100 : 50;
      const bearishPercentage = 100 - bullishPercentage;
      
      const averageScore = relevantPosts.reduce((sum, post) => sum + post.score, 0) / relevantPosts.length;
      const topPosts = relevantPosts
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      // Determine momentum based on recent posts vs older posts
      const now = Date.now() / 1000;
      const recent = relevantPosts.filter(p => (now - p.created_utc) < 86400); // Last 24h
      const momentum = this.calculateMomentum(recent, relevantPosts);

      // Determine retail interest based on mentions and engagement
      const retailInterest = this.calculateRetailInterest(relevantPosts.length, averageScore);

      return {
        symbol,
        mentions: relevantPosts.length,
        bullishCount: bullish,
        bearishCount: bearish,
        bullishPercentage,
        bearishPercentage,
        averageScore,
        topPosts,
        momentum,
        retailInterest
      };
    } catch (error) {
      console.error(`Reddit sentiment error for ${symbol}:`, error);
      return {
        symbol,
        mentions: 0,
        bullishCount: 0,
        bearishCount: 0,
        bullishPercentage: 50,
        bearishPercentage: 50,
        averageScore: 0,
        topPosts: [],
        momentum: 'stable',
        retailInterest: 'low'
      };
    }
  }

  async getTrendingSymbols(): Promise<WSBTrending[]> {
    try {
      const posts = await this.getWallStreetBetsPosts(100);
      const symbolCounts = new Map<string, { mentions: number; totalScore: number; posts: RedditPost[] }>();
      
      // Common stock symbols to look for
      const stockSymbols = ['AAPL', 'TSLA', 'NVDA', 'AMD', 'GME', 'AMC', 'MSFT', 'GOOGL', 'AMZN', 'META', 'SPY', 'QQQ', 'IWM', 'PLTR', 'RIVN', 'LCID', 'SOXL', 'NFLX', 'UBER'];
      
      posts.forEach(post => {
        stockSymbols.forEach(symbol => {
          const regex = new RegExp(`\\$?${symbol}\\b`, 'gi');
          const titleMatches = (post.title.match(regex) || []).length;
          const textMatches = (post.selftext.match(regex) || []).length;
          const totalMatches = titleMatches + textMatches;
          
          if (totalMatches > 0) {
            if (!symbolCounts.has(symbol)) {
              symbolCounts.set(symbol, { mentions: 0, totalScore: 0, posts: [] });
            }
            const data = symbolCounts.get(symbol)!;
            data.mentions += totalMatches;
            data.totalScore += post.score;
            data.posts.push(post);
          }
        });
      });

      const trending: WSBTrending[] = Array.from(symbolCounts.entries())
        .filter(([symbol, data]) => data.mentions >= 2) // At least 2 mentions
        .map(([symbol, data]) => {
          const { bullish, bearish } = this.analyzeSentiment(data.posts);
          const totalSentiment = bullish + bearish;
          let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
          
          if (totalSentiment > 0) {
            const bullishPercentage = (bullish / totalSentiment) * 100;
            if (bullishPercentage > 60) sentiment = 'bullish';
            else if (bullishPercentage < 40) sentiment = 'bearish';
          }

          return {
            symbol,
            mentions: data.mentions,
            sentiment,
            score: data.totalScore / data.posts.length,
            change24h: 0 // Would need historical data to calculate
          };
        })
        .sort((a, b) => b.mentions - a.mentions)
        .slice(0, 20);

      return trending;
    } catch (error) {
      console.error('Reddit trending symbols error:', error);
      return [];
    }
  }

  private analyzeSentiment(posts: RedditPost[]): { bullish: number; bearish: number } {
    let bullish = 0;
    let bearish = 0;

    const bullishKeywords = ['moon', 'rocket', 'buy', 'calls', 'bull', 'up', 'green', 'diamond hands', 'hold', 'hodl', 'yolo', 'to the moon', '🚀', '💎', '📈'];
    const bearishKeywords = ['puts', 'short', 'bear', 'down', 'red', 'sell', 'dump', 'crash', 'drop', 'fall', '📉', '🐻'];

    posts.forEach(post => {
      const text = (post.title + ' ' + post.selftext).toLowerCase();
      
      let bullishScore = 0;
      let bearishScore = 0;
      
      bullishKeywords.forEach(keyword => {
        const matches = (text.match(new RegExp(keyword, 'g')) || []).length;
        bullishScore += matches;
      });
      
      bearishKeywords.forEach(keyword => {
        const matches = (text.match(new RegExp(keyword, 'g')) || []).length;
        bearishScore += matches;
      });

      // Weight by post engagement
      const weight = Math.min(3, Math.max(1, post.score / 100));
      
      if (bullishScore > bearishScore) {
        bullish += weight;
      } else if (bearishScore > bullishScore) {
        bearish += weight;
      }
    });

    return { bullish, bearish };
  }

  private calculateMomentum(recentPosts: RedditPost[], allPosts: RedditPost[]): 'rising' | 'falling' | 'stable' {
    if (allPosts.length < 5) return 'stable';
    
    const recentRatio = recentPosts.length / allPosts.length;
    if (recentRatio > 0.6) return 'rising';
    if (recentRatio < 0.3) return 'falling';
    return 'stable';
  }

  private calculateRetailInterest(mentions: number, averageScore: number): 'high' | 'medium' | 'low' {
    const interestScore = mentions * Math.log(averageScore + 1);
    if (interestScore > 50) return 'high';
    if (interestScore > 15) return 'medium';
    return 'low';
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.getAccessToken();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const redditService = new RedditService();