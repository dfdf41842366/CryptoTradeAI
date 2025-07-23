import { multiSourceMarketDataService as marketDataService } from './multiSourceMarketData';
import { stocktwitsService } from './stocktwitsService';
import { redditService } from './redditService';

export interface SentimentData {
  symbol: string;
  overallSentiment: number; // -100 to 100
  newsCount: number;
  socialMentions: number;
  bullishPercentage: number;
  bearishPercentage: number;
  keyNewsHeadlines: string[];
  unusualOptionsActivity: boolean;
  institutionalFlow: 'bullish' | 'bearish' | 'neutral';
  socialSentiment?: {
    platform: 'StockTwits';
    bullishPercentage: number;
    bearishPercentage: number;
    influencerSentiment: 'Bullish' | 'Bearish' | 'Neutral';
    volumeScore: number;
    topMessages: string[];
  };
  redditSentiment?: {
    platform: 'Reddit';
    mentions: number;
    bullishPercentage: number;
    bearishPercentage: number;
    momentum: 'rising' | 'falling' | 'stable';
    retailInterest: 'high' | 'medium' | 'low';
    topPosts: string[];
  };
}

export class SentimentEngine {
  private sentimentCache: Map<string, SentimentData> = new Map();
  private lastUpdate = 0;

  async getSentimentForSymbols(symbols: string[]): Promise<SentimentData[]> {
    const results: SentimentData[] = [];
    
    for (const symbol of symbols) {
      try {
        // Get recent news for sentiment analysis
        const news = await marketDataService.getFinancialNews(symbol);
        
        const sentimentData: SentimentData = {
          symbol,
          overallSentiment: this.calculateSentimentScore(news),
          newsCount: news.length,
          socialMentions: null, // ❌ FAKE DATA DISABLED: Must use authentic social APIs
          bullishPercentage: null, // ❌ FAKE DATA DISABLED: Must use authentic sentiment APIs
          bearishPercentage: null, // ❌ FAKE DATA DISABLED: Must use authentic sentiment APIs
          keyNewsHeadlines: news.slice(0, 3).map(n => n.headline || n.title || 'Market Update').filter(Boolean),
          unusualOptionsActivity: false, // ❌ FAKE DATA DISABLED: Must use authentic options activity APIs
          institutionalFlow: 'neutral' // ❌ FAKE DATA DISABLED: Must use authentic institutional flow APIs
        };

        results.push(sentimentData);
        this.sentimentCache.set(symbol, sentimentData);
      } catch (error) {
        console.error(`Error getting sentiment for ${symbol}:`, error);
      }
    }

    return results;
  }

  private calculateSentimentScore(news: any[]): number {
    if (!news.length) return 0;
    
    // Simple sentiment scoring based on keywords
    let score = 0;
    const positiveWords = ['buy', 'bull', 'up', 'rise', 'gain', 'strong', 'beat', 'exceed', 'growth'];
    const negativeWords = ['sell', 'bear', 'down', 'fall', 'loss', 'weak', 'miss', 'decline', 'cut'];
    
    news.forEach(article => {
      const text = (article.headline || article.title || '').toLowerCase();
      positiveWords.forEach(word => {
        if (text.includes(word)) score += 10;
      });
      negativeWords.forEach(word => {
        if (text.includes(word)) score -= 10;
      });
    });
    
    return Math.max(-100, Math.min(100, score));
  }

  private simulateSocialMentions(): number {
    // ❌ FAKE DATA DISABLED: Must use authentic social media APIs
    console.error('❌ FAKE SOCIAL DATA BLOCKED: simulateSocialMentions called');
    throw new Error('NO FAKE SOCIAL DATA: Must use authentic social media APIs for real mentions');
  }

  private getRandomFlow(): 'bullish' | 'bearish' | 'neutral' {
    // ❌ FAKE DATA DISABLED: Must use authentic institutional flow APIs
    console.error('❌ FAKE FLOW BLOCKED: getRandomFlow called in sentimentEngine');
    throw new Error('NO FAKE FLOW DATA: Must use authentic institutional flow APIs');
  }

  getMarketSentimentOverview(): {
    overallMarket: number;
    fearGreedIndex: number;
    volatilityIndex: number;
    sectorRotation: string;
  } {
    // ❌ FAKE DATA DISABLED: Must use authentic market sentiment APIs
    console.error('❌ FAKE MARKET SENTIMENT BLOCKED: getMarketSentimentOverview called');
    throw new Error('NO FAKE MARKET SENTIMENT: Must use authentic market sentiment APIs like CNN Fear & Greed Index');
  }

  private getCurrentSectorRotation(): string {
    // ❌ FAKE DATA DISABLED: Must use authentic sector rotation APIs
    console.error('❌ FAKE SECTOR ROTATION BLOCKED: getCurrentSectorRotation called');
    throw new Error('NO FAKE SECTOR DATA: Must use authentic sector performance APIs');
  }
}

export const sentimentEngine = new SentimentEngine();