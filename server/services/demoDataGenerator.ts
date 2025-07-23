import { InsertSignal } from '@shared/schema';
import { alertSystem } from './alertSystem';

export class DemoDataGenerator {
  private demoSignals: InsertSignal[] = [];

  generateHighQualitySignals(): InsertSignal[] {
    const signals: InsertSignal[] = [
      {
        symbol: 'NVDA',
        action: 'BUY',
        price: 875.50,
        confidence: 0.92,
        grade: 'A+',
        reasoning: 'AI chip demand surge continues. Strong technical breakout above $850 resistance with institutional accumulation. Q4 earnings exceeded expectations by 15%. Target: $920-950.',
        targetPrice: 935,
        stopLoss: 820,
        riskLevel: 'medium',
        expectedGain: 6.8,
        gptCouncilVotes: 4,
        gptCouncilTotal: 5,
        timestamp: new Date()
      },
      {
        symbol: 'TSLA',
        action: 'BUY',
        price: 248.75,
        confidence: 0.88,
        grade: 'A',
        reasoning: 'Cybertruck production ramping ahead of schedule. China sales recovery accelerating. Technical cup-and-handle pattern completion. Energy storage business showing 40% growth.',
        targetPrice: 285,
        stopLoss: 225,
        riskLevel: 'medium-high',
        expectedGain: 14.6,
        gptCouncilVotes: 4,
        gptCouncilTotal: 5,
        timestamp: new Date()
      },
      {
        symbol: 'PLTR',
        action: 'BUY',
        price: 18.20,
        confidence: 0.85,
        grade: 'B+',
        reasoning: 'Government contract wins accelerating. Commercial sector adoption expanding rapidly. Low float with high short interest creating squeeze potential. RSI oversold at 28.',
        targetPrice: 24,
        stopLoss: 16.5,
        riskLevel: 'high',
        expectedGain: 31.9,
        gptCouncilVotes: 3,
        gptCouncilTotal: 5,
        timestamp: new Date()
      },
      {
        symbol: 'AMD',
        action: 'HOLD',
        price: 147.30,
        confidence: 0.78,
        grade: 'B',
        reasoning: 'AI chip competition heating up. Market share gains in data center. Valuation stretched short-term but long-term fundamentals solid. Wait for pullback to $135.',
        targetPrice: 165,
        stopLoss: 135,
        riskLevel: 'medium',
        expectedGain: 12.0,
        gptCouncilVotes: 3,
        gptCouncilTotal: 5,
        timestamp: new Date()
      },
      {
        symbol: 'RIVN',
        action: 'SELL',
        price: 13.70,
        confidence: 0.82,
        grade: 'B+',
        reasoning: 'Production targets missed again. Cash burn accelerating. EV competition intensifying. Technical breakdown below $14 support. Expecting further decline.',
        targetPrice: 9.50,
        stopLoss: 15.20,
        riskLevel: 'high',
        expectedGain: -30.7,
        gptCouncilVotes: 4,
        gptCouncilTotal: 5,
        timestamp: new Date()
      }
    ];

    this.demoSignals = signals;
    return signals;
  }

  async triggerDemoAlerts(): Promise<void> {
    const highGradeSignals = this.demoSignals.filter(s => ['A+', 'A'].includes(s.grade));
    
    for (const signal of highGradeSignals) {
      await alertSystem.sendSignalAlert(signal as any);
    }
  }

  generateOptionsFlowAlerts(): void {
    const alerts = [
      {
        symbol: 'NVDA',
        message: '🔥 Unusual Options Activity: 5,000 NVDA $900 calls bought, exp 2 weeks. Premium: $2.8M',
        priority: 'high' as const
      },
      {
        symbol: 'TSLA', 
        message: '⚡ Large Put Spread: 10,000 TSLA $240/$220 put spread opened. Bearish sentiment building.',
        priority: 'medium' as const
      },
      {
        symbol: 'SPY',
        message: '📊 Dark Pool Activity: Large $580 SPY block trades detected. Institutional positioning.',
        priority: 'medium' as const
      }
    ];

    alerts.forEach(alert => {
      alertSystem.sendMarketAlert(alert.symbol, alert.message, alert.priority);
    });
  }

  generateNewsBasedSignals(): void {
    alertSystem.sendMarketAlert('AAPL', 
      '🍎 Apple Vision Pro 2 leaked specs show 40% performance boost. Stock breaking $195 resistance.', 
      'high'
    );
    
    alertSystem.sendMarketAlert('GOOGL', 
      '🤖 Google Gemini Ultra beating GPT-4 in latest benchmarks. AI race heating up.', 
      'medium'
    );
  }
}

export const demoDataGenerator = new DemoDataGenerator();