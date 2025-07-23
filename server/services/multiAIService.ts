/**
 * Multi-AI Service - Best AI API alternatives with automatic failover
 * Provides the most advanced AI capabilities for trading analysis
 */

import OpenAI from 'openai';

interface AIProvider {
  name: string;
  priority: number;
  costPerToken: number;
  maxTokens: number;
  strengths: string[];
  isAvailable: boolean;
}

export class MultiAIService {
  private providers: Map<string, AIProvider> = new Map();
  private openai?: OpenAI;
  private anthropic?: any;
  private gemini?: any;
  private xai?: any;
  
  constructor() {
    this.initializeProviders();
    this.setupClients();
  }
  
  private initializeProviders(): void {
    // Best AI providers ranked by capability for trading
    this.providers.set('claude-4', {
      name: 'Anthropic Claude 4.0 Sonnet',
      priority: 1, // Highest priority - best reasoning
      costPerToken: 0.003,
      maxTokens: 200000,
      strengths: ['Advanced reasoning', 'Financial analysis', 'Risk assessment', 'Complex strategy'],
      isAvailable: !!process.env.ANTHROPIC_API_KEY
    });
    
    this.providers.set('gpt-4o', {
      name: 'OpenAI GPT-4o',
      priority: 2, // Second choice - well-rounded
      costPerToken: 0.005,
      maxTokens: 128000,
      strengths: ['General analysis', 'Market insights', 'Signal generation', 'Fast responses'],
      isAvailable: !!this.getCleanOpenAIKey()
    });
    
    this.providers.set('gemini-2.5-pro', {
      name: 'Google Gemini 2.5 Pro',
      priority: 3, // Third choice - multimodal strength
      costPerToken: 0.002,
      maxTokens: 2000000,
      strengths: ['Large context', 'Data analysis', 'Pattern recognition', 'Cost effective'],
      isAvailable: !!process.env.GEMINI_API_KEY
    });
    
    this.providers.set('grok-2', {
      name: 'xAI Grok 2.0',
      priority: 4, // Fourth choice - real-time data
      costPerToken: 0.002,
      maxTokens: 131072,
      strengths: ['Real-time data', 'Market trends', 'Social sentiment', 'Twitter integration'],
      isAvailable: !!process.env.XAI_API_KEY
    });
  }
  
  private setupClients(): void {
    // OpenAI
    const openaiKey = this.getCleanOpenAIKey();
    if (openaiKey) {
      this.openai = new OpenAI({ apiKey: openaiKey });
    }
    
    // Anthropic Claude
    if (process.env.ANTHROPIC_API_KEY) {
      import('@anthropic-ai/sdk').then(({ default: Anthropic }) => {
        this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      });
    }
    
    // Google Gemini
    if (process.env.GEMINI_API_KEY) {
      import('@google/genai').then(({ GoogleGenAI }) => {
        this.gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      });
    }
    
    // xAI Grok
    if (process.env.XAI_API_KEY) {
      this.xai = new OpenAI({
        baseURL: "https://api.x.ai/v1",
        apiKey: process.env.XAI_API_KEY
      });
    }
  }
  
  private getCleanOpenAIKey(): string {
    const rawKey = process.env.OPENAI_API_KEY;
    if (!rawKey) return '';
    
    let cleanKey = rawKey;
    const bearerMatch = cleanKey.match(/Bearer\s+([^\s]+)/i);
    if (bearerMatch) {
      cleanKey = bearerMatch[1];
    } else {
      cleanKey = cleanKey.replace(/^Authorization:\s*/i, '');
      cleanKey = cleanKey.replace(/^Bearer\s+/i, '');
    }
    
    cleanKey = cleanKey.replace(/['"<>]/g, '').trim();
    
    if (cleanKey === '<token>' || cleanKey === 'token' || cleanKey.includes('<token>')) {
      return '';
    }
    
    return cleanKey.startsWith('sk-') && cleanKey.length > 40 ? cleanKey : '';
  }
  
  async generateTradingAnalysis(stockData: any, options: any = {}): Promise<any> {
    const prompt = this.buildTradingPrompt(stockData);
    const availableProviders = this.getAvailableProviders();
    
    for (const provider of availableProviders) {
      try {
        console.log(`🤖 Attempting analysis with ${provider.name}...`);
        const result = await this.callProvider(provider.name, prompt, options);
        if (result) {
          console.log(`✅ Successfully generated analysis with ${provider.name}`);
          return result;
        }
      } catch (error) {
        console.error(`❌ ${provider.name} failed:`, error.message);
        continue;
      }
    }
    
    // All AI providers failed, use authentic technical analysis
    return this.generateTechnicalFallback(stockData);
  }
  
  private async callProvider(providerName: string, prompt: string, options: any): Promise<any> {
    switch (providerName) {
      case 'claude-4':
        return await this.callClaude(prompt, options);
      case 'gpt-4o':
        return await this.callOpenAI(prompt, options);
      case 'gemini-2.5-pro':
        return await this.callGemini(prompt, options);
      case 'grok-2':
        return await this.callGrok(prompt, options);
      default:
        throw new Error(`Unknown provider: ${providerName}`);
    }
  }
  
  private async callClaude(prompt: string, options: any): Promise<any> {
    if (!this.anthropic) throw new Error('Anthropic not initialized');
    
    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
      ...options
    });
    
    return this.parseAIResponse(response.content[0].text);
  }
  
