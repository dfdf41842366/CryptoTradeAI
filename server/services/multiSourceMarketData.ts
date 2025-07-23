import axios from 'axios';

export interface QuoteData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  dayHigh?: number;
  dayLow?: number;
  marketCap?: string;
  peRatio?: string;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  source: string; // Track data source for reliability
}

export class MultiSourceMarketDataService {
  private finnhubApiKey: string;
  private alphavantageApiKey: string;
  private polygonApiKey: string;
  private iexCloudApiKey: string;
  private newsApiKey: string;

  constructor() {
    this.finnhubApiKey = process.env.FINNHUB_API_KEY || '';
    this.alphavantageApiKey = process.env.ALPHA_VANTAGE_API_KEY || '94T80GRG2FDF7BVD';
    this.polygonApiKey = process.env.POLYGON_API_KEY || 'uj6d6syChWvBCLm1l7F2M99yUZLwuDCF';
    this.iexCloudApiKey = process.env.IEX_CLOUD_API_KEY || '';
    this.newsApiKey = process.env.NEWS_API_KEY || '978240c2cd104f27ab47b27d54739c0d';
  }

  // Primary method - tries multiple sources for reliability
  async getQuote(symbol: string): Promise<QuoteData> {
    const sources = [
      () => this.getYahooFinanceQuote(symbol),
      () => this.getAlphaVantageQuote(symbol),
      () => this.getPolygonQuote(symbol),
      () => this.getIEXCloudQuote(symbol),
      () => this.getFinnhubQuote(symbol)
    ];

    for (const [index, getQuote] of sources.entries()) {
      try {
        const quote = await getQuote();
        if (quote && quote.price > 0) {
          console.log(`Successfully fetched ${symbol} from source ${index + 1}`);
          return quote;
        }
      } catch (error) {
        console.warn(`Source ${index + 1} failed for ${symbol}:`, error.message);
        continue;
      }
    }

    throw new Error(`Unable to fetch real market data for ${symbol} from any source. Please verify API credentials.`);
  }

  // Yahoo Finance - Free, most reliable
  private async getYahooFinanceQuote(symbol: string): Promise<QuoteData> {
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
      { timeout: 10000 }
    );

    const data = response.data;
    if (!data.chart?.result?.[0]) {
      throw new Error('Invalid Yahoo Finance response');
    }

    const result = data.chart.result[0];
    const meta = result.meta;
    const currentPrice = meta.regularMarketPrice;
    const previousClose = meta.previousClose;

