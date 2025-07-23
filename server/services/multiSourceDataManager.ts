import axios from 'axios';

interface DataSource {
  name: string;
  priority: number;
  rateLimit: number;
  dailyLimit?: number;
  isActive: boolean;
  lastError?: string;
  requestCount: number;
  lastReset: Date;
}

interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

export class MultiSourceDataManager {
  private dataSources: Map<string, DataSource> = new Map();
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  constructor() {
    this.initializeDataSources();
    this.startHealthMonitoring();
  }

  private initializeDataSources() {
    // Yahoo Finance - Primary (Unlimited, Most Reliable)
    this.dataSources.set('yahoo', {
      name: 'Yahoo Finance',
      priority: 1,
      rateLimit: 1000, // requests per minute
      isActive: true,
      requestCount: 0,
      lastReset: new Date()
    });

    // Alpha Vantage - Secondary (500/day free)
    this.dataSources.set('alphavantage', {
      name: 'Alpha Vantage',
      priority: 2,
      rateLimit: 5, // requests per minute
      dailyLimit: 500,
      isActive: !!process.env.ALPHA_VANTAGE_API_KEY,
      requestCount: 0,
      lastReset: new Date()
    });

    // IEX Cloud - Tertiary (100k/month free)
    this.dataSources.set('iex', {
      name: 'IEX Cloud',
      priority: 3,
      rateLimit: 100, // requests per minute
      isActive: !!process.env.IEX_API_KEY,
      requestCount: 0,
      lastReset: new Date()
    });

    // Finnhub - Quaternary (60/minute free, but API key provided)
    this.dataSources.set('finnhub', {
      name: 'Finnhub',
      priority: 4,
      rateLimit: 60,
      isActive: !!process.env.FINNHUB_API_KEY,
      requestCount: 0,
      lastReset: new Date()
    });
  }

