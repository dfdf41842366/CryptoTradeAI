/**
 * API Key Fixer - Ensures all API keys are properly formatted and working
 */

export class APIKeyFixer {
  static cleanOpenAIKey(rawKey: string | null): string | null {
    if (!rawKey) return null;
    
    // Remove common prefixes that might corrupt the key
    const cleanKey = rawKey
      .replace(/^Authorization:\s*Bearer\s+/i, '')
      .replace(/^Bearer\s+/i, '')
      .replace(/^Authorization:\s*/i, '')
      .trim();
    
    // Validate the cleaned key format (should start with sk-)
    if (cleanKey.startsWith('sk-') && cleanKey.length > 20) {
      console.log('✅ OpenAI API key cleaned and validated');
      return cleanKey;
    }
    
    console.error('❌ OpenAI API key format invalid after cleaning:', cleanKey.substring(0, 10) + '...');
    return null;
  }
  
  static validateAPIKey(keyName: string, key: string | null): boolean {
    if (!key) return false;
    
    switch (keyName) {
      case 'OPENAI_API_KEY':
        return key.startsWith('sk-') && key.length > 20;
      case 'FINNHUB_API_KEY':
        return key.length > 10;
      case 'NEWS_API_KEY':
        return key.length > 10;
      default:
        return key.length > 5;
    }
  }
  
  static getCleanOpenAIKey(): string | null {
    const rawKey = process.env.OPENAI_API_KEY;
    return this.cleanOpenAIKey(rawKey);
  }
}

export const apiKeyFixer = APIKeyFixer;