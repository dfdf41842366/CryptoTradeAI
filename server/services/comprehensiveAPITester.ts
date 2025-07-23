/**
 * Comprehensive API Tester - Ensures 100% API call success with authentic data
 */

import axios from 'axios';
import { simpleAPIManager } from './simpleAPIManager';
import { apiKeyFixer } from './apiKeyFixer';

interface ComprehensiveTestResult {
  totalAPIs: number;
  workingAPIs: number;
  failedAPIs: number;
  successRate: number;
  allResults: {
    apiName: string;
    success: boolean;
    error?: string;
    responseTime: number;
  }[];
  recommendations: string[];
}

export class ComprehensiveAPITester {
  private static instance: ComprehensiveAPITester;
  
  static getInstance(): ComprehensiveAPITester {
    if (!ComprehensiveAPITester.instance) {
      ComprehensiveAPITester.instance = new ComprehensiveAPITester();
    }
    return ComprehensiveAPITester.instance;
  }

  /**
   * Test all APIs with comprehensive success ensuring
   */
  async testAllAPIsComprehensively(): Promise<ComprehensiveTestResult> {
    console.log('🧪 Comprehensive API Tester: Starting full system verification');
    
    const results: ComprehensiveTestResult['allResults'] = [];
    const recommendations: string[] = [];
    
    // Test essential APIs first
    await this.testEssentialAPIs(results, recommendations);
    
    // Test optional APIs
    await this.testOptionalAPIs(results, recommendations);
    
    const workingAPIs = results.filter(r => r.success).length;
    const failedAPIs = results.filter(r => !r.success).length;
    const successRate = results.length > 0 ? (workingAPIs / results.length) * 100 : 0;
    
    console.log(`🏁 Comprehensive Test Complete: ${workingAPIs}/${results.length} APIs working (${successRate.toFixed(1)}%)`);
    
    return {
      totalAPIs: results.length,
      workingAPIs,
      failedAPIs,
      successRate,
      allResults: results,
      recommendations
    };
  }

  private async testEssentialAPIs(results: any[], recommendations: string[]): Promise<void> {
    console.log('🔍 Testing Essential APIs...');
    
    // Test Yahoo Finance with proper delays
    const yahooResult = await this.testYahooFinanceRobust();
    results.push(yahooResult);
    
    if (!yahooResult.success) {
      recommendations.push('Yahoo Finance: Try alternative endpoints or reduce request frequency');
    }
    
    // Wait between essential API tests
    await this.delay(3000);
    
    // Test OpenAI with cleaned key
    const openaiResult = await this.testOpenAIRobust();
    results.push(openaiResult);
    
    if (!openaiResult.success) {
      recommendations.push('OpenAI: Verify API key format and authentication');
    }
    
    await this.delay(3000);
    
    // Test Finnhub
    const finnhubResult = await this.testFinnhubRobust();
    results.push(finnhubResult);
    
    if (!finnhubResult.success) {
      recommendations.push('Finnhub: Check API key and rate limits');
    }
  }

  private async testOptionalAPIs(results: any[], recommendations: string[]): Promise<void> {
    console.log('🔍 Testing Optional APIs...');
    
    // Test StockTwits (no auth required)
    await this.delay(2000);
    const stocktwitsResult = await this.testStockTwits();
    results.push(stocktwitsResult);
    
    // Test News API
    await this.delay(2000);
    const newsResult = await this.testNewsAPI();
    results.push(newsResult);
    
    if (!newsResult.success) {
      recommendations.push('News API: Verify API key and endpoint configuration');
    }
  }

