import { Signal } from '@shared/schema';

export interface AlertConfig {
  telegramBotToken?: string;
  telegramChatId?: string;
  discordWebhookUrl?: string;
  emailNotifications?: boolean;
}

export interface Alert {
  id: string;
  type: 'signal' | 'price' | 'volume' | 'news';
  symbol: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  sent: boolean;
}

export class AlertSystem {
  private alerts: Map<string, Alert> = new Map();
  private config: AlertConfig = {};

  constructor(config?: AlertConfig) {
    this.config = config || {};
  }

  async sendSignalAlert(signal: Signal): Promise<void> {
    const alert: Alert = {
      id: `signal-${signal.symbol}-${Date.now()}`,
      type: 'signal',
      symbol: signal.symbol,
      message: this.formatSignalMessage(signal),
      priority: this.getSignalPriority(signal),
      timestamp: new Date(),
      sent: false
    };

    this.alerts.set(alert.id, alert);

    try {
      // Send to configured channels
      await Promise.all([
        this.sendToTelegram(alert),
        this.sendToDiscord(alert),
        this.sendToUI(alert)
      ]);

      alert.sent = true;
      console.log(`Alert sent for ${signal.symbol}: ${signal.grade} ${signal.action}`);
    } catch (error) {
      console.error('Error sending alert:', error);
    }
  }

  private formatSignalMessage(signal: Signal): string {
    const emoji = signal.action === 'BUY' ? '🟢' : signal.action === 'SELL' ? '🔴' : '🟡';
    const gradeEmoji = ['A+', 'A'].includes(signal.grade) ? '⭐' : 
                      ['B+', 'B'].includes(signal.grade) ? '🌟' : '📊';
    
    return `${emoji} ${gradeEmoji} **${signal.action} ${signal.symbol}** - Grade: ${signal.grade}
💰 Price: $${signal.price.toFixed(2)}
📈 Expected Gain: ${signal.expectedGain?.toFixed(1)}%
🎯 Confidence: ${(signal.confidence * 100).toFixed(0)}%
🧠 AI Council: ${signal.gptCouncilVotes}/${signal.gptCouncilTotal} votes
⚠️ Risk: ${signal.riskLevel}
📝 ${signal.reasoning?.substring(0, 100)}...`;
  }

  private getSignalPriority(signal: Signal): 'low' | 'medium' | 'high' | 'critical' {
    if (['A+', 'A'].includes(signal.grade) && signal.confidence > 0.8) return 'critical';
    if (['A+', 'A', 'B+'].includes(signal.grade) && signal.confidence > 0.7) return 'high';
    if (signal.confidence > 0.6) return 'medium';
    return 'low';
  }

  private async sendToTelegram(alert: Alert): Promise<void> {
    if (!this.config.telegramBotToken || !this.config.telegramChatId) {
      return;
    }

    // Simulated Telegram API call
    console.log(`[TELEGRAM] ${alert.message}`);
  }

  private async sendToDiscord(alert: Alert): Promise<void> {
    if (!this.config.discordWebhookUrl) {
      return;
    }

    // Simulated Discord webhook call
    console.log(`[DISCORD] ${alert.message}`);
  }

  private async sendToUI(alert: Alert): Promise<void> {
    // Store for UI to pick up via Server-Sent Events or WebSocket
    console.log(`[UI ALERT] ${alert.priority.toUpperCase()}: ${alert.message}`);
  }

  getRecentAlerts(limit = 50): Alert[] {
    return Array.from(this.alerts.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  sendMarketAlert(symbol: string, message: string, priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'): void {
    const alert: Alert = {
      id: `market-${symbol}-${Date.now()}`,
      type: 'price',
      symbol,
      message,
      priority,
      timestamp: new Date(),
      sent: false
    };

    console.log(`[MARKET ALERT] ${priority.toUpperCase()}: ${message}`);
    this.alerts.set(alert.id, alert);
  }
}

export const alertSystem = new AlertSystem();