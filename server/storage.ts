import { signals, marketData, analytics, type Signal, type InsertSignal, type MarketData, type InsertMarketData, type Analytics, type InsertAnalytics } from "@shared/schema";

export interface IStorage {
  // Signal operations
  createSignal(signal: InsertSignal): Promise<Signal>;
  getSignals(): Promise<Signal[]>;
  updateSignalStatus(id: number, isActive: boolean): Promise<Signal | undefined>;
  clearOldSignals(): Promise<void>;
  
  // Market data operations
  upsertMarketData(data: InsertMarketData): Promise<MarketData>;
  getMarketData(): Promise<MarketData[]>;
  
  // Analytics operations
  upsertAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  getLatestAnalytics(): Promise<Analytics | undefined>;
  
  // AI Proposals operations (fallback to empty array)
  getAIProposals(): Promise<any[]>;
}

export class MemStorage implements IStorage {
  private signals: Map<number, Signal>;
  private marketDataMap: Map<string, MarketData>;
  private analyticsData: Analytics | undefined;
  private currentSignalId: number;
  private currentMarketDataId: number;
  private currentAnalyticsId: number;

  constructor() {
    this.signals = new Map();
    this.marketDataMap = new Map();
    this.currentSignalId = 1;
    this.currentMarketDataId = 1;
    this.currentAnalyticsId = 1;
  }

  async createSignal(insertSignal: InsertSignal): Promise<Signal> {
    const id = this.currentSignalId++;
    const signal: Signal = { 
      ...insertSignal, 
      id, 
      createdAt: new Date(),
      isActive: true,
      target: insertSignal.target || null,
      stop: insertSignal.stop || null,
      expectedGain: insertSignal.expectedGain || null,
      volume: insertSignal.volume || null,
      change: insertSignal.change || null,
      changePercent: insertSignal.changePercent || null,
      reasoning: insertSignal.reasoning || null
    };
    this.signals.set(id, signal);
    return signal;
  }

  async getSignals(): Promise<Signal[]> {
    const allSignals = Array.from(this.signals.values())
      .filter(signal => signal.isActive)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return allSignals;
  }

  async updateSignalStatus(id: number, isActive: boolean): Promise<Signal | undefined> {
    const signal = this.signals.get(id);
    if (signal) {
      signal.isActive = isActive;
      this.signals.set(id, signal);
      return signal;
    }
    return undefined;
  }

  async clearOldSignals(): Promise<void> {
    // ❌ FAKE DATA ELIMINATION: Only clear signals older than 24 hours - no fake data detection
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const idsToRemove: number[] = [];
    
    for (const [id, signal] of this.signals) {
      if (signal.createdAt < twentyFourHoursAgo) {
        idsToRemove.push(id);
      }
    }
    
    for (const id of idsToRemove) {
      this.signals.delete(id);
    }
    
    if (idsToRemove.length > 0) {
      console.log(`✅ Cleared ${idsToRemove.length} very old signals (24+ hours) - no fake data detection`);
    }
  }

  async upsertMarketData(insertData: InsertMarketData): Promise<MarketData> {
    const existing = this.marketDataMap.get(insertData.symbol);
    const id = existing?.id || this.currentMarketDataId++;
    const marketData: MarketData = {
      ...insertData,
      id,
      lastUpdated: new Date(),
      marketCap: insertData.marketCap || null,
      peRatio: insertData.peRatio || null,
      dayHigh: insertData.dayHigh || null,
      dayLow: insertData.dayLow || null
    };
    this.marketDataMap.set(insertData.symbol, marketData);
    return marketData;
  }

  async getMarketData(): Promise<MarketData[]> {
    return Array.from(this.marketDataMap.values());
  }

  async getAIProposals(): Promise<any[]> {
    // Return empty array for fallback - AI proposals not implemented in memory storage
    return [];
  }

  async upsertAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const id = this.analyticsData?.id || this.currentAnalyticsId++;
    const analytics: Analytics = {
      ...insertAnalytics,
      id,
      lastUpdated: new Date()
    };
    this.analyticsData = analytics;
    return analytics;
  }

  async getLatestAnalytics(): Promise<Analytics | undefined> {
    return this.analyticsData;
  }
}

// Switch to database storage
import { db } from './db';
import { preMarketScans, scanAlerts, type PreMarketScan, type ScanAlert, type InsertPreMarketScan, type InsertScanAlert } from '../shared/schema';
import { desc, eq } from 'drizzle-orm';

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<any | undefined> {
    return undefined;
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return undefined;
  }

  async createUser(insertUser: any): Promise<any> {
    throw new Error('User creation not implemented');
  }

  async createSignal(signal: any): Promise<any> {
    return this.memStorage.createSignal(signal);
  }

  async getSignals(): Promise<any[]> {
    return this.memStorage.getSignals();
  }

  async updateSignalStatus(id: number, isActive: boolean): Promise<any> {
    return this.memStorage.updateSignalStatus(id, isActive);
  }

  async clearOldSignals(): Promise<void> {
    return this.memStorage.clearOldSignals();
  }

  async upsertMarketData(data: any): Promise<any> {
    return this.memStorage.upsertMarketData(data);
  }

  async getMarketData(): Promise<any[]> {
    return this.memStorage.getMarketData();
  }

  async updateAnalytics(analytics: any): Promise<any> {
    return this.memStorage.upsertAnalytics(analytics);
  }

  async upsertAnalytics(analytics: any): Promise<any> {
    return this.memStorage.upsertAnalytics(analytics);
  }

  async getLatestAnalytics(): Promise<any> {
    return this.memStorage.getLatestAnalytics();
  }

  async getAIProposals(): Promise<any[]> {
    // Return empty array for fallback - AI proposals not implemented in database storage
    return [];
  }

  private memStorage = new MemStorage();

  // Pre-market scanner methods
  async getPreMarketScans(limit = 50): Promise<PreMarketScan[]> {
    const scans = await db
      .select()
      .from(preMarketScans)
      .orderBy(desc(preMarketScans.scanTime))
      .limit(limit);
    
    return scans;
  }

  async getScanAlerts(acknowledged = false): Promise<ScanAlert[]> {
    const alerts = await db
      .select()
      .from(scanAlerts)
      .where(eq(scanAlerts.acknowledged, acknowledged))
      .orderBy(desc(scanAlerts.timestamp));
    
    return alerts;
  }

  async acknowledgeAlert(alertId: number): Promise<void> {
    await db
      .update(scanAlerts)
      .set({ acknowledged: true })
      .where(eq(scanAlerts.id, alertId));
  }
}

export const storage = new DatabaseStorage();
