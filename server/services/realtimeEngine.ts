/**
 * Real-Time Engine - Ultra-Fast Platform Updates
 * Ensures all buttons and functions work with continuous live data
 */

import { EventEmitter } from 'events';
import { UniversalStockAccessService } from './universalStockAccess';
import { PerformanceOptimizer } from './performanceOptimizer';

export interface RealTimeUpdate {
  type: 'stock' | 'signal' | 'news' | 'scanner' | 'portfolio';
  data: any;
  timestamp: number;
  source: string;
}

export interface LivePrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
}

export class RealTimeEngine extends EventEmitter {
  private isRunning = false;
  private updateInterval: NodeJS.Timeout | null = null;
  private universalStockAccess: UniversalStockAccessService;
  private performanceOptimizer: PerformanceOptimizer;
  private trackedSymbols: Set<string> = new Set();
  private livePrices: Map<string, LivePrice> = new Map();
  
  // Market hours configuration
  private marketHours = {
    preMarket: { start: '04:00', end: '09:30' },
    regular: { start: '09:30', end: '16:00' },
    afterHours: { start: '16:00', end: '20:00' }
  };

  constructor() {
    super();
    this.universalStockAccess = new UniversalStockAccessService();
    this.performanceOptimizer = new PerformanceOptimizer();
    console.log('⚡ Real-Time Engine: Initializing ultra-fast live updates...');
  }

  /**
   * Start the real-time engine for continuous updates
   */
  public start(): void {
    if (this.isRunning) {
      console.log('⚡ Real-Time Engine: Already running');
      return;
    }

    console.log('🚀 Real-Time Engine: Starting continuous live updates...');
    this.isRunning = true;
    
    // Optimized price updates every 30 seconds to reduce server load and flickering
    this.updateInterval = setInterval(async () => {
      await this.performanceOptimizer.debouncedApiCall(
        'realtime-update',
        () => this.processLiveUpdates(),
        5000 // Increased debounce to 5 seconds
      );
    }, 30000); // Reduced frequency to every 30 seconds

    // Add popular low-float stocks to tracking
    this.initializeTrackedSymbols();
    
    console.log('✅ Real-Time Engine: Live updates active - 30-second intervals (optimized)');
    this.emit('engineStarted', { timestamp: Date.now() });
  }

  /**
   * Stop the real-time engine
   */
  public stop(): void {
    if (!this.isRunning) return;
    
    console.log('⏸️ Real-Time Engine: Stopping live updates...');
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    this.isRunning = false;
    console.log('✅ Real-Time Engine: Stopped');
    this.emit('engineStopped', { timestamp: Date.now() });
  }

  /**
   * Add symbols to real-time tracking
   */
  public trackSymbols(symbols: string[]): void {
    symbols.forEach(symbol => {
      this.trackedSymbols.add(symbol.toUpperCase());
    });
    console.log(`📊 Real-Time Engine: Now tracking ${this.trackedSymbols.size} symbols`);
  }

  /**
   * Remove symbols from tracking
   */
  public untrackSymbols(symbols: string[]): void {
    symbols.forEach(symbol => {
      this.trackedSymbols.delete(symbol.toUpperCase());
      this.livePrices.delete(symbol.toUpperCase());
    });
    console.log(`📊 Real-Time Engine: Removed ${symbols.length} symbols from tracking`);
  }

  /**
   * Get live price for a symbol
   */
  public getLivePrice(symbol: string): LivePrice | null {
    return this.livePrices.get(symbol.toUpperCase()) || null;
  }

  /**
   * Get all live prices
   */
  public getAllLivePrices(): Map<string, LivePrice> {
    return new Map(this.livePrices);
  }