  private async fetchFromYahoo(symbol: string): Promise<StockQuote | null> {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
      const response = await axios.get(url, { timeout: 5000 });
      
      if (response.data?.chart?.result?.[0]) {
        const result = response.data.chart.result[0];
        const meta = result.meta;
        const quote = result.indicators?.quote?.[0];
        
        if (meta && quote) {
          return {
            symbol,
            price: Math.round((meta.regularMarketPrice || meta.previousClose || 0) * 100) / 100,
            change: Math.round(((meta.regularMarketPrice || 0) - (meta.previousClose || 0)) * 100) / 100,
            changePercent: Math.round((((meta.regularMarketPrice || 0) - (meta.previousClose || 0)) / (meta.previousClose || 1) * 100) * 100) / 100,
            volume: meta.regularMarketVolume || 0,
            high: Math.round((meta.regularMarketDayHigh || 0) * 100) / 100,
            low: Math.round((meta.regularMarketDayLow || 0) * 100) / 100,
            open: Math.round((meta.regularMarketOpen || 0) * 100) / 100,
            previousClose: Math.round((meta.previousClose || 0) * 100) / 100
          };
        }
      }
    } catch (error: any) {
      console.log(`Yahoo Finance error for ${symbol}:`, error?.message || 'Unknown error');
    }
    return null;
  }

  private async fetchFromAlphaVantage(symbol: string): Promise<StockQuote | null> {
    if (!process.env.ALPHA_VANTAGE_API_KEY) return null;
    
    try {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`;
      const response = await axios.get(url, { timeout: 5000 });
      
      const quote = response.data['Global Quote'];
      if (quote && quote['05. price']) {
        const price = parseFloat(quote['05. price']);
        const change = parseFloat(quote['09. change']);
        const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
        
        return {
          symbol,
          price,
          change,
          changePercent,
          volume: parseInt(quote['06. volume']) || 0,
          high: parseFloat(quote['03. high']) || 0,
          low: parseFloat(quote['04. low']) || 0,
          open: parseFloat(quote['02. open']) || 0,
          previousClose: parseFloat(quote['08. previous close']) || 0
        };
      }
    } catch (error: any) {
      console.log(`Alpha Vantage error for ${symbol}:`, error?.message || 'Unknown error');
    }
    return null;
  }

  private async fetchFromIEX(symbol: string): Promise<StockQuote | null> {
    if (!process.env.IEX_API_KEY) return null;
    
    try {
      const url = `https://cloud.iexapis.com/stable/stock/${symbol}/quote?token=${process.env.IEX_API_KEY}`;
      const response = await axios.get(url, { timeout: 5000 });
      
      if (response.data) {
        const data = response.data;
        return {
          symbol,
          price: Math.round((data.latestPrice || 0) * 100) / 100,
          change: Math.round((data.change || 0) * 100) / 100,
          changePercent: Math.round((data.changePercent * 100 || 0) * 100) / 100,
          volume: data.volume || 0,
          high: Math.round((data.high || 0) * 100) / 100,
          low: Math.round((data.low || 0) * 100) / 100,
          open: Math.round((data.open || 0) * 100) / 100,
          previousClose: Math.round((data.previousClose || 0) * 100) / 100
        };
      }
    } catch (error: any) {
      console.log(`IEX Cloud error for ${symbol}:`, error?.message || 'Unknown error');
    }
    return null;
  }

  private async fetchFromFinnhub(symbol: string): Promise<StockQuote | null> {
    if (!process.env.FINNHUB_API_KEY) return null;
    
    const source = this.dataSources.get('finnhub');
    if (!source || !this.canMakeRequest('finnhub')) return null;
    
    try {
      const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`;
      const response = await axios.get(url, { timeout: 5000 });
      
      this.incrementRequestCount('finnhub');
      
      if (response.data && response.data.c) {
        const data = response.data;
        return {
          symbol,
          price: Math.round((data.c || 0) * 100) / 100,
          change: Math.round((data.d || 0) * 100) / 100,
          changePercent: Math.round((data.dp || 0) * 100) / 100,
          volume: 0, // Finnhub quote doesn't include volume
          high: Math.round((data.h || 0) * 100) / 100,
          low: Math.round((data.l || 0) * 100) / 100,
          open: Math.round((data.o || 0) * 100) / 100,
          previousClose: Math.round((data.pc || 0) * 100) / 100
        };
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        source.isActive = false;
        source.lastError = 'Rate limit exceeded';
        console.log(`Finnhub rate limit reached, disabling for 1 minute`);
        setTimeout(() => {
          source.isActive = true;
          source.lastError = undefined;
        }, 60000);
      }
    }
    return null;
  }

  private canMakeRequest(sourceName: string): boolean {
    const source = this.dataSources.get(sourceName);
    if (!source || !source.isActive) return false;
    
    // Reset count if a minute has passed
    const now = new Date();
    if (now.getTime() - source.lastReset.getTime() > 60000) {
      source.requestCount = 0;
      source.lastReset = now;
    }
    
    return source.requestCount < source.rateLimit;
  }

  private incrementRequestCount(sourceName: string): void {
    const source = this.dataSources.get(sourceName);
    if (source) {
      source.requestCount++;
    }
  }

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  private setCachedData(key: string, data: any, ttlSeconds: number = 30): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000
    });
  }

  public async getStockQuote(symbol: string): Promise<StockQuote | null> {
    const cacheKey = `quote_${symbol}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    // Yahoo Finance PRIMARY - best free option, with backups for reliability
    const sources = [
      { name: 'yahoo', fetcher: this.fetchFromYahoo.bind(this) },
      { name: 'alphavantage', fetcher: this.fetchFromAlphaVantage.bind(this) },
      { name: 'iex', fetcher: this.fetchFromIEX.bind(this) },
      { name: 'finnhub', fetcher: this.fetchFromFinnhub.bind(this) }
    ];

    for (const source of sources) {
      const sourceConfig = this.dataSources.get(source.name);
      if (sourceConfig?.isActive && this.canMakeRequest(source.name)) {
        const result = await source.fetcher(symbol);
        if (result) {
          this.setCachedData(cacheKey, result, 30); // Cache for 30 seconds
          console.log(`✅ Got real data for ${symbol} from ${sourceConfig.name}`);
          return result;
        }
      }
    }

    console.log(`❌ No data sources available for ${symbol}`);
    return null;
  }

  public async getMultipleQuotes(symbols: string[]): Promise<StockQuote[]> {
    const promises = symbols.map(symbol => this.getStockQuote(symbol));
    const results = await Promise.all(promises);
    return results.filter(result => result !== null) as StockQuote[];
  }

  public getHealthStatus() {
    const status = Array.from(this.dataSources.entries()).map(([key, source]) => ({
      source: key,
      name: source.name,
      active: source.isActive,
      priority: source.priority,
      requestCount: source.requestCount,
      rateLimit: source.rateLimit,
      lastError: source.lastError
    }));

    return {
      totalSources: this.dataSources.size,
      activeSources: Array.from(this.dataSources.values()).filter(s => s.isActive).length,
      cacheSize: this.cache.size,
      sources: status
    };
  }

  private startHealthMonitoring() {
    setInterval(() => {
      // Reset rate limit counters every minute
      for (const source of Array.from(this.dataSources.values())) {
        const now = new Date();
        if (now.getTime() - source.lastReset.getTime() > 60000) {
          source.requestCount = 0;
          source.lastReset = now;
        }
      }

      // Clean expired cache entries
      const now = Date.now();
      for (const [key, cached] of Array.from(this.cache.entries())) {
        if (now - cached.timestamp > cached.ttl) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Every minute
  }
}

export const multiSourceDataManager = new MultiSourceDataManager();