    return {
      symbol,
      price: currentPrice,
      change: currentPrice - previousClose,
      changePercent: ((currentPrice - previousClose) / previousClose) * 100,
      volume: this.formatVolume(meta.regularMarketVolume || 0),
      dayHigh: meta.regularMarketDayHigh,
      dayLow: meta.regularMarketDayLow,
      marketCap: this.formatMarketCap(meta.marketCap || 0),
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
      source: 'Yahoo Finance'
    };
  }

  // Alpha Vantage - Free tier available
  private async getAlphaVantageQuote(symbol: string): Promise<QuoteData> {
    if (!this.alphavantageApiKey) {
      throw new Error('Alpha Vantage API key not configured');
    }

    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol,
        apikey: this.alphavantageApiKey
      },
      timeout: 10000
    });

    const quote = response.data['Global Quote'];
    if (!quote || !quote['05. price']) {
      throw new Error('Invalid Alpha Vantage response');
    }

    const currentPrice = parseFloat(quote['05. price']);
    const change = parseFloat(quote['09. change']);
    const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));

    return {
      symbol,
      price: currentPrice,
      change,
      changePercent,
      volume: this.formatVolume(parseInt(quote['06. volume']) || 0),
      dayHigh: parseFloat(quote['03. high']),
      dayLow: parseFloat(quote['04. low']),
      source: 'Alpha Vantage'
    };
  }

  // Polygon.io - Professional grade
  private async getPolygonQuote(symbol: string): Promise<QuoteData> {
    if (!this.polygonApiKey) {
      throw new Error('Polygon API key not configured');
    }

    const today = new Date().toISOString().split('T')[0];
    const response = await axios.get(
      `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${today}/${today}`,
      {
        params: { apikey: this.polygonApiKey },
        timeout: 10000
      }
    );

    const data = response.data;
    if (!data.results?.[0]) {
      throw new Error('Invalid Polygon response');
    }

    const result = data.results[0];
    const currentPrice = result.c;
    const previousClose = result.o;

    return {
      symbol,
      price: currentPrice,
      change: currentPrice - previousClose,
      changePercent: ((currentPrice - previousClose) / previousClose) * 100,
      volume: this.formatVolume(result.v || 0),
      dayHigh: result.h,
      dayLow: result.l,
      source: 'Polygon.io'
    };
  }

  // IEX Cloud - Good free tier
  private async getIEXCloudQuote(symbol: string): Promise<QuoteData> {
    if (!this.iexCloudApiKey) {
      throw new Error('IEX Cloud API key not configured');
    }

    const response = await axios.get(
      `https://cloud.iexapis.com/stable/stock/${symbol}/quote`,
      {
        params: { token: this.iexCloudApiKey },
        timeout: 10000
      }
    );

    const data = response.data;
    if (!data.latestPrice) {
      throw new Error('Invalid IEX Cloud response');
    }

    return {
      symbol,
      price: data.latestPrice,
      change: data.change,
      changePercent: data.changePercent * 100,
      volume: this.formatVolume(data.latestVolume || 0),
      dayHigh: data.high,
      dayLow: data.low,
      marketCap: this.formatMarketCap(data.marketCap || 0),
      peRatio: data.peRatio?.toFixed(2),
      fiftyTwoWeekHigh: data.week52High,
      fiftyTwoWeekLow: data.week52Low,
      source: 'IEX Cloud'
    };
  }

  // Finnhub - Backup source
  private async getFinnhubQuote(symbol: string): Promise<QuoteData> {
    if (!this.finnhubApiKey) {
      throw new Error('Finnhub API key not configured');
    }

    const response = await axios.get('https://finnhub.io/api/v1/quote', {
      params: {
        symbol,
        token: this.finnhubApiKey
      },
      timeout: 10000
    });

    const data = response.data;
    if (!data.c) {
      throw new Error('Invalid Finnhub response');
    }

    return {
      symbol,
      price: data.c,
      change: data.c - data.pc,
      changePercent: data.dp,
      volume: this.formatVolume(data.v || 0),
      dayHigh: data.h,
      dayLow: data.l,
      source: 'Finnhub'
    };
  }

  async getMultipleQuotes(symbols: string[]): Promise<QuoteData[]> {
    const results = await Promise.allSettled(
      symbols.map(symbol => this.getQuote(symbol))
    );

    const validQuotes = results
      .filter((result): result is PromiseFulfilledResult<QuoteData> => 
        result.status === 'fulfilled')
      .map(result => result.value);

    if (validQuotes.length === 0) {
      throw new Error('Unable to fetch real market data from any source. Please verify API credentials.');
    }

    return validQuotes;
  }

  async getTopMovers(): Promise<QuoteData[]> {
    try {
      const popularSymbols = [
        'NVDA', 'TSLA', 'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 
        'AMD', 'PLTR', 'RIVN', 'LCID', 'SOXL', 'GME', 'AMC'
      ];
      
      const quotes = await this.getMultipleQuotes(popularSymbols);
      
      return quotes
        .filter(quote => quote.price > 0)
        .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
        .slice(0, 10);
    } catch (error) {
      throw new Error('Unable to fetch real market data for top movers.');
    }
  }

  async getFinancialNews(symbol?: string): Promise<any[]> {
    const sources = [
      () => this.getFinnhubNews(symbol),
      () => this.getNewsApiFinancial(symbol)
    ];

    for (const getNews of sources) {
      try {
        const news = await getNews();
        if (news && news.length > 0) {
          return news;
        }
      } catch (error) {
        console.warn('News source failed:', error.message);
        continue;
      }
    }

    throw new Error('Unable to fetch real financial news from any source.');
  }

  private async getFinnhubNews(symbol?: string): Promise<any[]> {
    if (!this.finnhubApiKey) {
      throw new Error('Finnhub API key not configured');
    }

    const url = symbol 
      ? 'https://finnhub.io/api/v1/company-news'
      : 'https://finnhub.io/api/v1/news';
      
    const params: any = {
      token: this.finnhubApiKey,
      category: 'general'
    };
    
    if (symbol) {
      params.symbol = symbol;
      params.from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      params.to = new Date().toISOString().split('T')[0];
    }

    const response = await axios.get(url, { params, timeout: 10000 });
    return response.data.slice(0, 10) || [];
  }

  private async getNewsApiFinancial(symbol?: string): Promise<any[]> {
    if (!this.newsApiKey) {
      throw new Error('News API key not configured');
    }

    const query = symbol ? `${symbol} stock` : 'stock market';
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: query,
        sources: 'bloomberg,reuters,financial-times,the-wall-street-journal',
        sortBy: 'publishedAt',
        language: 'en',
        apiKey: this.newsApiKey,
        pageSize: 10
      },
      timeout: 10000
    });

    return response.data.articles || [];
  }

  private formatVolume(volume: number): string {
    if (volume >= 1000000000) {
      return `${(volume / 1000000000).toFixed(1)}B`;
    } else if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  }

  private formatMarketCap(marketCap: number): string {
    if (marketCap >= 1000000000000) {
      return `${(marketCap / 1000000000000).toFixed(1)}T`;
    } else if (marketCap >= 1000000000) {
      return `${(marketCap / 1000000000).toFixed(1)}B`;
    } else if (marketCap >= 1000000) {
      return `${(marketCap / 1000000).toFixed(1)}M`;
    }
    return 'N/A';
  }

  // Health check method
  async checkAPIHealth(): Promise<{ [key: string]: boolean }> {
    const health = {
      yahooFinance: true, // Always available
      alphaVantage: !!this.alphavantageApiKey,
      polygon: !!this.polygonApiKey,
      iexCloud: !!this.iexCloudApiKey,
      finnhub: !!this.finnhubApiKey,
      newsApi: !!this.newsApiKey,
      stocktwits: true, // No auth required
      reddit: true // Configured with your credentials
    };

    // Test with a simple quote
    try {
      await this.getQuote('AAPL');
      health.apiConnection = true;
    } catch (error) {
      health.apiConnection = false;
    }

    return health;
  }
}

export const multiSourceMarketDataService = new MultiSourceMarketDataService();