  private async testYahooFinanceRobust(): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Use a more reliable approach with different endpoints
      const endpoints = [
        'https://query1.finance.yahoo.com/v8/finance/chart/AAPL',
        'https://query2.finance.yahoo.com/v8/finance/chart/AAPL'
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(endpoint, {
            timeout: 15000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Accept': '*/*',
              'Accept-Language': 'en-US,en;q=0.9'
            }
          });
          
          if (response.status === 200 && response.data?.chart?.result?.length > 0) {
            return {
              apiName: 'Yahoo Finance',
              success: true,
              responseTime: Date.now() - startTime
            };
          }
        } catch (error) {
          continue; // Try next endpoint
        }
      }
      
      return {
        apiName: 'Yahoo Finance',
        success: false,
        error: 'All endpoints failed',
        responseTime: Date.now() - startTime
      };
      
    } catch (error: any) {
      return {
        apiName: 'Yahoo Finance',
        success: false,
        error: error.message,
        responseTime: Date.now() - startTime
      };
    }
  }

  private async testOpenAIRobust(): Promise<any> {
    const startTime = Date.now();
    
    try {
      const cleanKey = apiKeyFixer.getCleanOpenAIKey();
      
      if (!cleanKey) {
        return {
          apiName: 'OpenAI GPT-4o',
          success: false,
          error: 'API key missing or invalid format',
          responseTime: Date.now() - startTime
        };
      }
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o',
          messages: [{ role: 'user', content: 'Respond with just "OK"' }],
          max_tokens: 5
        },
        {
          headers: {
            'Authorization': `Bearer ${cleanKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );
      
      const success = response.status === 200 && response.data?.choices?.length > 0;
      
      return {
        apiName: 'OpenAI GPT-4o',
        success,
        error: success ? undefined : 'No valid response received',
        responseTime: Date.now() - startTime
      };
      
    } catch (error: any) {
      return {
        apiName: 'OpenAI GPT-4o',
        success: false,
        error: error.response?.data?.error?.message || error.message,
        responseTime: Date.now() - startTime
      };
    }
  }

  private async testFinnhubRobust(): Promise<any> {
    const startTime = Date.now();
    
    try {
      const apiKey = process.env.FINNHUB_API_KEY;
      
      if (!apiKey) {
        return {
          apiName: 'Finnhub Stock API',
          success: false,
          error: 'API key not configured',
          responseTime: Date.now() - startTime
        };
      }
      
      const response = await axios.get(
        `https://finnhub.io/api/v1/quote?symbol=AAPL&token=${apiKey}`,
        { timeout: 15000 }
      );
      
      const hasData = response.data && typeof response.data.c === 'number';
      
      return {
        apiName: 'Finnhub Stock API',
        success: response.status === 200 && hasData,
        error: hasData ? undefined : 'No valid market data received',
        responseTime: Date.now() - startTime
      };
      
    } catch (error: any) {
      return {
        apiName: 'Finnhub Stock API',
        success: false,
        error: error.response?.data?.error || error.message,
        responseTime: Date.now() - startTime
      };
    }
  }

  private async testStockTwits(): Promise<any> {
    const startTime = Date.now();
    
    try {
      const response = await axios.get(
        'https://api.stocktwits.com/api/2/streams/symbol/AAPL.json',
        { timeout: 15000 }
      );
      
      const hasData = response.data?.messages?.length > 0;
      
      return {
        apiName: 'StockTwits',
        success: response.status === 200 && hasData,
        error: hasData ? undefined : 'No social sentiment data received',
        responseTime: Date.now() - startTime
      };
      
    } catch (error: any) {
      return {
        apiName: 'StockTwits',
        success: false,
        error: error.message,
        responseTime: Date.now() - startTime
      };
    }
  }

  private async testNewsAPI(): Promise<any> {
    const startTime = Date.now();
    
    try {
      const apiKey = '978240c2cd104f27ab47b27d54739c0d';
      
      const response = await axios.get(
        `https://newsapi.org/v2/everything?q=stocks&language=en&sortBy=relevancy&pageSize=5&apiKey=${apiKey}`,
        { timeout: 15000 }
      );
      
      const hasData = response.data?.articles?.length > 0;
      
      return {
        apiName: 'News API',
        success: response.status === 200 && hasData,
        error: hasData ? undefined : 'No news articles received',
        responseTime: Date.now() - startTime
      };
      
    } catch (error: any) {
      return {
        apiName: 'News API',
        success: false,
        error: error.response?.data?.message || error.message,
        responseTime: Date.now() - startTime
      };
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const comprehensiveAPITester = ComprehensiveAPITester.getInstance();