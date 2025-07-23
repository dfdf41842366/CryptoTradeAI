import OpenAI from "openai";
import { multiSourceMarketDataService } from "./multiSourceMarketData";
import { stocktwitsService } from "./stocktwitsService";
import { redditService } from "./redditService";

// Helper function to clean OpenAI API key - extract from Authorization header
function getCleanOpenAIKey(): string {
  const rawKey = process.env.OPENAI_API_KEY;
  if (!rawKey) {
    console.error('❌ No OpenAI API key found');
    return '';
  }
  
  // Extract the actual key from "Authorization: Bearer <token>" format
  let cleanKey = rawKey;
  
  // Match and extract key after "Bearer "
  const bearerMatch = cleanKey.match(/Bearer\s+([^\\s]+)/i);
  if (bearerMatch) {
    cleanKey = bearerMatch[1];
  } else {
    cleanKey = cleanKey.replace(/^Authorization:\s*/i, '');
    cleanKey = cleanKey.replace(/^Bearer\s+/i, '');
  }
  
  // Clean up artifacts
  cleanKey = cleanKey.replace(/['"<>]/g, '').trim();
  
  // Check for placeholder
  if (cleanKey === '<token>' || cleanKey === 'token' || cleanKey.includes('<token>')) {
    console.error('❌ OpenAI API key is placeholder token in Swarm AI');
    return '';
  }
  
  if (cleanKey.startsWith('sk-') && cleanKey.length > 40) {
    console.log('✅ OpenAI API key cleaned and validated for Swarm AI');
    return cleanKey;
  }
  
  console.error(`❌ Invalid OpenAI key format in Swarm AI: "${cleanKey.substring(0, 10)}..." (length: ${cleanKey.length})`);
  return '';
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: getCleanOpenAIKey() });

export interface SwarmAgent {
  name: string;
  role: string;
  specialty: string;
  systemPrompt: string;
}

export interface SwarmAnalysis {
  symbol: string;
  consensus: {
    action: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    grade: string;
    targetPrice: number;
    stopLoss: number;
  };
  agentAnalyses: AgentAnalysis[];
  collaboration: {
    agreements: string[];
    disagreements: string[];
    finalReasoning: string;
  };
  marketContext: {
    newsHeadlines: string[];
    socialSentiment: string;
    technicalIndicators: any;
  };
}

export interface AgentAnalysis {
  agentName: string;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
  keyPoints: string[];
  riskAssessment: string;
}

export class SwarmAI {
  private agents: SwarmAgent[] = [
    {
      name: "TechnicalAnalyst",
      role: "Technical Analysis Expert",
      specialty: "Chart patterns, indicators, price action",
      systemPrompt: `You are a technical analysis expert specializing in chart patterns, RSI, MACD, volume analysis, and price action. 
      Analyze price movements, support/resistance levels, and momentum indicators. Focus on short to medium-term trading opportunities.
      Always provide specific entry points, stop losses, and target prices. Be precise with technical levels.`
    },
    {
      name: "FundamentalAnalyst",
      role: "Fundamental Analysis Expert", 
      specialty: "Company financials, earnings, valuation",
      systemPrompt: `You are a fundamental analysis expert focusing on company financials, earnings growth, valuation metrics, and business prospects.
      Analyze revenue trends, profit margins, competitive position, and long-term value. Consider P/E ratios, growth rates, and market positioning.
      Focus on long-term investment value and company health.`
    },
    {
      name: "SentimentAnalyst",
      role: "Market Sentiment Expert",
      specialty: "News sentiment, social media, market psychology",
      systemPrompt: `You are a sentiment analysis expert specializing in news interpretation, social media sentiment, and market psychology.
      Analyze financial news impact, social media buzz, retail vs institutional sentiment, and market mood indicators.
      Focus on how sentiment drives short-term price movements and momentum shifts.`
    },
    {
      name: "RiskManager",
      role: "Risk Management Expert",
      specialty: "Risk assessment, position sizing, portfolio protection",
      systemPrompt: `You are a risk management expert focused on downside protection, volatility analysis, and portfolio safety.
      Assess maximum drawdown potential, correlation risks, market regime changes, and tail risks.
      Always emphasize proper position sizing and risk-adjusted returns. Be conservative in risk assessment.`
    },
    {
      name: "MacroAnalyst", 
      role: "Macroeconomic Expert",
      specialty: "Economic trends, sector rotation, market cycles",
      systemPrompt: `You are a macroeconomic analyst specializing in economic cycles, sector rotation, interest rates, and market regimes.
      Analyze how economic indicators, Fed policy, inflation, and global events impact stock performance.
      Focus on sector trends and macroeconomic tailwinds or headwinds.`
    }
  ];

  async analyzeSymbol(symbol: string): Promise<SwarmAnalysis> {
    try {
      // Gather comprehensive market data
      const [quote, news, socialSentiment, redditSentiment] = await Promise.all([
        multiSourceMarketDataService.getQuote(symbol),
        multiSourceMarketDataService.getFinancialNews(symbol),
        stocktwitsService.getSymbolSentiment(symbol),
        redditService.getSymbolSentiment(symbol)
      ]);

      // Get each agent's analysis
      const agentAnalyses = await Promise.all(
        this.agents.map(agent => this.getAgentAnalysis(agent, symbol, {
          quote,
          news: news.slice(0, 5),
          socialSentiment,
          redditSentiment
        }))
      );

      // Synthesize consensus through collaborative analysis
      const consensus = await this.synthesizeConsensus(symbol, agentAnalyses);
      
      // Extract collaboration insights
      const collaboration = this.analyzeCollaboration(agentAnalyses);

      return {
        symbol,
        consensus,
        agentAnalyses,
        collaboration,
        marketContext: {
          newsHeadlines: news.slice(0, 3).map(n => n.headline),
          socialSentiment: `StockTwits: ${socialSentiment.bullishPercentage.toFixed(1)}% bullish | Reddit: ${redditSentiment.mentions} mentions`,
          technicalIndicators: quote
        }
      };

    } catch (error) {
      console.error(`Swarm AI analysis error for ${symbol}:`, error);
      throw error;
    }
  }

  private async getAgentAnalysis(
    agent: SwarmAgent, 
    symbol: string, 
    data: any
  ): Promise<AgentAnalysis> {
    try {
      const prompt = this.buildAgentPrompt(agent, symbol, data);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: agent.systemPrompt },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        agentName: agent.name,
        recommendation: analysis.recommendation || 'HOLD',
        confidence: Math.min(100, Math.max(0, analysis.confidence || 50)),
        reasoning: analysis.reasoning || 'Analysis unavailable',
        keyPoints: analysis.keyPoints || [],
        riskAssessment: analysis.riskAssessment || 'Moderate risk'
      };

    } catch (error) {
      console.error(`Error getting ${agent.name} analysis:`, error);
      return {
        agentName: agent.name,
        recommendation: 'HOLD',
        confidence: 0,
        reasoning: 'Analysis failed due to technical error',
        keyPoints: [],
        riskAssessment: 'Unable to assess risk'
      };
    }
  }

  private buildAgentPrompt(agent: SwarmAgent, symbol: string, data: any): string {
    return `
Analyze ${symbol} from your ${agent.specialty} perspective.

Current Data:
- Price: $${data.quote?.regularMarketPrice || 'N/A'}
- Change: ${data.quote?.regularMarketChangePercent || 'N/A'}%
- Volume: ${data.quote?.regularMarketVolume || 'N/A'}
- Market Cap: ${data.quote?.marketCap || 'N/A'}

Recent News Headlines:
${data.news?.map((n: any, i: number) => `${i + 1}. ${n.headline}`).join('\n') || 'No recent news'}

Social Sentiment:
- StockTwits: ${data.socialSentiment?.bullishPercentage || 50}% bullish (${data.socialSentiment?.totalMessages || 0} messages)
- Reddit: ${data.redditSentiment?.mentions || 0} mentions, ${data.redditSentiment?.bullishPercentage || 50}% bullish

Provide your analysis in JSON format:
{
  "recommendation": "BUY" | "SELL" | "HOLD",
  "confidence": 0-100,
  "reasoning": "detailed explanation from your specialty perspective",
  "keyPoints": ["key point 1", "key point 2", "key point 3"],
  "riskAssessment": "your risk assessment",
  "targetPrice": number or null,
  "stopLoss": number or null
}

Focus on your specialty: ${agent.specialty}
    `;
  }

  private async synthesizeConsensus(
    symbol: string, 
    agentAnalyses: AgentAnalysis[]
  ): Promise<SwarmAnalysis['consensus']> {
    try {
      const consensusPrompt = `
You are the lead analyst synthesizing insights from a team of 5 expert analysts for ${symbol}.

Agent Recommendations:
${agentAnalyses.map(a => `
${a.agentName}: ${a.recommendation} (${a.confidence}% confidence)
Reasoning: ${a.reasoning}
Key Points: ${a.keyPoints.join(', ')}
Risk: ${a.riskAssessment}
`).join('\n')}

Synthesize their insights into a final consensus recommendation. Consider:
1. Weight recommendations by confidence levels
2. Resolve conflicts through reasoning
3. Account for different time horizons
4. Balance risk vs reward

Respond in JSON format:
{
  "action": "BUY" | "SELL" | "HOLD",
  "confidence": 0-100,
  "grade": "A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F",
  "targetPrice": number,
  "stopLoss": number,
  "reasoning": "synthesized reasoning considering all agent inputs"
}
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: "You are an expert financial analyst synthesizing multiple expert opinions." },
          { role: "user", content: consensusPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      });

      const consensus = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        action: consensus.action || 'HOLD',
        confidence: Math.min(100, Math.max(0, consensus.confidence || 50)),
        grade: consensus.grade || 'C',
        targetPrice: consensus.targetPrice || 0,
        stopLoss: consensus.stopLoss || 0
      };

    } catch (error) {
      console.error('Error synthesizing consensus:', error);
      return {
        action: 'HOLD',
        confidence: 0,
        grade: 'F',
        targetPrice: 0,
        stopLoss: 0
      };
    }
  }

  private analyzeCollaboration(agentAnalyses: AgentAnalysis[]): SwarmAnalysis['collaboration'] {
    const recommendations = agentAnalyses.map(a => a.recommendation);
    const buyCount = recommendations.filter(r => r === 'BUY').length;
    const sellCount = recommendations.filter(r => r === 'SELL').length;
    const holdCount = recommendations.filter(r => r === 'HOLD').length;

    const agreements: string[] = [];
    const disagreements: string[] = [];

    // Find consensus areas
    if (buyCount >= 3) {
      agreements.push(`Strong buy consensus (${buyCount}/5 agents recommend BUY)`);
    } else if (sellCount >= 3) {
      agreements.push(`Strong sell consensus (${sellCount}/5 agents recommend SELL)`);
    }

    // Find disagreements
    if (buyCount > 0 && sellCount > 0) {
      disagreements.push(`Mixed signals: ${buyCount} BUY vs ${sellCount} SELL recommendations`);
    }

    // High confidence agents
    const highConfidenceAgents = agentAnalyses.filter(a => a.confidence >= 80);
    if (highConfidenceAgents.length > 0) {
      agreements.push(`High confidence from: ${highConfidenceAgents.map(a => a.agentName).join(', ')}`);
    }

    const finalReasoning = `Swarm analysis shows ${buyCount} BUY, ${sellCount} SELL, ${holdCount} HOLD recommendations. ` +
      `Average confidence: ${(agentAnalyses.reduce((sum, a) => sum + a.confidence, 0) / agentAnalyses.length).toFixed(1)}%.`;

    return {
      agreements,
      disagreements,
      finalReasoning
    };
  }

  async analyzeBatch(symbols: string[]): Promise<SwarmAnalysis[]> {
    const results = await Promise.allSettled(
      symbols.map(symbol => this.analyzeSymbol(symbol))
    );

    return results
      .filter((result): result is PromiseFulfilledResult<SwarmAnalysis> => 
        result.status === 'fulfilled')
      .map(result => result.value);
  }

  // Get swarm health status
  getSwarmStatus(): { agents: number; status: string } {
    return {
      agents: this.agents.length,
      status: 'Active - 5 AI agents ready'
    };
  }
}

export const swarmAI = new SwarmAI();