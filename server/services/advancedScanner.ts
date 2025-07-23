import { multiSourceMarketDataService as marketDataService, QuoteData } from './multiSourceMarketData';
import { sentimentEngine } from './sentimentEngine';

export interface ScannerFilter {
  minPrice?: number;
  maxPrice?: number;
  minVolume?: number;
  minMarketCap?: number;
  maxMarketCap?: number;
  minPercentChange?: number;
  maxPercentChange?: number;
  sectors?: string[];
  excludePennyStocks?: boolean;
}

export interface AdvancedStockData extends QuoteData {
  float?: number;
  shortInterest?: number;
  institutionalOwnership?: number;
  insiderTrading?: number;
  momentum?: number;
  volatility?: number;
  rsi?: number;
  macd?: number;
  sentiment?: number;
  optionsFlow?: 'bullish' | 'bearish' | 'neutral';
}

export class AdvancedScanner {
  private readonly DEFAULT_WATCHLIST = [
    // High-volume momentum stocks
    'NVDA', 'TSLA', 'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'AMD',
    // Small cap high-growth potential
    'PLTR', 'RIVN', 'LCID', 'SOFI', 'ARKK', 'QQQ', 'SPY', 'IWM',
    // Meme/Reddit favorites
    'GME', 'AMC', 'BB', 'NOK', 'SNDL', 'CLOV',
    // Biotech high-volatility
    'MRNA', 'NVAX', 'BNTX', 'JNJ', 'PFE',
    // ETFs and leveraged plays
    'SOXL', 'TQQQ', 'SPXL', 'UPRO', 'TNA',
    // Emerging sectors
    'COIN', 'HOOD', 'SQ', 'PYPL', 'NFLX', 'DIS', 'UBER', 'LYFT'
  ];

  async performAdvancedScan(filters?: ScannerFilter): Promise<AdvancedStockData[]> {
    console.log('Starting advanced market scan...');
    
    try {
      // Get basic quotes for all symbols
      const quotes = await marketDataService.getMultipleQuotes(this.DEFAULT_WATCHLIST);
      
      // Filter based on criteria
      const filteredQuotes = this.applyFilters(quotes, filters);
      
      // Enhance with technical and sentiment data
      const enhancedData = await this.enhanceWithTechnicalData(filteredQuotes);
      
      // Sort by momentum/opportunity score
      const sortedResults = this.rankByOpportunity(enhancedData);
      
      console.log(`Advanced scan completed. Found ${sortedResults.length} opportunities.`);
      return sortedResults;
      
    } catch (error) {
      console.error('Error in advanced scan:', error);
      return [];
    }
  }

  private applyFilters(quotes: QuoteData[], filters?: ScannerFilter): QuoteData[] {
    if (!filters) return quotes;
    
    return quotes.filter(quote => {
      // Price filters
      if (filters.minPrice && quote.price < filters.minPrice) return false;
      if (filters.maxPrice && quote.price > filters.maxPrice) return false;
      
      // Volume filter (convert volume string to number)
      if (filters.minVolume) {
        const volume = this.parseVolume(quote.volume);
        if (volume < filters.minVolume) return false;
      }
      
      // Percent change filters
      if (filters.minPercentChange && quote.changePercent < filters.minPercentChange) return false;
      if (filters.maxPercentChange && quote.changePercent > filters.maxPercentChange) return false;
      
      // Exclude penny stocks
      if (filters.excludePennyStocks && quote.price < 5) return false;
      
      return true;
    });
  }

  private parseVolume(volumeStr: string): number {
    if (!volumeStr) return 0;
    const num = parseFloat(volumeStr);
    if (volumeStr.includes('M')) return num * 1000000;
    if (volumeStr.includes('K')) return num * 1000;
    return num;
  }

