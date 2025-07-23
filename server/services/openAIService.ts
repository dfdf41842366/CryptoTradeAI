/**
 * Centralized OpenAI Service - Handles all OpenAI API calls with proper key management
 */

import OpenAI from 'openai';

export class OpenAIService {
  private static instance: OpenAIService;
  private openai: OpenAI;
  private keyStatus: 'valid' | 'invalid' | 'unknown' = 'unknown';
  
  constructor() {
    const cleanKey = this.getCleanAPIKey();
    this.openai = new OpenAI({ apiKey: cleanKey });
    this.validateKey();
  }
  
  static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }
  
  private getCleanAPIKey(): string {
    const rawKey = process.env.OPENAI_API_KEY;
    console.log('🔍 Raw OpenAI key detected, cleaning...');
    
    if (!rawKey) {
      console.error('❌ No OpenAI API key found in environment');
      return '';
    }
    
    // More aggressive cleaning
    let cleanKey = rawKey;
    
    // Remove HTTP header prefixes
    cleanKey = cleanKey.replace(/^Authorization:\s*/i, '');
    cleanKey = cleanKey.replace(/^Bearer\s+/i, '');
    
    // Remove any quotes, spaces, and newlines
    cleanKey = cleanKey.replace(/['"]/g, '');
    cleanKey = cleanKey.replace(/\s+/g, '');
    cleanKey = cleanKey.replace(/\n/g, '');
    cleanKey = cleanKey.replace(/\r/g, '');
    
    // Final trim
    cleanKey = cleanKey.trim();
    
    console.log(`🔍 Cleaned key format: ${cleanKey.substring(0, 10)}... (length: ${cleanKey.length})`);
    
    if (cleanKey.startsWith('sk-') && cleanKey.length > 40) {
      console.log('✅ OpenAI API key format validated');
      return cleanKey;
    } else {
      console.error(`❌ Invalid OpenAI key format. Expected sk-xxx..., got: ${cleanKey.substring(0, 15)}...`);
      return '';
    }
  }
  
  private async validateKey(): Promise<void> {
    try {
      const response = await this.openai.models.list();
      if (response.data && response.data.length > 0) {
        this.keyStatus = 'valid';
        console.log('✅ OpenAI API key validation successful');
      } else {
        this.keyStatus = 'invalid';
        console.error('❌ OpenAI API key validation failed - no models returned');
      }
    } catch (error) {
      this.keyStatus = 'invalid';
      console.error('❌ OpenAI API key validation failed:', error.message);
    }
  }
  
  async generateCompletion(messages: any[], options: any = {}): Promise<any> {
    if (this.keyStatus === 'invalid') {
      throw new Error('OpenAI API key is invalid');
    }
    
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
        ...options
      });
      
      return response;
    } catch (error) {
      console.error('❌ OpenAI completion error:', error.message);
      throw error;
    }
  }
  
  isKeyValid(): boolean {
    return this.keyStatus === 'valid';
  }
  
  getKeyStatus(): string {
    return this.keyStatus;
  }
}

export const openAIService = OpenAIService.getInstance();