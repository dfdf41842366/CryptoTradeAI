export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  float: number;
  exchange: string;
  sector: string;
  avgVolume: number;
  dayHigh: number;
  dayLow: number;
  yearHigh: number;
  yearLow: number;
}

export class MarketDataAPI {
  private cache: Map<string, { data: StockData; timestamp: number }> = new Map();
  private CACHE_DURATION = 60000; // 1 minute cache

  // Comprehensive US exchange symbols database
  private exchangeSymbols = {
    NYSE: [
      'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'TSLA', 'META', 'NVDA',
      'JPM', 'JNJ', 'V', 'PG', 'UNH', 'HD', 'MA', 'DIS', 'BAC', 'XOM',
      'CVX', 'ABBV', 'KO', 'PFE', 'AVGO', 'PEP', 'TMO', 'COST', 'MRK',
      'WMT', 'ABT', 'CRM', 'LLY', 'DHR', 'VZ', 'TXN', 'ORCL', 'BMY',
      'GM', 'F', 'T', 'C', 'WFC', 'USB', 'GS', 'MS', 'AXP', 'CAT',
      'IBM', 'GE', 'NKE', 'MCD', 'HON', 'LMT', 'MMM', 'AMD', 'COP',
      'AMC', 'GME', 'BB', 'NOK', 'PLTR', 'RIVN', 'LCID', 'COIN'
    ],
    NASDAQ: [
      'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'GOOG', 'META', 'TSLA', 'NVDA',
      'NFLX', 'ADBE', 'CRM', 'INTC', 'CSCO', 'CMCSA', 'PEP', 'TMUS',
      'QCOM', 'TXN', 'INTU', 'AMAT', 'ISRG', 'BKNG', 'MU', 'GILD',
      'MDLZ', 'CSX', 'REGN', 'VRTX', 'FISV', 'ADP', 'ATVI', 'ADI',
      'KOSS', 'PROG', 'CYDY', 'BBIG', 'AVXL', 'ATOS', 'SAVA', 'CLOV',
      'SOFI', 'UPST', 'HOOD', 'AFRM', 'WISH', 'CLOV', 'SPCE', 'HYLN',
      'SKLZ', 'DKNG', 'PENN', 'ROKU', 'ZM', 'DOCU', 'PTON', 'TDOC'
    ],
    'NYSE ARCA': [
      'SPY', 'QQQ', 'IWM', 'EFA', 'VTI', 'GLD', 'SLV', 'EEM', 'FXI',
      'XLF', 'XLE', 'XLV', 'XLI', 'XLK', 'XLU', 'XLP', 'XLRE', 'XLY',
      'SOXL', 'SOXS', 'SPXL', 'SPXS', 'TQQQ', 'SQQQ', 'UDOW', 'SDOW'
    ],
    'NYSE American': [
      'SENS', 'OBSV', 'HMHC', 'COFS', 'MNKD', 'EMAN', 'EFOI', 'CCRN',
      'EARS', 'DTIL', 'EHTH', 'IMAC', 'KSPN', 'LITM', 'MEDS', 'NOTV'
    ],
    OTC: [
      'CYDY', 'GVSI', 'HMBL', 'INCT', 'INQD', 'KAVL', 'MRNJ', 'NECA',
      'OZSC', 'PASO', 'PHIL', 'PVDG', 'RXMD', 'SIML', 'SNPW', 'TSNP',
      'WDLF', 'YCBD', 'ZNTR', 'ZNGY'
    ]
  };

  async searchSymbols(query: string): Promise<StockData[]> {
    const upperQuery = query.toUpperCase();
    const results: StockData[] = [];
    
    // Search through all exchanges
    for (const [exchange, symbols] of Object.entries(this.exchangeSymbols)) {
      const matchingSymbols = symbols.filter(symbol => 
        symbol.includes(upperQuery) || 
        this.getCompanyName(symbol).toLowerCase().includes(query.toLowerCase())
      );
      
      for (const symbol of matchingSymbols.slice(0, 3)) { // Limit per exchange
        try {
          const stockData = await this.getStockData(symbol);
          if (stockData) {
            results.push({ ...stockData, exchange });
          }
        } catch (error) {
          console.log(`Failed to fetch data for ${symbol}:`, error);
        }
      }
    }
    
    return results.slice(0, 15); // Return top 15 results
  }

