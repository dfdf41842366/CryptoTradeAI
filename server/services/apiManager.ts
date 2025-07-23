import { performanceOptimizer } from './performanceOptimizer';

export interface APIConfig {
  name: string;
  key: string | null;
  endpoint: string;
  status: 'active' | 'inactive' | 'error' | 'rate_limited';
  priority: 'essential' | 'optional' | 'fallback';
  rateLimitPerMinute: number;
  rateLimitPerHour: number;
  currentMinuteUsage: number;
  currentHourUsage: number;
  lastUsed: number;
  errorCount: number;
  successCount: number;
  avgResponseTime: number;
  lastError?: string;
  description: string;
  category: 'market_data' | 'ai_analysis' | 'news' | 'notifications' | 'utilities';
}

export class APIManager {
  private apis: Map<string, APIConfig> = new Map();
  private rateLimitResetTimes = new Map<string, { minute: number; hour: number }>();

  constructor() {
    this.initializeAPIs();
    this.startRateLimitReset();
    this.startHealthMonitoring();
  }

  private initializeAPIs() {
    const defaultAPIs: APIConfig[] = [
      // ESSENTIAL APIs
      {
        name: 'Yahoo Finance',
        key: null, // No key required
        endpoint: 'https://query1.finance.yahoo.com',
        status: 'active',
        priority: 'essential',
        rateLimitPerMinute: 60,
        rateLimitPerHour: 2000,
        currentMinuteUsage: 0,
        currentHourUsage: 0,
        lastUsed: 0,
        errorCount: 0,
        successCount: 0,
        avgResponseTime: 0,
        description: 'Primary market data source - free real-time quotes',
        category: 'market_data'
      },
      {
        name: 'OpenAI GPT-4o',
        key: process.env.OPENAI_API_KEY || null,
        endpoint: 'https://api.openai.com/v1',
        status: process.env.OPENAI_API_KEY ? 'active' : 'inactive',
        priority: 'essential',
        rateLimitPerMinute: 3,
        rateLimitPerHour: 500,
        currentMinuteUsage: 0,
        currentHourUsage: 0,
        lastUsed: 0,
        errorCount: 0,
        successCount: 0,
        avgResponseTime: 0,
        description: 'AI analysis engine for trading signals and ARIA intelligence',
        category: 'ai_analysis'
      },
      {
        name: 'Finnhub Stock API',
        key: process.env.FINNHUB_API_KEY || null,
        endpoint: 'https://finnhub.io/api/v1',
        status: process.env.FINNHUB_API_KEY ? 'active' : 'inactive',
        priority: 'essential',
        rateLimitPerMinute: 60,
        rateLimitPerHour: 3000,
        currentMinuteUsage: 0,
        currentHourUsage: 0,
        lastUsed: 0,
        errorCount: 0,
        successCount: 0,
        avgResponseTime: 0,
        description: 'Professional market data with real-time quotes and fundamentals',
        category: 'market_data'
      },
      
      // OPTIONAL APIs
      {
        name: 'Alpha Vantage',
        key: process.env.ALPHA_VANTAGE_API_KEY || null,
        endpoint: 'https://www.alphavantage.co/query',
        status: process.env.ALPHA_VANTAGE_API_KEY ? 'active' : 'inactive',
        priority: 'optional',
        rateLimitPerMinute: 5,
        rateLimitPerHour: 500,
        currentMinuteUsage: 0,
        currentHourUsage: 0,
        lastUsed: 0,
        errorCount: 0,
        successCount: 0,
        avgResponseTime: 0,
        description: 'Technical indicators and fundamental data',
        category: 'market_data'
      },
      {
        name: 'News API',
        key: process.env.NEWS_API_KEY || null,
        endpoint: 'https://newsapi.org/v2',
        status: process.env.NEWS_API_KEY ? 'active' : 'inactive',
        priority: 'optional',
        rateLimitPerMinute: 50,
        rateLimitPerHour: 1000,
        currentMinuteUsage: 0,
        currentHourUsage: 0,
        lastUsed: 0,
        errorCount: 0,
        successCount: 0,
        avgResponseTime: 0,
        description: 'Financial news from Bloomberg, Reuters, and other sources',
        category: 'news'
      },
      {
        name: 'Polygon.io',
        key: process.env.POLYGON_API_KEY || null,
        endpoint: 'https://api.polygon.io/v2',
        status: process.env.POLYGON_API_KEY ? 'active' : 'inactive',
        priority: 'optional',
        rateLimitPerMinute: 5,
        rateLimitPerHour: 250,
        currentMinuteUsage: 0,
        currentHourUsage: 0,
        lastUsed: 0,
        errorCount: 0,
        successCount: 0,
        avgResponseTime: 0,
        description: 'Professional-grade market data and options flow',
        category: 'market_data'
      },
      {
        name: 'StockTwits API',
        key: null, // No key required
        endpoint: 'https://api.stocktwits.com/api/2',
        status: 'active',
        priority: 'optional',
        rateLimitPerMinute: 200,
        rateLimitPerHour: 10000,
        currentMinuteUsage: 0,
        currentHourUsage: 0,
        lastUsed: 0,
        errorCount: 0,
        successCount: 0,
        avgResponseTime: 0,
        description: 'Social sentiment analysis from trading community',
        category: 'news'
      },
      
      // NOTIFICATION APIs
      {
        name: 'Discord Webhook',
        key: process.env.DISCORD_WEBHOOK_URL || null,
        endpoint: process.env.DISCORD_WEBHOOK_URL || '',
        status: process.env.DISCORD_WEBHOOK_URL ? 'active' : 'inactive',
        priority: 'optional',
        rateLimitPerMinute: 30,
        rateLimitPerHour: 1000,
        currentMinuteUsage: 0,
        currentHourUsage: 0,
        lastUsed: 0,
        errorCount: 0,
        successCount: 0,
        avgResponseTime: 0,
        description: 'Real-time trading alerts and notifications',
        category: 'notifications'
      },
      {
        name: 'Telegram Bot API',
        key: process.env.TELEGRAM_BOT_TOKEN || null,
        endpoint: 'https://api.telegram.org/bot',
        status: process.env.TELEGRAM_BOT_TOKEN ? 'active' : 'inactive',
        priority: 'optional',
        rateLimitPerMinute: 30,
        rateLimitPerHour: 1000,
        currentMinuteUsage: 0,
        currentHourUsage: 0,
        lastUsed: 0,
        errorCount: 0,
        successCount: 0,
        avgResponseTime: 0,
        description: 'Telegram notifications for trading signals',
        category: 'notifications'
      }
    ];

    defaultAPIs.forEach(api => {
      this.apis.set(api.name, api);
    });
  }

