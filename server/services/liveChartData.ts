import { marketDataAPI } from "./marketDataAPI";

interface CandlestickData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface LiveChartData {
  symbol: string;
  timeframe: string;
  data: CandlestickData[];
  lastUpdate: number;
}

class LiveChartDataService {
  private cache = new Map<string, LiveChartData>();
  private subscribers = new Map<string, Set<(data: LiveChartData) => void>>();
  private intervals = new Map<string, NodeJS.Timeout>();
  private priceCache = new Map<string, { price: number, timestamp: number, trend: number }>();
  private marketSession: 'pre' | 'regular' | 'after' | 'closed' = 'regular';

  // ❌ FAKE DATA DISABLED: Must use authentic price movement data from real APIs
  private generatePriceMovement(lastClose: number, volatility: number = 0.02, trend: number = 0): number {
    console.error('❌ FAKE PRICE MOVEMENT BLOCKED: generatePriceMovement called in liveChartData');
    throw new Error('NO FAKE PRICE MOVEMENT: Must use authentic price data from real market APIs');
  }

  // ❌ FAKE DATA DISABLED: Must use authentic volume data from real APIs
  private generateVolume(baseVolume: number): number {
    console.error('❌ FAKE VOLUME BLOCKED: generateVolume called in liveChartData');
    throw new Error('NO FAKE VOLUME DATA: Must use authentic volume data from real market APIs');
  }

  // Create initial candlestick data based on real market data
  private async createInitialData(symbol: string, timeframe: string): Promise<CandlestickData[]> {
    try {
      // Get authentic market data as starting point - never use fallback
      const stockData = await marketDataAPI.getStockData(symbol);
      if (!stockData || !stockData.price) {
        throw new Error(`Failed to fetch authentic market data for ${symbol}`);
      }
      
      const currentPrice = stockData.price;
      const baseVolume = stockData.volume || stockData.averageVolume || 1000000;
      
      const periods = this.getPeriodsForTimeframe(timeframe);
      const data: CandlestickData[] = [];
      const now = Date.now();
      
      let lastClose = currentPrice * 0.95; // Start slightly below current price
      
      for (let i = periods - 1; i >= 0; i--) {
        const timestamp = now - (i * this.getTimeframeMs(timeframe));
        const open = lastClose;
        const volatility = this.getVolatilityForTimeframe(timeframe);
        
        // ❌ FAKE DATA DISABLED: All OHLC generation must use authentic data from real APIs
        console.error('❌ FAKE OHLC BLOCKED: createInitialData attempting to generate fake candlestick data');
        throw new Error('NO FAKE CANDLESTICK DATA: Must use authentic historical OHLC data from real market APIs');
        
        data.push({
          timestamp,
          open,
          high,
          low,
          close,
          volume
        });
        
        lastClose = close;
      }
      
      return data;
    } catch (error) {
      console.error(`Error creating initial data for ${symbol}:`, error);
      // Return empty array to trigger error state in UI - no fallback synthetic data
      return [];
    }
  }

  // Fetch authentic historical data from APIs
  private async fetchHistoricalData(symbol: string, timeframe: string): Promise<CandlestickData[]> {
    try {
      // Try to get real historical data from market API
      const stockData = await marketDataAPI.getStockData(symbol);
      if (!stockData || !stockData.price) {
        throw new Error(`No authentic market data available for ${symbol}`);
      }

      // For now, we'll create a minimal set with just current data point
      // In a production system, this would call a historical data API
      const currentPrice = stockData.price;
      const currentVolume = stockData.volume || stockData.averageVolume || 1000000;
      const now = Date.now();
      
      // Create a single authentic data point with current market data
      const data: CandlestickData[] = [{
        timestamp: now,
        open: currentPrice,
        high: currentPrice,
        low: currentPrice,
        close: currentPrice,
        volume: currentVolume
      }];
      
      return data;
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      return []; // Return empty array to indicate no authentic data available
    }
  }

  private getBasePriceForSymbol(symbol: string): number {
    const prices: Record<string, number> = {
      'TSLA': 248.75,
      'AAPL': 195.50,
      'MSFT': 420.25,
      'GOOGL': 165.80,
      'AMZN': 178.25,
      'NVDA': 875.30,
      'META': 485.60,
      'SPY': 470.25,
      'QQQ': 390.85,
      'IWM': 220.45
    };
    return prices[symbol] || 100;
  }

  private getPeriodsForTimeframe(timeframe: string): number {
    const periods: Record<string, number> = {
      '1m': 60,    // 1 hour of 1-minute candles
      '5m': 48,    // 4 hours of 5-minute candles
      '15m': 32,   // 8 hours of 15-minute candles
      '30m': 48,   // 24 hours of 30-minute candles
      '1H': 24,    // 24 hours of 1-hour candles
      '4H': 30,    // 5 days of 4-hour candles
      '1D': 30,    // 30 days of daily candles
      '1W': 52,    // 52 weeks of weekly candles
      '1M': 24     // 24 months of monthly candles
    };
    return periods[timeframe] || 30;
  }

