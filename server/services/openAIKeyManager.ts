/**
 * OpenAI Key Manager - Ensures proper API key formatting across the entire system
 */

export class OpenAIKeyManager {
  private static cleanedKey: string | null = null;
  
  /**
   * Get the properly cleaned OpenAI API key
   */
  static getCleanKey(): string {
    if (this.cleanedKey) {
      return this.cleanedKey;
    }
    
    const rawKey = process.env.OPENAI_API_KEY;
    if (!rawKey) {
      console.error('❌ OpenAI API key not found in environment variables');
      return '';
    }
    
    // Remove all possible prefixes and whitespace
    let cleanKey = rawKey.trim();
    
    // Remove Authorization header prefixes
    cleanKey = cleanKey.replace(/^Authorization:\s*Bearer\s+/i, '');
    cleanKey = cleanKey.replace(/^Bearer\s+/i, '');
    cleanKey = cleanKey.replace(/^Authorization:\s*/i, '');
    
    // Remove any remaining whitespace or quotes
    cleanKey = cleanKey.replace(/['"]/g, '').trim();
    
    // Validate the key format
    if (!cleanKey.startsWith('sk-') || cleanKey.length < 20) {
      console.error('❌ Invalid OpenAI API key format:', cleanKey.substring(0, 10) + '...');
      return '';
    }
    
    console.log('✅ OpenAI API key cleaned and validated successfully');
    this.cleanedKey = cleanKey;
    return cleanKey;
  }
  
  /**
   * Test the OpenAI API key by making a simple call
   */
  static async testKey(): Promise<boolean> {
    const key = this.getCleanKey();
    if (!key) return false;
    
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('✅ OpenAI API key test successful');
        return true;
      } else {
        console.error('❌ OpenAI API key test failed:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ OpenAI API key test error:', error);
      return false;
    }
  }
  
  /**
   * Reset the cached key (useful when environment changes)
   */
  static resetCache(): void {
    this.cleanedKey = null;
  }
}

export const openAIKeyManager = OpenAIKeyManager;