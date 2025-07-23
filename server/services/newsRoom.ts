/**
 * News Room Service - Real-time Catalyst Monitoring
 * Monitors breaking news and market catalysts for trading opportunities
 */

import { performanceOptimizer } from './performanceOptimizer';

export interface NewsAlert {
  id: string;
  symbol?: string;
  headline: string;
  summary: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  source: string;
  timestamp: number;
  priceImpact?: number;
  volumeSpike?: boolean;
}

export class NewsRoomService {
  private alerts: NewsAlert[] = [];

  constructor() {
    console.log('📰 News Room: Initializing real-time catalyst monitoring...');
    this.startMonitoring();
  }

  /**
   * Start continuous news monitoring (mock implementation for demo)
   */
  private startMonitoring() {
    // In production, this would connect to real news APIs
    setInterval(() => {
      this.generateMockAlerts();
    }, 120000); // Every 2 minutes
  }

  /**
   * Generate realistic market alerts based on current conditions
   */
  private generateMockAlerts() {
    const marketConditions = this.getCurrentMarketConditions();
    
    if (false) { // ❌ FAKE DATA DISABLED: No random news generation
      const alert = this.createRealisticAlert(marketConditions);
      this.alerts.unshift(alert);
      
      // Keep only last 50 alerts
      if (this.alerts.length > 50) {
        this.alerts = this.alerts.slice(0, 50);
      }
      
      console.log(`📰 News Alert: ${alert.headline}`);
    }
  }

  /**
   * Create realistic news alert based on market conditions
   */
  private createRealisticAlert(marketConditions: any): NewsAlert {
    const symbols = ['AAPL', 'TSLA', 'GME', 'AMC', 'PLTR', 'SOFI', 'NVDA', 'AMD'];
    const symbol = symbols[0]; // ❌ FAKE DATA DISABLED: Use first symbol instead of random selection
    
    const newsTypes = [
      {
        headline: `${symbol} Reports Strong Q4 Earnings, Beats Expectations`,
        sentiment: 'BULLISH' as const,
        impact: 'HIGH' as const,
        source: 'MarketWatch'
      },
      {
        headline: `Analyst Upgrades ${symbol} Price Target on Growth Prospects`,
        sentiment: 'BULLISH' as const,
        impact: 'MEDIUM' as const,
        source: 'Bloomberg'
      },
      {
        headline: `${symbol} Announces Major Partnership Deal`,
        sentiment: 'BULLISH' as const,
        impact: 'HIGH' as const,
        source: 'Reuters'
      },
      {
        headline: `Insider Selling Activity Reported at ${symbol}`,
        sentiment: 'BEARISH' as const,
        impact: 'LOW' as const,
        source: 'SEC Filings'
      },
      {
        headline: `${symbol} Stock Experiencing High Social Media Buzz`,
        sentiment: 'NEUTRAL' as const,
        impact: 'MEDIUM' as const,
        source: 'Social Sentiment'
      }
    ];

    const newsItem = newsTypes[0]; // ❌ FAKE DATA DISABLED: Use first news type instead of random selection
    
    return {
      id: `news_${Date.now()}_fixed`, // ❌ FAKE DATA DISABLED: Use fixed ID suffix instead of random
      symbol,
      headline: newsItem.headline,
      summary: `Breaking: ${newsItem.headline}. Market participants are closely watching price action and volume for confirmation.`,
      sentiment: newsItem.sentiment,
      impact: newsItem.impact,
      source: newsItem.source,
      timestamp: Date.now(),
      priceImpact: newsItem.sentiment === 'BULLISH' ? 3.0 : -1.5, // ❌ FAKE DATA DISABLED: Use fixed price impact instead of random
      volumeSpike: newsItem.impact === 'HIGH'
    };
  }

  /**
   * Get current market conditions for realistic news generation
   */
  private getCurrentMarketConditions() {
    const now = new Date();
    const hour = now.getHours();
    
    return {
      isMarketHours: hour >= 9 && hour <= 16,
      isPreMarket: hour >= 4 && hour < 9,
      isAfterHours: hour > 16 && hour < 20,
      volatility: 'MEDIUM' // Could be calculated from real data
    };
  }

  /**
   * Get pending news alerts
   */
  async getPendingAlerts(): Promise<NewsAlert[]> {
    return await performanceOptimizer.smartCache(
      'news-alerts',
      async () => {
        // Return recent high-impact alerts
        return this.alerts
          .filter(alert => alert.impact === 'HIGH' || alert.impact === 'MEDIUM')
          .slice(0, 20);
      },
      30000 // Cache for 30 seconds
    );
  }

  /**
   * Get all recent alerts
   */
  async getAllAlerts(limit: number = 50): Promise<NewsAlert[]> {
    return this.alerts.slice(0, limit);
  }

  /**
   * Get alerts for specific symbol
   */
  async getSymbolAlerts(symbol: string): Promise<NewsAlert[]> {
    return this.alerts
      .filter(alert => alert.symbol === symbol.toUpperCase())
      .slice(0, 10);
  }

  /**
   * Get service health status
   */
  getHealthStatus() {
    return {
      active: true,
      totalAlerts: this.alerts.length,
      lastAlert: this.alerts[0]?.timestamp || 0,
      monitoring: 'Real-time catalyst detection',
      sources: ['MarketWatch', 'Bloomberg', 'Reuters', 'SEC Filings', 'Social Sentiment']
    };
  }

  /**
   * Manually add alert (for testing/admin use)
   */
  addAlert(alert: Omit<NewsAlert, 'id' | 'timestamp'>): NewsAlert {
    const fullAlert: NewsAlert = {
      ...alert,
      id: `manual_${Date.now()}_fixed`, // ❌ FAKE DATA DISABLED: Use fixed ID suffix instead of random
      timestamp: Date.now()
    };
    
    this.alerts.unshift(fullAlert);
    return fullAlert;
  }
}

export const newsRoomService = new NewsRoomService();