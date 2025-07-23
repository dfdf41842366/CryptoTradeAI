import { discordAlertsService } from './discordAlerts';

interface ActiveTrade {
  symbol: string;
  entryPrice: number;
  targets: number[];
  stopLoss: number;
  currentTargetIndex: number;
  lastPrice: number;
  entryTime: Date;
  alertsSent: Set<string>;
}

class AutoTradingService {
  private activeTrades = new Map<string, ActiveTrade>();
  private priceMonitorInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startPriceMonitoring();
  }

  private startPriceMonitoring() {
    // Monitor prices every 30 seconds for active trades
    this.priceMonitorInterval = setInterval(async () => {
      if (this.activeTrades.size > 0) {
        await this.checkAllTrades();
      }
    }, 30000);
  }

  async addTradeFromStrategy(analysis: any): Promise<boolean> {
    try {
      const symbol = analysis.symbol;
      const currentPrice = analysis.currentPrice;
      
      // Extract targets and stop loss from analysis
      const targets = analysis.targets
        ?.filter((t: any) => t.target > currentPrice)
        ?.map((t: any) => t.target)
        ?.sort((a: number, b: number) => a - b) || [];
      
      const stopLoss = analysis.stopLoss?.price || currentPrice * 0.95;

      if (targets.length === 0) {
        console.log(`❌ No valid targets found for ${symbol}`);
        return false;
      }

      // Check if trade already exists
      if (this.activeTrades.has(symbol)) {
        console.log(`⚠️ Trade already active for ${symbol}`);
        return false;
      }

      // Create new active trade
      const trade: ActiveTrade = {
        symbol,
        entryPrice: currentPrice,
        targets,
        stopLoss,
        currentTargetIndex: 0,
        lastPrice: currentPrice,
        entryTime: new Date(),
        alertsSent: new Set(),
      };

      this.activeTrades.set(symbol, trade);

      // Send entry alert
      await discordAlertsService.sendTradeEntryAlert(
        symbol,
        currentPrice,
        targets,
        stopLoss
      );

      console.log(`🚀 Added auto-trade for ${symbol} with ${targets.length} targets`);
      return true;
    } catch (error) {
      console.error('Error adding trade from strategy:', error);
      return false;
    }
  }

  private async checkAllTrades() {
    try {
      for (const [symbol, trade] of this.activeTrades.entries()) {
        await this.checkTradeStatus(symbol, trade);
      }
    } catch (error) {
      console.error('Error checking trades:', error);
    }
  }

  private async checkTradeStatus(symbol: string, trade: ActiveTrade) {
    try {
      // Get current price (using your existing market data service)
      const currentPrice = await this.getCurrentPrice(symbol);
      if (!currentPrice) return;

      trade.lastPrice = currentPrice;
      const gainPercentage = ((currentPrice - trade.entryPrice) / trade.entryPrice) * 100;

      // Check stop loss
      if (currentPrice <= trade.stopLoss) {
        await discordAlertsService.sendStopLossAlert(
          symbol,
          currentPrice,
          trade.stopLoss,
          gainPercentage
        );
        this.activeTrades.delete(symbol);
        console.log(`🛑 Stop loss hit for ${symbol} at $${currentPrice}`);
        return;
      }

      // Check targets
      const currentTarget = trade.targets[trade.currentTargetIndex];
      if (currentPrice >= currentTarget) {
        const nextTargetIndex = trade.currentTargetIndex + 1;
        const nextTarget = trade.targets[nextTargetIndex] || null;

        // Send target hit alert
        await discordAlertsService.sendTargetHitAlert(
          symbol,
          currentPrice,
          currentTarget,
          nextTarget,
          gainPercentage
        );

        // Update target index
        trade.currentTargetIndex = nextTargetIndex;

        // If all targets hit, remove trade
        if (nextTargetIndex >= trade.targets.length) {
          this.activeTrades.delete(symbol);
          console.log(`🎉 All targets hit for ${symbol}, trade completed`);
        } else {
          console.log(`🎯 Target ${nextTargetIndex} hit for ${symbol}, next: $${nextTarget}`);
        }
      }
      // Check if approaching next target (within 2%)
      else if (currentPrice >= currentTarget * 0.98) {
        const alertKey = `approaching_${trade.currentTargetIndex}`;
        if (!trade.alertsSent.has(alertKey)) {
          await discordAlertsService.sendNextTargetAlert(
            symbol,
            currentPrice,
            currentTarget,
            trade.currentTargetIndex
          );
          trade.alertsSent.add(alertKey);
        }
      }

    } catch (error) {
      console.error(`Error checking trade status for ${symbol}:`, error);
    }
  }

  private async getCurrentPrice(symbol: string): Promise<number | null> {
    try {
      // Use Yahoo Finance PRIMARY for real-time prices (best free option)
      const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
      const data = await response.json();
      
      if (data?.chart?.result?.[0]?.meta?.regularMarketPrice) {
        const livePrice = Math.round(data.chart.result[0].meta.regularMarketPrice * 100) / 100;
        console.log(`💰 Live price for ${symbol}: $${livePrice} (Yahoo Finance)`);
        return livePrice;
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching live price for ${symbol}:`, error);
      return null;
    }
  }

  getActiveTrades(): Map<string, ActiveTrade> {
    return new Map(this.activeTrades);
  }

  removeTradeManually(symbol: string): boolean {
    return this.activeTrades.delete(symbol);
  }

  getTradeStatus(symbol: string): ActiveTrade | null {
    return this.activeTrades.get(symbol) || null;
  }

  shutdown() {
    if (this.priceMonitorInterval) {
      clearInterval(this.priceMonitorInterval);
    }
  }
}

export const autoTradingService = new AutoTradingService();

// Graceful shutdown
process.on('SIGINT', () => {
  autoTradingService.shutdown();
});

process.on('SIGTERM', () => {
  autoTradingService.shutdown();
});