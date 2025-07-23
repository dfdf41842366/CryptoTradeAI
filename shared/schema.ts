import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const signals = pgTable("signals", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  company: text("company").notNull(),
  action: text("action").notNull(), // BUY, SELL, HOLD
  grade: text("grade").notNull(), // A+, A, B+, B, C+, C, D, F
  confidence: real("confidence").notNull(),
  price: real("price").notNull(), // Current live price at signal generation
  currentPrice: real("current_price"), // Real-time live price for updates
  target: real("target"),
  stop: real("stop"),
  expectedGain: real("expected_gain"),
  riskLevel: text("risk_level").notNull(), // Low, Medium, High
  gptCouncilVotes: integer("gpt_council_votes").notNull(),
  gptCouncilTotal: integer("gpt_council_total").notNull(),
  volume: text("volume"),
  change: real("change"),
  changePercent: real("change_percent"),
  reasoning: text("reasoning"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull()
});

export const marketData = pgTable("market_data", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  price: real("price").notNull(),
  change: real("change").notNull(),
  changePercent: real("change_percent").notNull(),
  volume: text("volume").notNull(),
  marketCap: real("market_cap"),
  peRatio: real("pe_ratio"),
  dayHigh: real("day_high"),
  dayLow: real("day_low"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull()
});

// AI Proposals table for storing ARIA's improvement suggestions
export const aiProposals = pgTable("ai_proposals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // performance, feature, bug_fix, optimization, enhancement
  priority: text("priority").notNull(), // critical, high, medium, low
  implementation: jsonb("implementation").notNull(),
  estimatedImpact: integer("estimated_impact").notNull(), // 1-10 scale
  riskLevel: text("risk_level").notNull(), // low, medium, high
  approvalRequired: boolean("approval_required").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected, implemented
  aiConfidence: real("ai_confidence").notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  implementedAt: timestamp("implemented_at"),
  userFeedback: text("user_feedback")
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  totalTrades: integer("total_trades").notNull(),
  winRate: real("win_rate").notNull(),
  avgHoldTime: text("avg_hold_time").notNull(),
  aiConfidence: real("ai_confidence").notNull(),
  portfolioValue: real("portfolio_value").notNull(),
  todayPnL: real("today_pnl").notNull(),
  todayPnLPercent: real("today_pnl_percent").notNull(),
  avgDailyPnL: real("avg_daily_pnl").notNull(),
  gradeDistribution: jsonb("grade_distribution").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull()
});

export const insertSignalSchema = createInsertSchema(signals).omit({
  id: true,
  createdAt: true
});

export const insertMarketDataSchema = createInsertSchema(marketData).omit({
  id: true,
  lastUpdated: true
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  lastUpdated: true
});

// Add AI Proposals schema
export const insertAIProposalSchema = createInsertSchema(aiProposals).omit({
  id: true,
  generatedAt: true,
  reviewedAt: true,
  implementedAt: true
});

export type Signal = typeof signals.$inferSelect;
export type InsertSignal = z.infer<typeof insertSignalSchema>;
export type MarketData = typeof marketData.$inferSelect;
export type InsertMarketData = z.infer<typeof insertMarketDataSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type AIProposal = typeof aiProposals.$inferSelect;
export type InsertAIProposal = z.infer<typeof insertAIProposalSchema>;

// Pre-Market Scanner Tables
export const preMarketScans = pgTable("pre_market_scans", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  company: text("company").notNull(),
  price: real("price").notNull(),
  previousClose: real("previous_close").notNull(),
  change: real("change").notNull(),
  changePercent: real("change_percent").notNull(),
  gap: real("gap").notNull(),
  gapPercent: real("gap_percent").notNull(),
  volume: integer("volume").notNull(),
  avgVolume: integer("avg_volume").notNull(),
  rvol: real("rvol").notNull(),
  float: integer("float").notNull(),
  volumeImpactScore: real("volume_impact_score").notNull(),
  rank: integer("rank").notNull(),
  scanTime: timestamp("scan_time").defaultNow().notNull(),
  marketSession: text("market_session").notNull(), // 'pre-market', 'after-hours', 'extended'
  alertSent: boolean("alert_sent").default(false).notNull(),
});

export const scanAlerts = pgTable("scan_alerts", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  alertType: text("alert_type").notNull(), // 'PRE_MARKET_OPPORTUNITY'
  title: text("title").notNull(),
  message: text("message").notNull(),
  priority: text("priority").notNull(), // 'HIGH', 'MEDIUM', 'LOW'
  data: jsonb("data"), // Additional alert data
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  acknowledged: boolean("acknowledged").default(false).notNull(),
});

export const alerts = pgTable('alerts', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(), // 'price', 'volume', 'technical', 'news', 'ai_signal'
  symbol: text('symbol').notNull(),
  condition: text('condition').notNull(),
  value: numeric('value', { precision: 10, scale: 2 }).notNull(),
  currentValue: numeric('current_value', { precision: 10, scale: 2 }).default('0'),
  status: text('status').notNull().default('active'), // 'active', 'triggered', 'expired'
  priority: text('priority').notNull().default('medium'), // 'low', 'medium', 'high', 'critical'
  notifications: text('notifications').notNull(), // Comma-separated list
  createdAt: timestamp('created_at').defaultNow().notNull(),
  triggeredAt: timestamp('triggered_at')
});

export const scanSchedule = pgTable("scan_schedule", {
  id: serial("id").primaryKey(),
  scanType: text("scan_type").notNull(), // 'PRE_MARKET_DAILY'
  isActive: boolean("is_active").default(true).notNull(),
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run").notNull(),
  settings: jsonb("settings"), // Scan configuration
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Pre-Market Scanner Schemas
export const insertPreMarketScanSchema = createInsertSchema(preMarketScans).omit({
  id: true,
  scanTime: true
});

export const insertScanAlertSchema = createInsertSchema(scanAlerts).omit({
  id: true,
  timestamp: true
});

export const insertScanScheduleSchema = createInsertSchema(scanSchedule).omit({
  id: true,
  createdAt: true
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true
});

export type InsertPreMarketScan = z.infer<typeof insertPreMarketScanSchema>;
export type PreMarketScan = typeof preMarketScans.$inferSelect;
export type InsertScanAlert = z.infer<typeof insertScanAlertSchema>;
export type ScanAlert = typeof scanAlerts.$inferSelect;
export type InsertScanSchedule = z.infer<typeof insertScanScheduleSchema>;
export type ScanSchedule = typeof scanSchedule.$inferSelect;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