  private getTimeframeMs(timeframe: string): number {
    const ms: Record<string, number> = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '30m': 30 * 60 * 1000,
      '1H': 60 * 60 * 1000,
      '4H': 4 * 60 * 60 * 1000,
      '1D': 24 * 60 * 60 * 1000,
      '1W': 7 * 24 * 60 * 60 * 1000,
      '1M': 30 * 24 * 60 * 60 * 1000
    };
    return ms[timeframe] || 60 * 1000;
  }

  private getVolatilityForTimeframe(timeframe: string): number {
    const baseVolatility: Record<string, number> = {
      '1m': 0.005,   // 0.5% for 1-minute
      '5m': 0.01,    // 1% for 5-minute
      '15m': 0.015,  // 1.5% for 15-minute
      '30m': 0.02,   // 2% for 30-minute
      '1H': 0.025,   // 2.5% for 1-hour
      '4H': 0.04,    // 4% for 4-hour
      '1D': 0.06,    // 6% for daily
      '1W': 0.10,    // 10% for weekly
      '1M': 0.15     // 15% for monthly
    };
    
    // Adjust volatility based on market session
    const multiplier = this.getSessionVolatilityMultiplier();
    return (baseVolatility[timeframe] || 0.02) * multiplier;
  }

  // Get current market session
  private getCurrentMarketSession(): 'pre' | 'regular' | 'after' | 'closed' {
    const now = new Date();
    const est = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    const hour = est.getHours();
    const day = est.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Weekend
    if (day === 0 || day === 6) return 'closed';
    
    // Weekday sessions (EST)
    if (hour >= 4 && hour < 9.5) return 'pre'; // 4:00 AM - 9:30 AM
    if (hour >= 9.5 && hour < 16) return 'regular'; // 9:30 AM - 4:00 PM
    if (hour >= 16 && hour < 20) return 'after'; // 4:00 PM - 8:00 PM
    return 'closed';
  }

  private getSessionVolatilityMultiplier(): number {
    const session = this.getCurrentMarketSession();
    switch (session) {
      case 'pre': return 1.8; // Higher volatility pre-market
      case 'regular': return 1.0; // Normal volatility
      case 'after': return 1.5; // Higher volatility after-hours
      case 'closed': return 0.3; // Lower volatility when closed
      default: return 1.0;
    }
  }

  private getVolumeMultiplier(): number {
    const session = this.getCurrentMarketSession();
    switch (session) {
      case 'pre': return 0.4; // Lower volume pre-market
      case 'regular': return 1.0; // Normal volume
      case 'after': return 0.6; // Lower volume after-hours
      case 'closed': return 0.1; // Minimal volume when closed
      default: return 1.0;
    }
  }

  // Get live chart data
  async getChartData(symbol: string, timeframe: string): Promise<LiveChartData> {
    const key = `${symbol}-${timeframe}`;
    
    if (this.cache.has(key)) {
      const cached = this.cache.get(key)!;
      // Return cached data if it's recent (within last update interval)
      const updateInterval = this.getUpdateInterval(timeframe);
      if (Date.now() - cached.lastUpdate < updateInterval) {
        return cached;
      }
    }
    
    // Get real market data first
    const stockData = await marketDataAPI.getStockData(symbol);
    if (!stockData || !stockData.price) {
      throw new Error(`No market data available for ${symbol}`);
    }
    
    const data = await this.fetchHistoricalData(symbol, timeframe);
    const chartData: LiveChartData = {
      symbol,
      timeframe,
      data,
      lastUpdate: Date.now()
    };
    
    this.cache.set(key, chartData);
    return chartData;
  }

  // Start live updates for a chart
  startLiveUpdates(symbol: string, timeframe: string, callback: (data: LiveChartData) => void) {
    const key = `${symbol}-${timeframe}`;
    
    // Add subscriber
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(callback);
    
    // Start interval if not already running
    if (!this.intervals.has(key)) {
      const updateInterval = this.getUpdateInterval(timeframe);
      
      const interval = setInterval(async () => {
        try {
          const chartData = this.cache.get(key);
          if (!chartData || this.subscribers.get(key)?.size === 0) {
            return;
          }
          
          // Update the latest candle or add new one
          const now = Date.now();
          const timeframeMs = this.getTimeframeMs(timeframe);
          const lastCandle = chartData.data[chartData.data.length - 1];
          
          // Check if we need a new candle
          const timeSinceLastCandle = now - lastCandle.timestamp;
          
          if (timeSinceLastCandle >= timeframeMs) {
            // Get or create trend for this symbol
            const cached = this.priceCache.get(key) || { price: lastCandle.close, timestamp: now, trend: 0 };
            const trend = cached.trend; // ❌ FAKE DATA DISABLED: No random trend evolution
            
            // Add new candle
            const newCandle: CandlestickData = {
              timestamp: now,
              open: lastCandle.close,
              high: lastCandle.close,
              low: lastCandle.close,
              close: this.generatePriceMovement(lastCandle.close, this.getVolatilityForTimeframe(timeframe), trend),
              volume: this.generateVolume(lastCandle.volume * this.getVolumeMultiplier())
            };
            
            // Adjust high and low with more realistic spreads
            const spread = this.getVolatilityForTimeframe(timeframe) * 0.5;
            newCandle.high = Math.max(newCandle.open, newCandle.close); // ❌ FAKE DATA DISABLED: No random spreads
            newCandle.low = Math.min(newCandle.open, newCandle.close); // ❌ FAKE DATA DISABLED: No random spreads
            
            // Update price cache
            this.priceCache.set(key, { price: newCandle.close, timestamp: now, trend });
            
            chartData.data.push(newCandle);
            
            // Keep only recent data
            const maxPeriods = this.getPeriodsForTimeframe(timeframe);
            if (chartData.data.length > maxPeriods) {
              chartData.data = chartData.data.slice(-maxPeriods);
            }
          } else {
            // Update current candle with live price movement
            const cached = this.priceCache.get(key) || { price: lastCandle.close, timestamp: now, trend: 0 };
            const volatility = this.getVolatilityForTimeframe(timeframe) * 0.3; // Smaller moves for intra-candle updates
            
            // Generate new price with trend continuation
            const currentPrice = this.generatePriceMovement(cached.price, volatility, cached.trend);
            
            lastCandle.close = currentPrice;
            lastCandle.high = Math.max(lastCandle.high, currentPrice);
            lastCandle.low = Math.min(lastCandle.low, currentPrice);
            lastCandle.volume += this.generateVolume(lastCandle.volume * 0.05 * this.getVolumeMultiplier());
            
            // Update price cache with slight trend evolution
            const newTrend = cached.trend; // ❌ FAKE DATA DISABLED: No random trend updates
            this.priceCache.set(key, { price: currentPrice, timestamp: now, trend: newTrend });
          }
          
          chartData.lastUpdate = now;
          
          // Notify all subscribers
          const subscribers = this.subscribers.get(key);
          if (subscribers) {
            subscribers.forEach(cb => cb(chartData));
          }
          
        } catch (error) {
          console.error(`Error updating live data for ${key}:`, error);
        }
      }, updateInterval);
      
      this.intervals.set(key, interval);
    }
  }

  // Stop live updates
  stopLiveUpdates(symbol: string, timeframe: string, callback?: (data: LiveChartData) => void) {
    const key = `${symbol}-${timeframe}`;
    const subscribers = this.subscribers.get(key);
    
    if (subscribers) {
      if (callback) {
        subscribers.delete(callback);
      } else {
        subscribers.clear();
      }
      
      // Stop interval if no subscribers left
      if (subscribers.size === 0) {
        const interval = this.intervals.get(key);
        if (interval) {
          clearInterval(interval);
          this.intervals.delete(key);
        }
      }
    }
  }

  private getUpdateInterval(timeframe: string): number {
    // Update intervals (how often to update the chart)
    const intervals: Record<string, number> = {
      '1m': 5000,    // 5 seconds for 1-minute charts
      '5m': 15000,   // 15 seconds for 5-minute charts
      '15m': 30000,  // 30 seconds for 15-minute charts
      '30m': 60000,  // 1 minute for 30-minute charts
      '1H': 120000,  // 2 minutes for 1-hour charts
      '4H': 300000,  // 5 minutes for 4-hour charts
      '1D': 600000,  // 10 minutes for daily charts
      '1W': 1800000, // 30 minutes for weekly charts
      '1M': 3600000  // 1 hour for monthly charts
    };
    return intervals[timeframe] || 30000;
  }

  // Get current price for a symbol (authentic API data only)
  async getCurrentPrice(symbol: string): Promise<number> {
    try {
      // Always get fresh authentic market data
      const stockData = await marketDataAPI.getStockData(symbol);
      if (!stockData || typeof stockData.price !== 'number') {
        throw new Error(`Failed to fetch authentic price data for ${symbol}`);
      }
      
      return stockData.price;
    } catch (error) {
      console.error(`Error fetching authentic price for ${symbol}:`, error);
      throw error; // Rethrow to let caller handle the error
    }
  }

  // Get market session info
  getMarketSession() {
    const session = this.getCurrentMarketSession();
    const now = new Date();
    const est = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    
    return {
      session,
      isOpen: session !== 'closed',
      localTime: now.toLocaleTimeString(),
      marketTime: est.toLocaleTimeString(),
      timezone: 'EST',
      nextSession: this.getNextSessionInfo(session),
      volatilityMultiplier: this.getSessionVolatilityMultiplier(),
      volumeMultiplier: this.getVolumeMultiplier()
    };
  }

  private getNextSessionInfo(currentSession: string) {
    switch (currentSession) {
      case 'closed': return 'Pre-market opens at 4:00 AM EST';
      case 'pre': return 'Regular market opens at 9:30 AM EST';
      case 'regular': return 'After-hours trading starts at 4:00 PM EST';
      case 'after': return 'Market closes at 8:00 PM EST';
      default: return 'Market status unknown';
    }
  }

  // Clean up resources
  cleanup() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    this.subscribers.clear();
    this.cache.clear();
    this.priceCache.clear();
  }
}

export const liveChartDataService = new LiveChartDataService();