import { Router } from 'express';
import { anthropicAI } from '../services/anthropicAI';
import { marketDataService } from '../services/marketData';

const router = Router();

interface PredictionRequest {
  symbol: string;
  model: string;
  timeHorizon: string;
}

interface MarketPrediction {
  symbol: string;
  currentPrice: number;
  predictions: Array<{
    timeframe: string;
    predictedPrice: number;
    probability: number;
    direction: 'up' | 'down';
    confidenceLevel: number;
    keyFactors: string[];
  }>;
  aiInsight: string;
  riskLevel: string;
  nextCatalyst?: {
    event: string;
    date: Date;
    expectedImpact: number;
  };
}

// Generate AI-powered market predictions
router.post('/generate', async (req, res) => {
  try {
    const { symbol, model = 'ensemble', timeHorizon = '1d' } = req.body as PredictionRequest;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    console.log(`🔮 AI Predictions: Generating predictions for ${symbol} using ${model} model`);

    // Get current market data
    const quote = await marketDataService.getQuote(symbol);
    const news = await marketDataService.getMarketNews(symbol);
    
    // Use Anthropic Claude for AI analysis
    const claudeAnalysis = await anthropicAI.analyzeStock(quote, news);
    
    // Generate multiple timeframe predictions
    const predictions = [
      {
        timeframe: '1 Hour',
        predictedPrice: Math.round((quote.price * (1 + (claudeAnalysis.expectedGain || 2) / 100 * 0.1)) * 100) / 100,
        probability: Math.round((claudeAnalysis.confidence || 0.7) * 100),
        direction: (claudeAnalysis.expectedGain || 0) > 0 ? 'up' : 'down' as 'up' | 'down',
        confidenceLevel: Math.round((claudeAnalysis.confidence || 0.7) * 100),
        keyFactors: ['Technical momentum', 'Volume patterns', 'Short-term sentiment']
      },
      {
        timeframe: '4 Hours',
        predictedPrice: Math.round((quote.price * (1 + (claudeAnalysis.expectedGain || 3) / 100 * 0.3)) * 100) / 100,
        probability: Math.round((claudeAnalysis.confidence || 0.7) * 90),
        direction: (claudeAnalysis.expectedGain || 0) > 0 ? 'up' : 'down' as 'up' | 'down',
        confidenceLevel: Math.round((claudeAnalysis.confidence || 0.7) * 90),
        keyFactors: ['Market structure', 'Options flow', 'Institutional activity']
      },
      {
        timeframe: '1 Day',
        predictedPrice: Math.round((claudeAnalysis.target || quote.price * 1.05) * 100) / 100,
        probability: Math.round((claudeAnalysis.confidence || 0.7) * 85),
        direction: (claudeAnalysis.expectedGain || 0) > 0 ? 'up' : 'down' as 'up' | 'down',
        confidenceLevel: Math.round((claudeAnalysis.confidence || 0.7) * 85),
        keyFactors: ['Fundamental analysis', 'Earnings momentum', 'Sector trends']
      },
      {
        timeframe: '1 Week',
        predictedPrice: Math.round((quote.price * (1 + (claudeAnalysis.expectedGain || 5) / 100 * 1.5)) * 100) / 100,
        probability: Math.round((claudeAnalysis.confidence || 0.7) * 75),
        direction: (claudeAnalysis.expectedGain || 0) > 0 ? 'up' : 'down' as 'up' | 'down',
        confidenceLevel: Math.round((claudeAnalysis.confidence || 0.7) * 75),
        keyFactors: ['Company catalysts', 'Market conditions', 'Economic indicators']
      }
    ];

    const prediction: MarketPrediction = {
      symbol: quote.symbol,
      currentPrice: quote.price,
      predictions,
      aiInsight: claudeAnalysis.reasoning || `Claude AI analysis shows ${claudeAnalysis.action} signal with ${Math.round((claudeAnalysis.confidence || 0.7) * 100)}% confidence`,
      riskLevel: claudeAnalysis.riskLevel?.toLowerCase() || 'medium',
      nextCatalyst: {
        event: 'Earnings Report',
        date: new Date(Date.now() + 86400000 * 7), // 1 week from now
        expectedImpact: Math.abs(claudeAnalysis.expectedGain || 5)
      }
    };

    res.json(prediction);
  } catch (error) {
    console.error('AI Predictions error:', error);
    res.status(500).json({ error: 'Failed to generate predictions' });
  }
});

export default router;