  private async enhanceWithTechnicalData(quotes: QuoteData[]): Promise<AdvancedStockData[]> {
    const enhanced: AdvancedStockData[] = [];
    
    for (const quote of quotes) {
      const enhancedStock: AdvancedStockData = {
        ...quote,
        float: null, // ❌ FAKE DATA DISABLED: Must use authentic float data from real APIs
        shortInterest: null, // ❌ FAKE DATA DISABLED: Must use authentic short interest APIs
        institutionalOwnership: null, // ❌ FAKE DATA DISABLED: Must use authentic institutional data APIs
        insiderTrading: null, // ❌ FAKE DATA DISABLED: Must use authentic insider trading APIs
        momentum: this.calculateMomentum(quote),
        volatility: Math.abs(quote.changePercent), // Use actual price change only, no fake multiplier
        rsi: null, // ❌ FAKE DATA DISABLED: Must use authentic RSI calculations from real APIs
        macd: null, // ❌ FAKE DATA DISABLED: Must use authentic MACD calculations from real APIs
        sentiment: null, // ❌ FAKE DATA DISABLED: Must use authentic sentiment APIs
        optionsFlow: 'neutral' // ❌ FAKE DATA DISABLED: Must use authentic options flow APIs
      };
      
      enhanced.push(enhancedStock);
    }
    
    return enhanced;
  }

  private simulateFloat(): number {
    // ❌ FAKE DATA DISABLED: Must use authentic float data from real APIs
    console.error('❌ FAKE FLOAT BLOCKED: simulateFloat called in advancedScanner');
    throw new Error('NO FAKE FLOAT DATA: Must use authentic shares outstanding data from real market APIs');
  }

  private calculateMomentum(quote: QuoteData): number {
    // Simple momentum based on price change and volume
    const volume = this.parseVolume(quote.volume);
    const priceMultiplier = Math.abs(quote.changePercent) / 100;
    const volumeMultiplier = Math.min(volume / 1000000, 10); // Cap at 10M
    
    return priceMultiplier * volumeMultiplier * (quote.changePercent > 0 ? 1 : -1);
  }

  private getRandomOptionsFlow(): 'bullish' | 'bearish' | 'neutral' {
    // ❌ FAKE DATA DISABLED: Must use authentic options flow APIs
    console.error('❌ FAKE OPTIONS FLOW BLOCKED: getRandomOptionsFlow called in advancedScanner');
    throw new Error('NO FAKE OPTIONS FLOW: Must use authentic options flow data from real market APIs');
  }

  private rankByOpportunity(stocks: AdvancedStockData[]): AdvancedStockData[] {
    return stocks.sort((a, b) => {
      // Multi-factor scoring
      const scoreA = this.calculateOpportunityScore(a);
      const scoreB = this.calculateOpportunityScore(b);
      
      return scoreB - scoreA; // Descending order
    });
  }

  private calculateOpportunityScore(stock: AdvancedStockData): number {
    let score = 0;
    
    // Momentum factor (30% weight)
    score += (stock.momentum || 0) * 30;
    
    // Volume factor (20% weight)
    const volume = this.parseVolume(stock.volume);
    score += Math.min(volume / 1000000, 10) * 20;
    
    // Price change factor (25% weight)
    score += Math.abs(stock.changePercent) * 25;
    
    // RSI oversold/overbought factor (15% weight)
    if (stock.rsi && (stock.rsi < 30 || stock.rsi > 70)) {
      score += 15;
    }
    
    // Sentiment factor (10% weight)
    if (stock.sentiment) {
      score += (stock.sentiment / 100) * 10;
    }
    
    return score;
  }

  // Predefined scanning strategies
  async scanMomentumBreakouts(): Promise<AdvancedStockData[]> {
    return this.performAdvancedScan({
      minPercentChange: 3,
      minVolume: 1000000,
      excludePennyStocks: true
    });
  }

  async scanLowFloatHighVolume(): Promise<AdvancedStockData[]> {
    const results = await this.performAdvancedScan({
      minVolume: 5000000,
      excludePennyStocks: true
    });
    
    // Filter for low float (simulated)
    return results.filter(stock => stock.float && stock.float < 100);
  }

  async scanOversoldBounce(): Promise<AdvancedStockData[]> {
    const results = await this.performAdvancedScan({
      maxPercentChange: -2,
      minVolume: 500000
    });
    
    // Filter for potential bounce candidates
    return results.filter(stock => stock.rsi && stock.rsi < 35);
  }
}

export const advancedScanner = new AdvancedScanner();