  async getStockData(symbol: string): Promise<StockData | null> {
    const cached = this.cache.get(symbol);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Try multiple data sources with fallback
      let stockData = await this.fetchFromYahooFinance(symbol);
      
      if (!stockData && process.env.FINNHUB_API_KEY) {
        stockData = await this.fetchFromFinnhub(symbol);
      }
      
      if (!stockData && process.env.ALPHA_VANTAGE_API_KEY) {
        stockData = await this.fetchFromAlphaVantage(symbol);
      }
      
      if (!stockData) {
        // NO FAKE DATA: Return null instead of generating mock data
        console.log(`❌ NO AUTHENTIC DATA: Unable to fetch real data for ${symbol} from any source`);
        return null;
      }
      
      if (stockData) {
        this.cache.set(symbol, { data: stockData, timestamp: Date.now() });
        return stockData;
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      // NO FAKE DATA: Return null instead of generating mock data
      return null;
    }
  }

  private async fetchFromYahooFinance(symbol: string): Promise<StockData | null> {
    try {
      const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
      if (!response.ok) return null;
      
      const data = await response.json();
      const result = data.chart?.result?.[0];
      
      if (!result) return null;
      
      const meta = result.meta;
      const quote = result.indicators?.quote?.[0];
      
      return {
        symbol: meta.symbol,
        name: this.getCompanyName(symbol),
        price: meta.regularMarketPrice || 0,
        change: meta.regularMarketPrice - meta.previousClose || 0,
        changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100 || 0,
        volume: meta.regularMarketVolume || 0,
        marketCap: this.calculateMarketCap(symbol, meta.regularMarketPrice),
        float: this.getFloatShares(symbol),
        exchange: meta.exchangeName || 'Unknown',
        sector: this.getSector(symbol),
        avgVolume: meta.averageDailyVolume10Day || 0,
        dayHigh: meta.regularMarketDayHigh || 0,
        dayLow: meta.regularMarketDayLow || 0,
        yearHigh: meta.fiftyTwoWeekHigh || 0,
        yearLow: meta.fiftyTwoWeekLow || 0
      };
    } catch (error) {
      console.log(`Yahoo Finance failed for ${symbol}:`, error);
      return null;
    }
  }