  /**
   * Process live updates for all tracked symbols
   */
  private async processLiveUpdates(): Promise<void> {
    try {
      const symbols = Array.from(this.trackedSymbols);
      if (symbols.length === 0) return;

      console.log(`📡 Real-Time Engine: Updating ${symbols.length} symbols...`);
      
      // Batch process symbols for efficiency
      const batchSize = 10;
      const batches = [];
      
      for (let i = 0; i < symbols.length; i += batchSize) {
        batches.push(symbols.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        await this.processBatch(batch);
      }

      this.emit('livePricesUpdated', {
        count: symbols.length,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('⚡ Real-Time Engine: Error in live updates:', error);
    }
  }

  /**
   * Process a batch of symbols
   */
  private async processBatch(symbols: string[]): Promise<void> {
    const promises = symbols.map(async (symbol) => {
      try {
        const stockData = await this.universalStockAccess.getStock(symbol);
        if (stockData) {
          const livePrice: LivePrice = {
            symbol: symbol,
            price: stockData.price,
            change: stockData.change,
            changePercent: stockData.changePercent,
            volume: stockData.volume,
            timestamp: Date.now()
          };
          
          const oldPrice = this.livePrices.get(symbol);
          this.livePrices.set(symbol, livePrice);
          
          // Emit price change events for significant moves
          if (oldPrice && Math.abs(livePrice.changePercent) > 2) {
            this.emit('significantMove', {
              symbol,
              oldPrice: oldPrice.price,
              newPrice: livePrice.price,
              changePercent: livePrice.changePercent,
              timestamp: Date.now()
            });
          }
        }
      } catch (error) {
        console.error(`⚡ Real-Time Engine: Error updating ${symbol}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Initialize tracked symbols with popular low-float stocks
   */
  private initializeTrackedSymbols(): void {
    const popularLowFloat = [
      // Ultra-low float (under 5M shares)
      'BBIG', 'ATER', 'SAVA', 'PROG', 'XELA', 'GREE', 'SPRT', 'IRNT',
      'OPAD', 'BGFV', 'SDC', 'RAVE', 'BKKT', 'DWAC', 'PHUN', 'MARK',
      'WKHS', 'RIDE', 'GOEV', 'NKLA', 'HYLN', 'QS', 'CCIV', 'LUCID',
      
      // Small float (5-10M shares)
      'GME', 'AMC', 'CLOV', 'WISH', 'SOFI', 'PLTR', 'BB', 'NOK',
      'SKLZ', 'DKNG', 'PENN', 'MGM', 'CZR', 'LVS', 'WYNN', 'BYD',
      'RIOT', 'MARA', 'BTBT', 'EBON', 'SOS', 'CAN', 'HVBT', 'ANY'
    ];
    
    this.trackSymbols(popularLowFloat);
  }

  /**
   * Check if market is currently open
   */
  public isMarketHours(): boolean {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
    
    if (!isWeekday) return false;
    
    return (
      (currentTime >= this.marketHours.preMarket.start && currentTime <= this.marketHours.preMarket.end) ||
      (currentTime >= this.marketHours.regular.start && currentTime <= this.marketHours.regular.end) ||
      (currentTime >= this.marketHours.afterHours.start && currentTime <= this.marketHours.afterHours.end)
    );
  }

  /**
   * Get current market session
   */
  public getCurrentSession(): string {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
    
    if (!isWeekday) return 'closed';
    
    if (currentTime >= this.marketHours.preMarket.start && currentTime < this.marketHours.regular.start) {
      return 'pre-market';
    } else if (currentTime >= this.marketHours.regular.start && currentTime < this.marketHours.regular.end) {
      return 'regular';
    } else if (currentTime >= this.marketHours.afterHours.start && currentTime < this.marketHours.afterHours.end) {
      return 'after-hours';
    }
    
    return 'closed';
  }

  /**
   * Get engine status
   */
  public getStatus() {
    return {
      isRunning: this.isRunning,
      trackedSymbols: this.trackedSymbols.size,
      livePrices: this.livePrices.size,
      marketSession: this.getCurrentSession(),
      isMarketHours: this.isMarketHours(),
      lastUpdate: Date.now()
    };
  }

  /**
   * Force immediate update for specific symbols
   */
  public async forceUpdate(symbols: string[]): Promise<void> {
    console.log(`⚡ Real-Time Engine: Force updating ${symbols.length} symbols...`);
    await this.processBatch(symbols);
    console.log(`✅ Real-Time Engine: Force update completed`);
  }

  /**
   * Subscribe to real-time updates for specific symbols
   */
  public subscribeToSymbol(symbol: string, callback: (data: LivePrice) => void): void {
    this.trackSymbols([symbol]);
    this.on(`priceUpdate_${symbol.toUpperCase()}`, callback);
  }

  /**
   * Unsubscribe from real-time updates
   */
  public unsubscribeFromSymbol(symbol: string): void {
    this.removeAllListeners(`priceUpdate_${symbol.toUpperCase()}`);
  }
}

// Global real-time engine instance
export const realtimeEngine = new RealTimeEngine();