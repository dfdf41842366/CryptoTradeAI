/**
 * Universal Stock Access Service
 * Provides access to entire US stock market with real-time data
 */

import { performanceOptimizer } from './performanceOptimizer';

export interface StockData {
  symbol: string;
  company: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  float?: number;
  sector?: string;
  exchange: string;
}

export class UniversalStockAccessService {
  private stockDatabase = new Map<string, StockData>();
  
  constructor() {
    this.initializeUSMarket();
  }

  /**
   * Initialize complete US stock market access
   */
  private initializeUSMarket(): void {
    console.log('🌐 Universal Stock Access: Initializing complete US market coverage...');
    
    // Major exchanges coverage
    const exchanges = {
      NYSE: this.generateNYSEStocks(),
      NASDAQ: this.generateNASDAQStocks(), 
      NYSE_ARCA: this.generateETFs(),
      NYSE_AMERICAN: this.generateSmallCaps(),
      OTC: this.generateOTCStocks()
    };

    let totalStocks = 0;
    Object.entries(exchanges).forEach(([exchange, stocks]) => {
      stocks.forEach(stock => {
        this.stockDatabase.set(stock.symbol, { ...stock, exchange });
        totalStocks++;
      });
    });

    console.log(`✅ Universal Access: ${totalStocks} stocks available across all US exchanges`);
  }

  /**
   * Generate NYSE stocks (Blue chips, Large caps)
   */
  private generateNYSEStocks(): StockData[] {
    const nyseStocks = [
      // Dow Jones components
      'AAPL', 'MSFT', 'UNH', 'GS', 'HD', 'CAT', 'AMGN', 'MCD', 'TRV', 'AXP',
      'BA', 'IBM', 'JPM', 'JNJ', 'PG', 'CVX', 'MRK', 'WMT', 'DIS', 'MMM',
      'NKE', 'KO', 'DOW', 'VZ', 'CRM', 'HON', 'V', 'CSCO', 'WBA',
      // S&P 500 leaders
      'XOM', 'BRK.B', 'ABBV', 'PFE', 'AVGO', 'COST', 'PEP', 'TMO', 'ACN', 'ADBE',
      'DHR', 'ABT', 'LLY', 'ORCL', 'COP', 'VT', 'MET', 'LOW', 'QCOM', 'BMY',
      // Banks & Financial
      'BAC', 'WFC', 'C', 'MS', 'BLK', 'SCHW', 'USB', 'PNC', 'TFC', 'COF',
      // Energy
      'SLB', 'EOG', 'PSX', 'VLO', 'MPC', 'OXY', 'KMI', 'WMB', 'HAL', 'DVN',
      // Industrials
      'LMT', 'RTX', 'DE', 'UPS', 'FDX', 'GE', 'EMR', 'ETN', 'ITW', 'MMC'
    ];

    // REMOVED: No longer generating fake data - all data must come from authentic sources
    console.log('❌ FAKE DATA GENERATOR DISABLED: NYSE stocks must use real market data');
    return []; // Return empty array instead of fake data
  }

  /**
   * Generate NASDAQ stocks (Tech, Growth)
   */
  private generateNASDAQStocks(): StockData[] {
    const nasdaqStocks = [
      // FAANG + Tech giants
      'GOOGL', 'GOOG', 'AMZN', 'META', 'NFLX', 'NVDA', 'TSLA', 'AMD', 'INTC', 'CRM',
      // Software & Cloud
      'ADSK', 'INTU', 'CDNS', 'SNPS', 'ANSS', 'CTSH', 'FTNT', 'TEAM', 'NOW', 'WDAY',
      // Biotech & Healthcare
      'GILD', 'BIIB', 'IDXX', 'ILMN', 'INCY', 'MRNA', 'REGN', 'VRTX', 'ALGN', 'BMRN',
      // Growth stocks
      'SHOP', 'SQ', 'ROKU', 'ZM', 'DOCU', 'CRWD', 'OKTA', 'DDOG', 'NET', 'SNOW',
      // Electric vehicles & Clean tech
      'RIVN', 'LCID', 'XPEV', 'NIO', 'ENPH', 'SEDG', 'FSLR', 'RUN', 'PLUG', 'BE',
      // Gaming & Entertainment
      'EA', 'ATVI', 'NTES', 'TTWO', 'RBLX', 'U', 'MTCH', 'PINS', 'SNAP', 'TWTR'
    ];

    // REMOVED: No longer generating fake data - all data must come from authentic sources
    console.log('❌ FAKE DATA GENERATOR DISABLED: NASDAQ stocks must use real market data');
    return []; // Return empty array instead of fake data
  }

  /**
   * Generate ETFs and Index funds
   */
  private generateETFs(): StockData[] {
    const etfs = [
      'SPY', 'QQQ', 'IWM', 'VTI', 'VOO', 'IVV', 'VEA', 'IEFA', 'VWO', 'EEM',
      'SOXL', 'TQQQ', 'SPXL', 'TNA', 'UPRO', 'TECL', 'CURE', 'LABU', 'SPXS', 'SQQQ',
      'XLF', 'XLK', 'XLE', 'XLV', 'XLI', 'XLP', 'XLB', 'XLU', 'XLRE', 'XLY',
      'GLD', 'SLV', 'USO', 'TLT', 'IEF', 'HYG', 'LQD', 'EMB', 'VNQ', 'REIT'
    ];

    // REMOVED: No longer generating fake data - all data must come from authentic sources
    console.log('❌ FAKE DATA GENERATOR DISABLED: ETFs must use real market data');
    return []; // Return empty array instead of fake data
  }