  /**
   * Get API configuration by name
   */
  getAPI(name: string): APIConfig | null {
    return this.apis.get(name) || null;
  }

  /**
   * Get all APIs grouped by category
   */
  getAllAPIs(): Record<string, APIConfig[]> {
    const grouped: Record<string, APIConfig[]> = {};
    
    this.apis.forEach(api => {
      if (!grouped[api.category]) {
        grouped[api.category] = [];
      }
      grouped[api.category].push(api);
    });

    return grouped;
  }

  /**
   * Update API key and configuration
   */
  updateAPIKey(name: string, key: string | null, endpoint?: string): boolean {
    const api = this.apis.get(name);
    if (!api) return false;

    api.key = key;
    if (endpoint) api.endpoint = endpoint;
    api.status = key ? 'active' : 'inactive';
    api.errorCount = 0; // Reset error count on key update

    return true;
  }

  /**
   * Check if API call is allowed (rate limiting)
   */
  canMakeCall(apiName: string): { allowed: boolean; reason?: string; waitTime?: number } {
    const api = this.apis.get(apiName);
    if (!api) return { allowed: false, reason: 'API not found' };

    if (api.status === 'inactive') {
      return { allowed: false, reason: 'API key not configured' };
    }

    if (api.status === 'error' && api.errorCount >= 5) {
      return { allowed: false, reason: 'API has too many errors' };
    }

    if (api.currentMinuteUsage >= api.rateLimitPerMinute) {
      const resetTime = this.rateLimitResetTimes.get(apiName)?.minute || Date.now();
      const waitTime = Math.max(0, 60000 - (Date.now() - resetTime));
      return { allowed: false, reason: 'Rate limit exceeded (per minute)', waitTime };
    }

    if (api.currentHourUsage >= api.rateLimitPerHour) {
      const resetTime = this.rateLimitResetTimes.get(apiName)?.hour || Date.now();
      const waitTime = Math.max(0, 3600000 - (Date.now() - resetTime));
      return { allowed: false, reason: 'Rate limit exceeded (per hour)', waitTime };
    }

    return { allowed: true };
  }

