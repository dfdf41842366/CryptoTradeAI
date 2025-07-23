/**
 * Authentic OpenAI Service - Ensures 100% real data with proper authentication
 */

import OpenAI from 'openai';

export class AuthenticOpenAIService {
  private static instance: AuthenticOpenAIService;
  private openai: OpenAI | null = null;
  private isAuthenticated = false;
  private lastKeyCheck = 0;
  
  constructor() {
    this.initializeWithRealKey();
  }
  
  static getInstance(): AuthenticOpenAIService {
    if (!AuthenticOpenAIService.instance) {
      AuthenticOpenAIService.instance = new AuthenticOpenAIService();
    }
    return AuthenticOpenAIService.instance;
  }
  
  private initializeWithRealKey(): void {
    const rawKey = process.env.OPENAI_API_KEY;
    
    if (!rawKey) {
      console.error('❌ No OpenAI API key found in environment');
      return;
    }
    
    // Extract the real key from whatever format it's in
    let cleanKey = this.extractRealKey(rawKey);
    
    if (cleanKey) {
      this.openai = new OpenAI({ apiKey: cleanKey });
      this.validateAuthentication();
    }
  }
  
  private extractRealKey(rawKey: string): string | null {
    console.log(`🔍 Processing OpenAI key: ${rawKey.substring(0, 20)}...`);
    
    // Handle different possible formats
    let key = rawKey.trim();
    
    // If it's in Authorization header format
    if (key.includes('Authorization:') || key.includes('Bearer')) {
      const bearerMatch = key.match(/Bearer\s+([^\s\n\r<>]+)/i);
      if (bearerMatch && bearerMatch[1]) {
        key = bearerMatch[1];
      } else {
        // Fallback cleaning
        key = key.replace(/^Authorization:\s*/i, '');
        key = key.replace(/^Bearer\s+/i, '');
      }
    }
    
    // Clean up any artifacts
    key = key.replace(/['"<>]/g, '');
    key = key.replace(/\s+/g, '');
    key = key.trim();
    
    // Check if it's still a placeholder
    if (key === '<token>' || key === 'token' || key.includes('<token>') || key.length < 20) {
      console.error('❌ API key is still a placeholder or invalid');
      return null;
    }
    
    // Validate OpenAI key format
    if (key.startsWith('sk-') && key.length > 40) {
      console.log('✅ Valid OpenAI API key format detected');
      return key;
    }
    
    console.error(`❌ Invalid OpenAI key format: ${key.substring(0, 15)}... (length: ${key.length})`);
    return null;
  }
  
  private async validateAuthentication(): Promise<void> {
    if (!this.openai) return;
    
    try {
      console.log('🔍 Testing OpenAI authentication...');
      const response = await this.openai.models.list();
      
      if (response.data && response.data.length > 0) {
        this.isAuthenticated = true;
        this.lastKeyCheck = Date.now();
        console.log('✅ OpenAI authentication successful');
        console.log(`✅ Available models: ${response.data.length} (including gpt-4o)`);
      } else {
        this.isAuthenticated = false;
        console.error('❌ OpenAI authentication failed - no models returned');
      }
    } catch (error: any) {
      this.isAuthenticated = false;
      console.error('❌ OpenAI authentication error:', error.message);
    }
  }
  
  async generateAnalysis(prompt: string, options: any = {}): Promise<string> {
    if (!this.isAuthenticated || !this.openai) {
      throw new Error('OpenAI not authenticated - cannot generate analysis');
    }
    
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
        ...options
      });
      
      const analysis = response.choices[0]?.message?.content;
      if (!analysis) {
        throw new Error('No analysis generated from OpenAI');
      }
      
      console.log('✅ Generated authentic OpenAI analysis');
      return analysis;
    } catch (error: any) {
      console.error('❌ OpenAI analysis generation error:', error.message);
      throw error;
    }
  }
  
  async generateTradingSignal(stockData: any): Promise<any> {
    if (!this.isAuthenticated) {
      throw new Error('OpenAI not authenticated - cannot generate trading signals');
    }
    
    const prompt = `Analyze this stock data and provide a trading signal in JSON format:
${JSON.stringify(stockData, null, 2)}

Return only valid JSON with:
{
  "grade": "A+|A|B+|B|C+|C|D|F",
  "confidence": number (0-100),
  "action": "BUY|SELL|HOLD",
  "target": number,
  "stop": number,
  "reasoning": "detailed analysis"
}`;
    
    try {
      const response = await this.openai!.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.3,
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No trading signal generated');
      }
      
      const signal = JSON.parse(content);
      console.log(`✅ Generated authentic trading signal for ${stockData.symbol}: ${signal.grade} ${signal.action}`);
      return signal;
    } catch (error: any) {
      console.error('❌ Trading signal generation error:', error.message);
      throw error;
    }
  }
  
  isReady(): boolean {
    return this.isAuthenticated && this.openai !== null;
  }
  
  getStatus(): string {
    if (this.isAuthenticated) return 'authenticated';
    if (this.openai) return 'key_invalid';
    return 'no_key';
  }
}

export const authenticOpenAI = AuthenticOpenAIService.getInstance();