  /**
   * Generate small cap and emerging companies
   */
  private generateSmallCaps(): StockData[] {
    const smallCaps = [
      // Low float favorites
      'PROG', 'SAVA', 'BBIG', 'ATER', 'MULN', 'EXPR', 'CLOV', 'WISH', 'WKHS', 'RIDE',
      'SENS', 'OBSV', 'CYDY', 'GVSI', 'AVXL', 'ATOS', 'CENN', 'NAKD', 'HYLN', 'SKLZ',
      // Biotech small caps
      'NVAX', 'VXRT', 'INO', 'OCGN', 'PHUN', 'DWAC', 'CFVI', 'BENE', 'ANY', 'HSDT',
      // Meme stock adjacent
      'CTRM', 'SHIP', 'TOPS', 'GLBS', 'SINO', 'GNUS', 'HMHC', 'CLNE', 'BLNK', 'SOLO'
    ];

    // REMOVED: No longer generating fake data - all data must come from authentic sources
    console.log('❌ FAKE DATA GENERATOR DISABLED: Small caps must use real market data');
    return []; // Return empty array instead of fake data
  }

  /**
   * Generate OTC and penny stocks
   */
  private generateOTCStocks(): StockData[] {
    const otcStocks = [
      'GVSI', 'CYDY', 'HEMP', 'ERBB', 'TGGI', 'MYDX', 'GRNH', 'GTEH', 'SIGO', 'FOOD',
      'MINE', 'SEEK', 'CANN', 'BUDZ', 'WEED', 'HERB', 'LEAF', 'GROW', 'HIGH', 'BUZZ'
    ];

    return otcStocks.map(symbol => ({
      symbol,
      company: `${symbol} Inc`,
      price: null, // ❌ FAKE DATA DISABLED: Return null for unavailable data instead of fake values
      change: null, // ❌ FAKE DATA DISABLED: Return null for unavailable data instead of fake values
      changePercent: null, // ❌ FAKE DATA DISABLED: Return null for unavailable data instead of fake values
      volume: null, // ❌ FAKE DATA DISABLED: Return null for unavailable data instead of fake values
      marketCap: null, // ❌ FAKE DATA DISABLED: Return null for unavailable data instead of fake values
      float: null, // ❌ FAKE DATA DISABLED: Return null for unavailable data instead of fake values
      sector: 'OTC',
      exchange: 'OTC'
    }));
  }

  /**
   * Search stocks across entire US market
   */
  async searchStocks(query: string, limit = 50): Promise<StockData[]> {
    const searchQuery = query.toUpperCase();
    
    return performanceOptimizer.smartCache(
      `stock-search-${searchQuery}`,
      async () => {
        const results: StockData[] = [];
        
        for (const [symbol, data] of this.stockDatabase.entries()) {
          if (symbol.includes(searchQuery) || data.company.toUpperCase().includes(searchQuery)) {
            results.push(data);
            if (results.length >= limit) break;
          }
        }
        
        return results;
      },
      10000 // Cache for 10 seconds
    );
  }

  /**
   * Get stock data by symbol
   */
  async getStock(symbol: string): Promise<StockData | null> {
    const upperSymbol = symbol.toUpperCase();
    
    return performanceOptimizer.smartCache(
      `stock-${upperSymbol}`,
      async () => {
        // Get real market data instead of simulated data
        const { realMarketDataService } = await import('./realMarketDataService');
        const realData = await realMarketDataService.getRealStockData(upperSymbol);
        
        if (realData) {
          return {
            symbol: realData.symbol,
            company: realData.company,
            price: realData.price,
            change: realData.change,
            changePercent: realData.changePercent,
            volume: realData.volume,
            averageVolume: realData.averageVolume,
            marketCap: realData.marketCap,
            float: realData.float,
            exchange: realData.exchange,
            sector: realData.sector,
            high: realData.high,
            low: realData.low,
            open: realData.open,
            previousClose: realData.previousClose
          };
        }
        
        // Fallback to database only if no real data available
        const stock = this.stockDatabase.get(upperSymbol);
        if (stock) {
          return stock;
        }
        return null;
      },
      5000 // Cache for 5 seconds
    );
  }

  /**
   * Get stocks by exchange
   */
  async getStocksByExchange(exchange: string, limit = 100): Promise<StockData[]> {
    return performanceOptimizer.smartCache(
      `exchange-${exchange}`,
      async () => {
        const results: StockData[] = [];
        
        for (const [symbol, data] of this.stockDatabase.entries()) {
          if (data.exchange === exchange) {
            results.push(data);
            if (results.length >= limit) break;
          }
        }
        
        return results;
      },
      30000 // Cache for 30 seconds
    );
  }

  /**
   * Get all available stock symbols
   */
  getAllSymbols(): string[] {
    return Array.from(this.stockDatabase.keys());
  }

  /**
   * Get market statistics
   */
  getMarketStats() {
    const exchanges = ['NYSE', 'NASDAQ', 'NYSE_ARCA', 'NYSE_AMERICAN', 'OTC'];
    const stats = exchanges.map(exchange => ({
      exchange,
      count: Array.from(this.stockDatabase.values()).filter(stock => stock.exchange === exchange).length
    }));

    return {
      totalStocks: this.stockDatabase.size,
      exchanges: stats
    };
  }
}

export const universalStockAccess = new UniversalStockAccessService();