  /**
   * Record API call and update metrics
   */
  recordAPICall(apiName: string, success: boolean, responseTime: number, error?: string) {
    const api = this.apis.get(apiName);
    if (!api) return;

    // Update usage counters
    api.currentMinuteUsage++;
    api.currentHourUsage++;
    api.lastUsed = Date.now();

    // Update success/error metrics
    if (success) {
      api.successCount++;
      api.status = 'active';
      api.errorCount = Math.max(0, api.errorCount - 1); // Reduce error count on success
    } else {
      api.errorCount++;
      api.lastError = error || 'Unknown error';
      
      if (api.errorCount >= 3) {
        api.status = 'error';
      }
    }

    // Update average response time
    const totalCalls = api.successCount + api.errorCount;
    api.avgResponseTime = ((api.avgResponseTime * (totalCalls - 1)) + responseTime) / totalCalls;
  }

  /**
   * Get API health status
   */
  getAPIHealth(): { healthy: number; total: number; critical: string[] } {
    let healthy = 0;
    let total = 0;
    const critical: string[] = [];

    this.apis.forEach(api => {
      total++;
      if (api.priority === 'essential') {
        if (api.status === 'active' && api.errorCount < 3) {
          healthy++;
        } else {
          critical.push(api.name);
        }
      } else if (api.status === 'active' && api.errorCount < 5) {
        healthy++;
      }
    });

    return { healthy, total, critical };
  }

  /**
   * Get optimal API for a category based on health and rate limits
   */
  getOptimalAPI(category: string, excludeAPIs: string[] = []): APIConfig | null {
    const apis = Array.from(this.apis.values())
      .filter(api => 
        api.category === category && 
        api.status === 'active' && 
        !excludeAPIs.includes(api.name)
      )
      .sort((a, b) => {
        // Sort by priority first, then by health metrics
        if (a.priority !== b.priority) {
          const priorityOrder = { 'essential': 3, 'optional': 2, 'fallback': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }

        // Then by error rate (lower is better)
        const aErrorRate = a.errorCount / Math.max(1, a.successCount + a.errorCount);
        const bErrorRate = b.errorCount / Math.max(1, b.successCount + b.errorCount);
        
        if (aErrorRate !== bErrorRate) {
          return aErrorRate - bErrorRate;
        }

        // Finally by current usage (lower is better for rate limiting)
        const aUsagePercent = a.currentMinuteUsage / a.rateLimitPerMinute;
        const bUsagePercent = b.currentMinuteUsage / b.rateLimitPerMinute;
        
        return aUsagePercent - bUsagePercent;
      });

    return apis.length > 0 ? apis[0] : null;
  }

  /**
   * Start rate limit reset timers
   */
  private startRateLimitReset() {
    // Reset minute counters every minute
    setInterval(() => {
      this.apis.forEach(api => {
        api.currentMinuteUsage = 0;
      });
    }, 60000);

    // Reset hour counters every hour
    setInterval(() => {
      this.apis.forEach(api => {
        api.currentHourUsage = 0;
      });
    }, 3600000);
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring() {
    setInterval(async () => {
      await this.performHealthCheck();
    }, 300000); // Check every 5 minutes
  }

  /**
   * Perform health check on all APIs
   */
  private async performHealthCheck() {
    const healthPromises = Array.from(this.apis.values()).map(async (api) => {
      if (api.status === 'inactive' || !api.key) return;

      try {
        const startTime = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(api.endpoint, { 
          method: 'HEAD',
          signal: controller.signal,
          headers: api.key ? { 'Authorization': `Bearer ${api.key}` } : {}
        });
        
        clearTimeout(timeoutId);
        
        const responseTime = Date.now() - startTime;
        this.recordAPICall(api.name, response.ok, responseTime);
        
        console.log(`✅ Health check passed for ${api.name} (${responseTime}ms)`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.recordAPICall(api.name, false, 5000, errorMessage);
        console.log(`❌ Health check failed for ${api.name}: ${errorMessage}`);
      }
    });

    await Promise.allSettled(healthPromises);
  }
}

export const apiManager = new APIManager();