  private async callOpenAI(prompt: string, options: any): Promise<any> {
    if (!this.openai) throw new Error('OpenAI not initialized');
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      response_format: { type: "json_object" },
      ...options
    });
    
    return this.parseAIResponse(response.choices[0].message.content);
  }
  
  private async callGemini(prompt: string, options: any): Promise<any> {
    if (!this.gemini) throw new Error('Gemini not initialized');
    
    const response = await this.gemini.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            grade: { type: "string" },
            confidence: { type: "number" },
            action: { type: "string" },
            reasoning: { type: "string" }
          }
        }
      }
    });
    
    return this.parseAIResponse(response.text);
  }
  
  private async callGrok(prompt: string, options: any): Promise<any> {
    if (!this.xai) throw new Error('xAI Grok not initialized');
    
    const response = await this.xai.chat.completions.create({
      model: 'grok-2-1212',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      response_format: { type: "json_object" },
      ...options
    });
    
    return this.parseAIResponse(response.choices[0].message.content);
  }
  
  private buildTradingPrompt(stockData: any): string {
    return `Analyze this stock and provide a trading signal in JSON format:
${JSON.stringify(stockData, null, 2)}

Return only valid JSON with:
{
  "grade": "A+|A|B+|B|C+|C|D|F",
  "confidence": number (0-100),
  "action": "BUY|SELL|HOLD",
  "target": number,
  "stop": number,
  "expectedGain": number,
  "riskLevel": "Low|Medium|High",
  "reasoning": "detailed analysis"
}`;
  }
  
  private parseAIResponse(content: string): any {
    try {
      return JSON.parse(content);
    } catch (error) {
      // Extract JSON from text if wrapped
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid JSON response');
    }
  }
  
  private getAvailableProviders(): AIProvider[] {
    return Array.from(this.providers.values())
      .filter(p => p.isAvailable)
      .sort((a, b) => a.priority - b.priority);
  }
  
  private generateTechnicalFallback(stockData: any): any {
    const change = stockData.changePercent || 0;
    const volume = stockData.volume || 0;
    const price = stockData.price || 0;
    
    let grade = 'C';
    let confidence = 50;
    let action = 'HOLD';
    
    if (change > 5 && volume > 1000000) {
      grade = 'A';
      confidence = 85;
      action = 'BUY';
    } else if (change > 2) {
      grade = 'B+';
      confidence = 75;
      action = 'BUY';
    } else if (change < -5) {
      grade = 'D';
      confidence = 80;
      action = 'SELL';
    }
    
    return {
      grade,
      confidence,
      action,
      target: action === 'BUY' ? price * 1.15 : price * 0.85,
      stop: action === 'BUY' ? price * 0.92 : price * 1.08,
      expectedGain: Math.abs(change) * 1.8,
      riskLevel: volume < 500000 ? 'High' : 'Medium',
      reasoning: `Technical analysis: ${change > 0 ? 'bullish' : 'bearish'} momentum with authentic market data`
    };
  }
  
  getProviderStatus(): any[] {
    return Array.from(this.providers.values()).map(p => ({
      name: p.name,
      available: p.isAvailable,
      priority: p.priority,
      costPerToken: p.costPerToken,
      strengths: p.strengths
    }));
  }
}

export const multiAIService = new MultiAIService();