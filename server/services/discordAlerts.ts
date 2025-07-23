interface DiscordAlert {
  symbol: string;
  alertType: 'TARGET_HIT' | 'NEXT_TARGET' | 'STOP_LOSS' | 'TRADE_ENTRY';
  currentPrice: number;
  targetPrice?: number;
  stopLossPrice?: number;
  nextTarget?: number;
  gainPercentage?: number;
  message: string;
}

class DiscordAlertsService {
  private webhookUrl: string;

  constructor() {
    // Discord webhook URL - you'll need to set this up in your Discord server
    this.webhookUrl = process.env.DISCORD_WEBHOOK_URL || '';
  }

  async sendAlert(alert: DiscordAlert): Promise<boolean> {
    if (!this.webhookUrl) {
      console.log('Discord webhook not configured, logging alert instead:', alert);
      return true;
    }

    try {
      const embed = this.createEmbed(alert);
      
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          embeds: [embed],
        }),
      });

      if (!response.ok) {
        console.error('Failed to send Discord alert:', response.statusText);
        return false;
      }

      console.log(`✅ Discord alert sent for ${alert.symbol}: ${alert.alertType}`);
      return true;
    } catch (error) {
      console.error('Error sending Discord alert:', error);
      return false;
    }
  }

  private createEmbed(alert: DiscordAlert) {
    const colors = {
      TARGET_HIT: 0x00ff00,    // Green
      NEXT_TARGET: 0x0099ff,   // Blue
      STOP_LOSS: 0xff0000,     // Red
      TRADE_ENTRY: 0xffff00,   // Yellow
    };

    const embed: any = {
      title: `🎯 ${alert.symbol} - ${alert.alertType.replace('_', ' ')}`,
      description: alert.message,
      color: colors[alert.alertType],
      timestamp: new Date().toISOString(),
      fields: [
        {
          name: '💰 Current Price',
          value: `$${alert.currentPrice.toFixed(2)}`,
          inline: true,
        },
      ],
    };

    if (alert.targetPrice) {
      embed.fields.push({
        name: '🎯 Target Hit',
        value: `$${alert.targetPrice.toFixed(2)}`,
        inline: true,
      });
    }

    if (alert.nextTarget) {
      embed.fields.push({
        name: '⬆️ Next Target',
        value: `$${alert.nextTarget.toFixed(2)}`,
        inline: true,
      });
    }

    if (alert.stopLossPrice) {
      embed.fields.push({
        name: '🛡️ Stop Loss',
        value: `$${alert.stopLossPrice.toFixed(2)}`,
        inline: true,
      });
    }

    if (alert.gainPercentage) {
      embed.fields.push({
        name: '📈 Gain',
        value: `${alert.gainPercentage.toFixed(1)}%`,
        inline: true,
      });
    }

    return embed;
  }

  async sendTargetHitAlert(
    symbol: string,
    currentPrice: number,
    targetHit: number,
    nextTarget: number | null,
    gainPercentage: number
  ): Promise<boolean> {
    const message = nextTarget 
      ? `🎉 Target ${targetHit} HIT! Next target: $${nextTarget.toFixed(2)}`
      : `🎉 FINAL TARGET HIT! Consider taking profits.`;

    return this.sendAlert({
      symbol,
      alertType: 'TARGET_HIT',
      currentPrice,
      targetPrice: targetHit,
      nextTarget: nextTarget || undefined,
      gainPercentage,
      message,
    });
  }

  async sendStopLossAlert(
    symbol: string,
    currentPrice: number,
    stopLossPrice: number,
    lossPercentage: number
  ): Promise<boolean> {
    const message = `🚨 STOP LOSS HIT! Exit position immediately.`;

    return this.sendAlert({
      symbol,
      alertType: 'STOP_LOSS',
      currentPrice,
      stopLossPrice,
      gainPercentage: -Math.abs(lossPercentage),
      message,
    });
  }

  async sendTradeEntryAlert(
    symbol: string,
    entryPrice: number,
    targets: number[],
    stopLoss: number
  ): Promise<boolean> {
    const message = `🚀 NEW TRADE ALERT! Entry confirmed with ${targets.length} targets.`;

    return this.sendAlert({
      symbol,
      alertType: 'TRADE_ENTRY',
      currentPrice: entryPrice,
      nextTarget: targets[0],
      stopLossPrice: stopLoss,
      message,
    });
  }

  async sendNextTargetAlert(
    symbol: string,
    currentPrice: number,
    nextTarget: number,
    currentTargetIndex: number
  ): Promise<boolean> {
    const message = `📊 Approaching Target ${currentTargetIndex + 1}: $${nextTarget.toFixed(2)}`;

    return this.sendAlert({
      symbol,
      alertType: 'NEXT_TARGET',
      currentPrice,
      nextTarget,
      message,
    });
  }
}

export const discordAlertsService = new DiscordAlertsService();