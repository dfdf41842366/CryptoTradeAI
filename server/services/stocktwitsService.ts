import axios from 'axios';

export interface StockTwitsMessage {
  id: number;
  body: string;
  created_at: string;
  user: {
    id: number;
    username: string;
    name: string;
    followers: number;
  };
  symbols?: {
    id: number;
    symbol: string;
    title: string;
  }[];
  sentiment?: {
    basic: 'Bullish' | 'Bearish';
  };
  likes: {
    total: number;
  };
}

export interface StockTwitsSentiment {
  symbol: string;
  bullishCount: number;
  bearishCount: number;
  totalMessages: number;
  bullishPercentage: number;
  bearishPercentage: number;
  influencerSentiment: 'Bullish' | 'Bearish' | 'Neutral';
  topMessages: StockTwitsMessage[];
  volumeScore: number; // Based on message frequency
}

export class StockTwitsService {
  private baseUrl = 'https://api.stocktwits.com/api/2';
  private apiKey?: string;

  constructor() {
    // StockTwits API can be used without authentication for basic endpoints
    // But requires authentication for higher rate limits
    this.apiKey = process.env.STOCKTWITS_API_KEY;
  }

  async getSymbolSentiment(symbol: string): Promise<StockTwitsSentiment> {
    try {
      const messagesUrl = `${this.baseUrl}/streams/symbol/${symbol}.json`;
      const params: any = { limit: 30 };
      
      if (this.apiKey) {
        params.access_token = this.apiKey;
      }

      const response = await axios.get(messagesUrl, {
        params,
        timeout: 10000,
        headers: {
          'User-Agent': 'AI-Trading-Platform/1.0'
        }
      });

      const messages: StockTwitsMessage[] = response.data.messages || [];
      
      return this.analyzeSentiment(symbol, messages);
    } catch (error) {
      console.warn(`StockTwits API error for ${symbol}:`, error.message);
      
      // Return neutral sentiment if API fails
      return {
        symbol,
        bullishCount: 0,
        bearishCount: 0,
        totalMessages: 0,
        bullishPercentage: 50,
        bearishPercentage: 50,
        influencerSentiment: 'Neutral',
        topMessages: [],
        volumeScore: 0
      };
    }
  }

  async getTrendingSymbols(): Promise<string[]> {
    try {
      const url = `${this.baseUrl}/trending/symbols.json`;
      const params: any = {};
      
      if (this.apiKey) {
        params.access_token = this.apiKey;
      }

      const response = await axios.get(url, {
        params,
        timeout: 10000,
        headers: {
          'User-Agent': 'AI-Trading-Platform/1.0'
        }
      });

      return response.data.symbols?.map((s: any) => s.symbol) || [];
    } catch (error) {
      console.warn('StockTwits trending symbols error:', error.message);
      return [];
    }
  }

  async getBulkSentiment(symbols: string[]): Promise<StockTwitsSentiment[]> {
    // Process symbols in parallel but limit concurrent requests
    const results = await Promise.allSettled(
      symbols.map(symbol => this.getSymbolSentiment(symbol))
    );

    return results
      .filter((result): result is PromiseFulfilledResult<StockTwitsSentiment> => 
        result.status === 'fulfilled')
      .map(result => result.value);
  }

  private analyzeSentiment(symbol: string, messages: StockTwitsMessage[]): StockTwitsSentiment {
    let bullishCount = 0;
    let bearishCount = 0;
    let influencerBullish = 0;
    let influencerBearish = 0;
    
    const topMessages = messages
      .filter(msg => msg.sentiment?.basic)
      .sort((a, b) => b.likes.total - a.likes.total)
      .slice(0, 5);

    messages.forEach(message => {
      if (message.sentiment?.basic === 'Bullish') {
        bullishCount++;
        // Weight influencer opinions more heavily (users with >1000 followers)
        if (message.user.followers > 1000) {
          influencerBullish += 2;
        }
      } else if (message.sentiment?.basic === 'Bearish') {
        bearishCount++;
        if (message.user.followers > 1000) {
          influencerBearish += 2;
        }
      }
    });

    const totalSentimentMessages = bullishCount + bearishCount;
    const bullishPercentage = totalSentimentMessages > 0 ? 
      (bullishCount / totalSentimentMessages) * 100 : 50;
    const bearishPercentage = 100 - bullishPercentage;

    // Determine influencer sentiment
    let influencerSentiment: 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral';
    if (influencerBullish > influencerBearish * 1.5) {
      influencerSentiment = 'Bullish';
    } else if (influencerBearish > influencerBullish * 1.5) {
      influencerSentiment = 'Bearish';
    }

    // Calculate volume score based on message frequency
    const volumeScore = Math.min(100, (messages.length / 30) * 100);

    return {
      symbol,
      bullishCount,
      bearishCount,
      totalMessages: messages.length,
      bullishPercentage,
      bearishPercentage,
      influencerSentiment,
      topMessages,
      volumeScore
    };
  }

  // Get real-time social sentiment overview for market
  async getMarketSocialSentiment(): Promise<{
    overallBullish: number;
    overallBearish: number;
    trendingSymbols: string[];
    marketMood: 'Bullish' | 'Bearish' | 'Neutral';
    activeDiscussions: number;
  }> {
    try {
      const trendingSymbols = await this.getTrendingSymbols();
      const topSymbols = trendingSymbols.slice(0, 10);
      
      if (topSymbols.length === 0) {
        return {
          overallBullish: 50,
          overallBearish: 50,
          trendingSymbols: [],
          marketMood: 'Neutral',
          activeDiscussions: 0
        };
      }

      const sentiments = await this.getBulkSentiment(topSymbols);
      
      let totalBullish = 0;
      let totalBearish = 0;
      let totalMessages = 0;

      sentiments.forEach(sentiment => {
        totalBullish += sentiment.bullishCount;
        totalBearish += sentiment.bearishCount;
        totalMessages += sentiment.totalMessages;
      });

      const totalSentiment = totalBullish + totalBearish;
      const overallBullish = totalSentiment > 0 ? (totalBullish / totalSentiment) * 100 : 50;
      const overallBearish = 100 - overallBullish;

      let marketMood: 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral';
      if (overallBullish > 60) marketMood = 'Bullish';
      else if (overallBearish > 60) marketMood = 'Bearish';

      return {
        overallBullish,
        overallBearish,
        trendingSymbols: topSymbols,
        marketMood,
        activeDiscussions: totalMessages
      };
    } catch (error) {
      console.warn('StockTwits market sentiment error:', error.message);
      return {
        overallBullish: 50,
        overallBearish: 50,
        trendingSymbols: [],
        marketMood: 'Neutral',
        activeDiscussions: 0
      };
    }
  }

  // Check if API is working
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/streams/symbol/AAPL.json`, {
        params: { limit: 1 },
        timeout: 5000,
        headers: {
          'User-Agent': 'AI-Trading-Platform/1.0'
        }
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

export const stocktwitsService = new StockTwitsService();