import axios from 'axios';

export interface QuoteData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap?: number;
  peRatio?: number;
  dayHigh?: number;
  dayLow?: number;
}

export class MarketDataService {
  private finnhubApiKey: string;
  private twelveDataApiKey: string;

  constructor() {
    this.finnhubApiKey = process.env.FINNHUB_API_KEY || process.env.VITE_FINNHUB_API_KEY || '';
    this.twelveDataApiKey = process.env.TWELVE_DATA_API_KEY || process.env.VITE_TWELVE_DATA_API_KEY || '';
  }

  async getQuote(symbol: string): Promise<QuoteData> {
    try {
      // Try Finnhub first
      const response = await axios.get(`https://finnhub.io/api/v1/quote`, {
        params: {
          symbol: symbol,
          token: this.finnhubApiKey
        },
        timeout: 5000
      });

      const data = response.data;
      return {
        symbol,
        price: data.c || 0,
        change: (data.c - data.pc) || 0,
        changePercent: data.dp || 0,
        volume: this.formatVolume(data.v || 0),
        dayHigh: data.h,
        dayLow: data.l
      };
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      // Return error state - no synthetic data
      throw new Error(`Unable to fetch real market data for ${symbol}. Please check API credentials.`);
    }
  }

  async getMultipleQuotes(symbols: string[]): Promise<QuoteData[]> {
    const promises = symbols.map(async (symbol) => {
      try {
        return await this.getQuote(symbol);
      } catch (error) {
        console.error(`Failed to get quote for ${symbol}:`, error);
        return null;
      }
    });
    
    const results = await Promise.allSettled(promises);
    const validQuotes = results
      .filter((result): result is PromiseFulfilledResult<QuoteData | null> => 
        result.status === 'fulfilled' && result.value !== null)
      .map(result => result.value as QuoteData);

    if (validQuotes.length === 0) {
      throw new Error('Unable to fetch real market data. API service may be unavailable or rate limited.');
    }

    return validQuotes;
  }

  async getTopMovers(): Promise<QuoteData[]> {
    try {
      // Get stock symbols and their quotes
      const popularSymbols = ['NVDA', 'TSLA', 'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'AMD', 'PLTR', 'RIVN', 'LCID', 'SOXL'];
      const quotes = await this.getMultipleQuotes(popularSymbols);
      
      // Sort by absolute percentage change
      return quotes
        .filter(quote => quote.price > 0)
        .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
        .slice(0, 10);
    } catch (error) {
      console.error('Error fetching top movers:', error);
      throw new Error('Unable to fetch real market data for top movers. Please verify API credentials.');
    }
  }

  async getHistoricalData(symbol: string, period: string = '3M'): Promise<any[]> {
    try {
      // Try Yahoo Finance API for historical data
      const endDate = new Date();
      const startDate = new Date();
      
      // Set period based on parameter
      switch (period) {
        case '1M':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case '3M':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case '6M':
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case '1Y':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(startDate.getMonth() - 3);
      }

      const period1 = Math.floor(startDate.getTime() / 1000);
      const period2 = Math.floor(endDate.getTime() / 1000);

      const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`, {
        params: {
          period1,
          period2,
          interval: '1d',
          includePrePost: true
        },
        timeout: 10000
      });

      const result = response.data?.chart?.result?.[0];
      if (!result || !result.timestamp) {
        throw new Error('No historical data available');
      }

      const timestamps = result.timestamp;
      const quotes = result.indicators?.quote?.[0];
      
      if (!quotes) {
        throw new Error('Invalid historical data format');
      }

      const historicalData = timestamps.map((timestamp: number, index: number) => {
        const date = new Date(timestamp * 1000);
        return {
          date: date.toISOString().split('T')[0],
          open: quotes.open?.[index] || 0,
          high: quotes.high?.[index] || 0,
          low: quotes.low?.[index] || 0,
          close: quotes.close?.[index] || 0,
          volume: quotes.volume?.[index] || 0,
          timestamp: timestamp
        };
      }).filter(data => data.close > 0); // Filter out invalid data points

      return historicalData.reverse(); // Most recent first

    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      return [];
    }
  }

  async getMarketNews(symbol?: string): Promise<any[]> {
    try {
      const url = symbol 
        ? `https://finnhub.io/api/v1/company-news`
        : `https://finnhub.io/api/v1/news`;
        
      const params: any = {
        token: this.finnhubApiKey,
        category: 'general'
      };
      
      if (symbol) {
        params.symbol = symbol;
        params.from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        params.to = new Date().toISOString().split('T')[0];
      }

      const response = await axios.get(url, { params, timeout: 5000 });
      return response.data.slice(0, 10) || [];
    } catch (error) {
      console.error('Error fetching market news:', error);
      throw new Error('Unable to fetch real market news. API service may be unavailable.');
    }
  }

  private formatVolume(volume: number): string {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  }

}

export const marketDataService = new MarketDataService();