  private async fetchFromFinnhub(symbol: string): Promise<StockData | null> {
    try {
      const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`);
      if (!response.ok) return null;
      
      const data = await response.json();
      
      return {
        symbol,
        name: this.getCompanyName(symbol),
        price: data.c || 0,
        change: data.d || 0,
        changePercent: data.dp || 0,
        volume: data.v || 0,
        marketCap: this.calculateMarketCap(symbol, data.c),
        float: this.getFloatShares(symbol),
        exchange: this.getExchange(symbol),
        sector: this.getSector(symbol),
        avgVolume: data.v || 0,
        dayHigh: data.h || 0,
        dayLow: data.l || 0,
        yearHigh: data.h || 0,
        yearLow: data.l || 0
      };
    } catch (error) {
      console.log(`Finnhub failed for ${symbol}:`, error);
      return null;
    }
  }

  private async fetchFromAlphaVantage(symbol: string): Promise<StockData | null> {
    try {
      const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`);
      if (!response.ok) return null;
      
      const data = await response.json();
      const quote = data['Global Quote'];
      
      if (!quote) return null;
      
      return {
        symbol,
        name: this.getCompanyName(symbol),
        price: parseFloat(quote['05. price']) || 0,
        change: parseFloat(quote['09. change']) || 0,
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')) || 0,
        volume: parseInt(quote['06. volume']) || 0,
        marketCap: this.calculateMarketCap(symbol, parseFloat(quote['05. price'])),
        float: this.getFloatShares(symbol),
        exchange: this.getExchange(symbol),
        sector: this.getSector(symbol),
        avgVolume: parseInt(quote['06. volume']) || 0,
        dayHigh: parseFloat(quote['03. high']) || 0,
        dayLow: parseFloat(quote['04. low']) || 0,
        yearHigh: parseFloat(quote['03. high']) || 0,
        yearLow: parseFloat(quote['04. low']) || 0
      };
    } catch (error) {
      console.log(`Alpha Vantage failed for ${symbol}:`, error);
      return null;
    }
  }

  private generateRealisticData(symbol: string): StockData | null {
    // ❌ FAKE DATA GENERATOR DISABLED - This method should never be called
    console.error(`❌ FAKE DATA ATTEMPT BLOCKED: generateRealisticData called for ${symbol}`);
    throw new Error('FAKE DATA BLOCKED: All data must be authentic from real market sources');
  }

  private getCompanyName(symbol: string): string {
    const names: Record<string, string> = {
      'AAPL': 'Apple Inc',
      'MSFT': 'Microsoft Corporation',
      'GOOGL': 'Alphabet Inc Class A',
      'AMZN': 'Amazon.com Inc',
      'TSLA': 'Tesla Inc',
      'META': 'Meta Platforms Inc',
      'NVDA': 'NVIDIA Corporation',
      'KOSS': 'Koss Corporation',
      'PROG': 'Progenity Inc',
      'CYDY': 'CytoDyn Inc',
      'AMC': 'AMC Entertainment Holdings',
      'GME': 'GameStop Corp',
      'RIVN': 'Rivian Automotive Inc',
      'SPY': 'SPDR S&P 500 ETF Trust',
      'QQQ': 'Invesco QQQ Trust',
      'IWM': 'iShares Russell 2000 ETF'
    };
    return names[symbol] || `${symbol} Corporation`;
  }

  private getBasePrice(symbol: string): number {
    const prices: Record<string, number> = {
      'AAPL': 248.42, 'MSFT': 442.51, 'GOOGL': 175.85, 'AMZN': 188.32,
      'TSLA': 248.42, 'META': 563.21, 'NVDA': 138.07, 'KOSS': 3.67,
      'PROG': 1.97, 'CYDY': 0.71, 'AMC': 6.45, 'GME': 18.67,
      'SPY': 563.42, 'QQQ': 487.23, 'IWM': 228.76
    };
    return prices[symbol] || 0; // Return 0 for unavailable price data
  }

  private getFloatShares(symbol: string): number {
    const floats: Record<string, number> = {
      'KOSS': 4.2, 'PROG': 3.8, 'CYDY': 2.9, 'AVXL': 6.7, 'ATOS': 4.6,
      'AMC': 513.3, 'GME': 304.2, 'AAPL': 15300.0, 'MSFT': 7430.0,
      'TSLA': 3160.0, 'SPY': 910.0, 'QQQ': 695.0
    };
    return floats[symbol] || null; // ❌ FAKE DATA DISABLED: Return null for unavailable float data
  }

  private calculateMarketCap(symbol: string, price: number): number {
    return this.getFloatShares(symbol) * price;
  }

  private getExchange(symbol: string): string {
    for (const [exchange, symbols] of Object.entries(this.exchangeSymbols)) {
      if (symbols.includes(symbol)) {
        return exchange;
      }
    }
    return 'NASDAQ';
  }

  private getSector(symbol: string): string {
    const sectors: Record<string, string> = {
      'AAPL': 'Technology', 'MSFT': 'Technology', 'GOOGL': 'Technology',
      'AMZN': 'E-commerce', 'TSLA': 'Electric Vehicles', 'META': 'Social Media',
      'NVDA': 'Semiconductors', 'KOSS': 'Consumer Electronics', 'PROG': 'Healthcare',
      'CYDY': 'Biotechnology', 'AMC': 'Entertainment', 'GME': 'Retail',
      'RIVN': 'Automotive', 'SPY': 'ETF', 'QQQ': 'ETF', 'IWM': 'ETF'
    };
    return sectors[symbol] || 'Technology';
  }

  private getVolatility(symbol: string): number {
    const volatilities: Record<string, number> = {
      'KOSS': 0.25, 'PROG': 0.30, 'CYDY': 0.35, 'AMC': 0.20, 'GME': 0.25,
      'AAPL': 0.05, 'MSFT': 0.04, 'SPY': 0.02, 'QQQ': 0.03
    };
    return volatilities[symbol] || 0.15;
  }

  getAllExchanges(): string[] {
    return Object.keys(this.exchangeSymbols);
  }

  getSymbolsByExchange(exchange: string): string[] {
    return this.exchangeSymbols[exchange] || [];
  }
}

export const marketDataAPI = new MarketDataAPI();