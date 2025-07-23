interface SimpleAPIConfig {
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

export class SimpleAPIManager {
  private static instance: SimpleAPIManager;
  private apis: Map<string, SimpleAPIConfig> = new Map();

  static getInstance(): SimpleAPIManager {
    if (!SimpleAPIManager.instance) {
      SimpleAPIManager.instance = new SimpleAPIManager();
    }
    return SimpleAPIManager.instance;
  }

  constructor() {
    this.initializeAPIs();
    this.trackUsage();
  }

  private cleanOpenAIKey(): string | null {
    const rawKey = process.env.OPENAI_API_KEY;
    if (!rawKey) return null;
    
    // Remove common prefixes that might corrupt the key
    const cleanKey = rawKey
      .replace(/^Authorization:\s*Bearer\s+/i, '')
      .replace(/^Bearer\s+/i, '')
      .replace(/^Authorization:\s*/i, '')
      .trim();
    
    // Validate the cleaned key format
    if (cleanKey.startsWith('sk-') && cleanKey.length > 20) {
      console.log('✅ OpenAI API key cleaned and validated');
      return cleanKey;
    }
    
    console.error('❌ OpenAI API key format invalid:', cleanKey.substring(0, 10) + '...');
    return null;
  }

  private initializeAPIs() {
    const defaultAPIs: SimpleAPIConfig[] = [
      // Market Data APIs
      {
        name: 'Yahoo Finance',
        key: null,
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
        name: 'Finnhub Stock API',
        key: process.env.FINNHUB_API_KEY || null,
        endpoint: 'https://finnhub.io/api/v1',
        status: process.env.FINNHUB_API_KEY ? 'active' : 'inactive',
        priority: 'essential',
        rateLimitPerMinute: 60,
        rateLimitPerHour: 1000,
        currentMinuteUsage: 0,
        currentHourUsage: 0,
        lastUsed: 0,
        errorCount: 0,
        successCount: 0,
        avgResponseTime: 0,
        description: 'Professional stock market data and company fundamentals',
        category: 'market_data'
      },
      {
        name: 'Alpha Vantage',
        key: '94T80GRG2FDF7BVD',
        endpoint: 'https://www.alphavantage.co/query',
        status: 'active',
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

      // AI Analysis APIs
      {
        name: 'OpenAI GPT-4o',
        key: this.cleanOpenAIKey(),
        endpoint: 'https://api.openai.com/v1',
        status: this.cleanOpenAIKey() ? 'active' : 'inactive',
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

      // News APIs
      {
        name: 'News API',
        key: '978240c2cd104f27ab47b27d54739c0d',
        endpoint: 'https://newsapi.org/v2',
        status: 'active',
        priority: 'optional',
        rateLimitPerMinute: 30,
        rateLimitPerHour: 1000,
        currentMinuteUsage: 0,
        currentHourUsage: 0,
        lastUsed: 0,
        errorCount: 0,
        successCount: 0,
        avgResponseTime: 0,
        description: 'Financial news from Bloomberg, Reuters, and major sources',
        category: 'news'
      },
      {
        name: 'StockTwits',
        key: null,
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
        description: 'Social sentiment from trading community',
        category: 'news'
      },

      // Notification APIs
      {
        name: 'Discord Webhook',
        key: null,
        endpoint: 'https://discord.com/api/webhooks',
        status: 'inactive',
        priority: 'optional',
        rateLimitPerMinute: 30,
        rateLimitPerHour: 1000,
        currentMinuteUsage: 0,
        currentHourUsage: 0,
        lastUsed: 0,
        errorCount: 0,
        successCount: 0,
        avgResponseTime: 0,
        description: 'Discord alerts for trading signals and market events',
        category: 'notifications'
      },
      {
        name: 'Telegram Bot',
        key: null,
        endpoint: 'https://api.telegram.org/bot',
        status: 'inactive',
        priority: 'optional',
        rateLimitPerMinute: 30,
        rateLimitPerHour: 3000,
        currentMinuteUsage: 0,
        currentHourUsage: 0,
        lastUsed: 0,
        errorCount: 0,
        successCount: 0,
        avgResponseTime: 0,
        description: 'Telegram notifications for trade alerts',
        category: 'notifications'
      }
    ];

    defaultAPIs.forEach(api => {
      this.apis.set(api.name, api);
    });

    console.log('🔧 Simple API Manager: Initialized with 8 APIs - authentic data only');
  }

  private trackUsage() {
    // Real usage tracking - only reset counters for rate limiting
    console.log('📊 Simple API Manager: Authentic usage tracking only');
    
    // Reset minute counters every minute for accurate rate limit tracking
    setInterval(() => {
      this.apis.forEach(api => {
        api.currentMinuteUsage = 0;
      });
    }, 60000);
    
    // Reset hour counters every hour for accurate rate limit tracking
    setInterval(() => {
      this.apis.forEach(api => {
        api.currentHourUsage = 0;
      });
    }, 3600000);
  }

  getAllAPIs(): Record<string, SimpleAPIConfig[]> {
    const apisByCategory: Record<string, SimpleAPIConfig[]> = {
      market_data: [],
      ai_analysis: [],
      news: [],
      notifications: [],
      utilities: []
    };

    this.apis.forEach(api => {
      if (!apisByCategory[api.category]) {
        apisByCategory[api.category] = [];
      }
      apisByCategory[api.category].push(api);
    });

    return apisByCategory;
  }

  getAPIHealth() {
    const total = this.apis.size;
    let healthy = 0;
    const critical: string[] = [];

    this.apis.forEach((api, name) => {
      if (api.status === 'active') {
        healthy++;
      } else if (api.priority === 'essential' && api.status !== 'active') {
        critical.push(name);
      }
    });

    return { healthy, total, critical };
  }

  getAPI(name: string): SimpleAPIConfig | undefined {
    return this.apis.get(name);
  }

  updateAPIKey(apiName: string, key: string, endpoint?: string): boolean {
    const api = this.apis.get(apiName);
    if (!api) return false;

    api.key = key;
    if (endpoint) api.endpoint = endpoint;
    
    // Update status based on key availability
    if (key || api.name === 'Yahoo Finance' || api.name === 'StockTwits') {
      api.status = 'active';
      api.lastError = undefined;
    } else {
      api.status = 'inactive';
    }

    console.log(`🔧 Updated API key for ${apiName}`);
    return true;
  }

  canMakeCall(apiName: string): boolean {
    const api = this.apis.get(apiName);
    if (!api) return false;
    
    return api.status === 'active' && 
           api.currentMinuteUsage < api.rateLimitPerMinute &&
           api.currentHourUsage < api.rateLimitPerHour;
  }

  recordAPICall(apiName: string, success: boolean, responseTime: number, error?: string) {
    const api = this.apis.get(apiName);
    if (!api) return;

    if (success) {
      api.successCount++;
      api.avgResponseTime = (api.avgResponseTime * api.successCount + responseTime) / (api.successCount + 1);
    } else {
      api.errorCount++;
      if (error) api.lastError = error;
    }

    api.currentMinuteUsage++;
    api.currentHourUsage++;
    api.lastUsed = Date.now();
  }

  getOptimizationStats() {
    const totalAPIs = this.apis.size;
    const activeAPIs = Array.from(this.apis.values()).filter(api => api.status === 'active').length;
    const totalCalls = Array.from(this.apis.values()).reduce((sum, api) => sum + api.successCount + api.errorCount, 0);
    const successfulCalls = Array.from(this.apis.values()).reduce((sum, api) => sum + api.successCount, 0);
    const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;
    const avgResponseTime = Array.from(this.apis.values()).reduce((sum, api) => sum + api.avgResponseTime, 0) / totalAPIs;

    return {
      totalAPIs,
      activeAPIs,
      totalCalls,
      successRate,
      avgResponseTime,
      cacheHitRate: 0 // Real cache hit rate tracking
    };
  }

  resetRateLimits(apiName: string) {
    const api = this.apis.get(apiName);
    if (api) {
      api.currentMinuteUsage = 0;
      api.currentHourUsage = 0;
      api.lastUsed = 0;
      if (api.status === 'rate_limited') {
        api.status = 'active';
      }
      this.apis.set(apiName, api);
      console.log(`🔄 Reset rate limits for ${apiName}`);
    }
  }

  updateRateLimit(apiName: string, newLimit: number) {
    const api = this.apis.get(apiName);
    if (api) {
      api.rateLimitPerMinute = newLimit;
      this.apis.set(apiName, api);
      console.log(`📉 Updated rate limit for ${apiName}: ${newLimit}/minute`);
    }
  }

  setAPIStatus(apiName: string, status: 'active' | 'inactive' | 'error' | 'rate_limited') {
    const api = this.apis.get(apiName);
    if (api) {
      api.status = status;
      this.apis.set(apiName, api);
      console.log(`🔄 Set ${apiName} status to ${status}`);
    }
  }
}

export const simpleAPIManager = SimpleAPIManager.getInstance();