import axios from 'axios';
import { simpleAPIManager } from './simpleAPIManager';

interface APITestResult {
  apiName: string;
  success: boolean;
  responseTime: number;
  error?: string;
  statusCode?: number;
  dataReceived?: boolean;
  rateLimitInfo?: {
    remaining: number;
    resetTime: number;
  };
}

export class APITester {
  private static instance: APITester;
  private testResults: Map<string, APITestResult[]> = new Map();

  static getInstance(): APITester {
    if (!APITester.instance) {
      APITester.instance = new APITester();
    }
    return APITester.instance;
  }

  /**
   * Test Yahoo Finance API with authentic data and rate limit handling
   */
  async testYahooFinance(): Promise<APITestResult> {
    const startTime = Date.now();
    
    // Check rate limits first
    if (!simpleAPIManager.canMakeCall('Yahoo Finance')) {
      return {
        apiName: 'Yahoo Finance',
        success: false,
        responseTime: Date.now() - startTime,
        error: 'Rate limit exceeded - waiting for reset'
      };
    }

    const testSymbol = 'AAPL'; // Use reliable symbol
    
    try {
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await axios.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${testSymbol}`,
        {
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }
      );

      const responseTime = Date.now() - startTime;
      const hasData = response.data?.chart?.result?.length > 0;

      const result: APITestResult = {
        apiName: 'Yahoo Finance',
        success: response.status === 200 && hasData,
        responseTime,
        statusCode: response.status,
        dataReceived: hasData
      };

      simpleAPIManager.recordAPICall('Yahoo Finance', result.success, responseTime, 
        result.success ? undefined : 'No valid data received');

      return result;
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      // Handle rate limiting specifically
      if (error.response?.status === 429 || error.message?.includes('Too Many Requests')) {
        simpleAPIManager.recordAPICall('Yahoo Finance', false, responseTime, 'Rate limited');
        return {
          apiName: 'Yahoo Finance',
          success: false,
          responseTime,
          error: 'Rate limited - will retry later',
          statusCode: 429
        };
      }

      const result: APITestResult = {
        apiName: 'Yahoo Finance',
        success: false,
        responseTime,
        error: error.response?.data || error.message || 'Connection failed',
        statusCode: error.response?.status
      };

      simpleAPIManager.recordAPICall('Yahoo Finance', false, responseTime, result.error);
      return result;
    }
  }

  /**
   * Test Finnhub API with authentic data
   */
  async testFinnhub(): Promise<APITestResult> {
    const api = simpleAPIManager.getAPI('Finnhub Stock API');
    const startTime = Date.now();

    if (!api?.key) {
      return {
        apiName: 'Finnhub Stock API',
        success: false,
        responseTime: Date.now() - startTime,
        error: 'API key required'
      };
    }

    try {
      const response = await axios.get(
        `https://finnhub.io/api/v1/quote?symbol=AAPL&token=${api.key}`,
        { timeout: 10000 }
      );

      const responseTime = Date.now() - startTime;
      const hasData = response.data && typeof response.data.c === 'number';

      const result: APITestResult = {
        apiName: 'Finnhub Stock API',
        success: response.status === 200 && hasData,
        responseTime,
        statusCode: response.status,
        dataReceived: hasData
      };

      simpleAPIManager.recordAPICall('Finnhub Stock API', result.success, responseTime,
        result.success ? undefined : 'Invalid response data');

      return result;
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      const result: APITestResult = {
        apiName: 'Finnhub Stock API',
        success: false,
        responseTime,
        error: error.response?.data?.error || error.message,
        statusCode: error.response?.status
      };

      simpleAPIManager.recordAPICall('Finnhub Stock API', false, responseTime, result.error);
      return result;
    }
  }

  /**
   * Test Alpha Vantage API with authentic data
   */
  async testAlphaVantage(): Promise<APITestResult> {
    const api = simpleAPIManager.getAPI('Alpha Vantage');
    const startTime = Date.now();

    if (!api?.key) {
      return {
        apiName: 'Alpha Vantage',
        success: false,
        responseTime: Date.now() - startTime,
        error: 'API key required'
      };
    }

    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${api.key}`,
        { timeout: 15000 }
      );

      const responseTime = Date.now() - startTime;
      const hasData = response.data && response.data['Global Quote'];

      const result: APITestResult = {
        apiName: 'Alpha Vantage',
        success: response.status === 200 && hasData,
        responseTime,
        statusCode: response.status,
        dataReceived: hasData
      };

      simpleAPIManager.recordAPICall('Alpha Vantage', result.success, responseTime,
        result.success ? undefined : 'No quote data received');

      return result;
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      const result: APITestResult = {
        apiName: 'Alpha Vantage',
        success: false,
        responseTime,
        error: error.response?.data?.Note || error.message,
        statusCode: error.response?.status
      };

      simpleAPIManager.recordAPICall('Alpha Vantage', false, responseTime, result.error);
      return result;
    }
  }

  /**
   * Test News API with authentic data
   */
  async testNewsAPI(): Promise<APITestResult> {
    const api = simpleAPIManager.getAPI('News API');
    const startTime = Date.now();

    if (!api?.key) {
      return {
        apiName: 'News API',
        success: false,
        responseTime: Date.now() - startTime,
        error: 'API key required'
      };
    }

    try {
      const response = await axios.get(
        `https://newsapi.org/v2/everything?q=stocks&language=en&sortBy=publishedAt&pageSize=1&apiKey=${api.key}`,
        { timeout: 10000 }
      );

      const responseTime = Date.now() - startTime;
      const hasData = response.data && response.data.articles && response.data.articles.length > 0;

      const result: APITestResult = {
        apiName: 'News API',
        success: response.status === 200 && hasData,
        responseTime,
        statusCode: response.status,
        dataReceived: hasData
      };

      simpleAPIManager.recordAPICall('News API', result.success, responseTime,
        result.success ? undefined : 'No articles received');

      return result;
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      const result: APITestResult = {
        apiName: 'News API',
        success: false,
        responseTime,
        error: error.response?.data?.message || error.message,
        statusCode: error.response?.status
      };

      simpleAPIManager.recordAPICall('News API', false, responseTime, result.error);
      return result;
    }
  }

  /**
   * Test StockTwits API with authentic data
   */
  async testStockTwits(): Promise<APITestResult> {
    const startTime = Date.now();

    try {
      const response = await axios.get(
        'https://api.stocktwits.com/api/2/streams/symbol/AAPL.json',
        { timeout: 10000 }
      );

      const responseTime = Date.now() - startTime;
      const hasData = response.data && response.data.messages && response.data.messages.length > 0;

      const result: APITestResult = {
        apiName: 'StockTwits',
        success: response.status === 200 && hasData,
        responseTime,
        statusCode: response.status,
        dataReceived: hasData
      };

      simpleAPIManager.recordAPICall('StockTwits', result.success, responseTime,
        result.success ? undefined : 'No messages received');

      return result;
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      const result: APITestResult = {
        apiName: 'StockTwits',
        success: false,
        responseTime,
        error: error.message,
        statusCode: error.response?.status
      };

      simpleAPIManager.recordAPICall('StockTwits', false, responseTime, result.error);
      return result;
    }
  }

  /**
   * Test OpenAI API with cleaned key and authentic data
   */
  async testOpenAI(): Promise<APITestResult> {
    const startTime = Date.now();

    // Clean the OpenAI API key
    const rawKey = process.env.OPENAI_API_KEY;
    let cleanKey = '';
    
    if (rawKey) {
      cleanKey = rawKey.trim();
      cleanKey = cleanKey.replace(/^Authorization:\s*Bearer\s+/i, '');
      cleanKey = cleanKey.replace(/^Bearer\s+/i, '');
      cleanKey = cleanKey.replace(/^Authorization:\s*/i, '');
      cleanKey = cleanKey.replace(/['"]/g, '').trim();
    }

    if (!cleanKey) {
      return {
        apiName: 'OpenAI GPT-4o',
        success: false,
        responseTime: Date.now() - startTime,
        error: 'API key missing or invalid format'
      };
    }

    try {
      console.log('🔍 Testing OpenAI API with cleaned key...');
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o',
          messages: [{ role: 'user', content: 'Test connection - respond with "OK"' }],
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

      const responseTime = Date.now() - startTime;
      const hasData = response.data?.choices?.length > 0;

      const result: APITestResult = {
        apiName: 'OpenAI GPT-4o',
        success: response.status === 200 && hasData,
        responseTime,
        statusCode: response.status,
        dataReceived: hasData
      };

      simpleAPIManager.recordAPICall('OpenAI GPT-4o', result.success, responseTime,
        result.success ? undefined : 'No response from model');

      console.log(`✅ OpenAI API test: ${result.success ? 'SUCCESS' : 'FAILED'}`);
      return result;
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error.response?.data?.error?.message || error.message;
      
      console.log(`❌ OpenAI API test failed: ${errorMessage}`);
      
      const result: APITestResult = {
        apiName: 'OpenAI GPT-4o',
        success: false,
        responseTime,
        error: errorMessage,
        statusCode: error.response?.status
      };

      simpleAPIManager.recordAPICall('OpenAI GPT-4o', false, responseTime, result.error);
      return result;
    }
  }

  /**
   * Test specific API by name
   */
  async testAPI(apiName: string): Promise<APITestResult> {
    switch (apiName) {
      case 'Yahoo Finance':
        return this.testYahooFinance();
      case 'Finnhub Stock API':
        return this.testFinnhub();
      case 'Alpha Vantage':
        return this.testAlphaVantage();
      case 'News API':
        return this.testNewsAPI();
      case 'StockTwits':
        return this.testStockTwits();
      case 'OpenAI GPT-4o':
        return this.testOpenAI();
      default:
        return {
          apiName,
          success: false,
          responseTime: 0,
          error: 'API test not implemented'
        };
    }
  }

  /**
   * Test all APIs with comprehensive rate limiting optimization
   */
  async testAllAPIs(): Promise<APITestResult[]> {
    const results: APITestResult[] = [];
    const apis = simpleAPIManager.getAllAPIs();
    
    console.log('🧪 API Tester: Starting comprehensive API testing with rate limiting optimization');

    // Test APIs in priority order with intelligent delays
    const testOrder = [
      { priority: 'essential', delay: 3000 },
      { priority: 'optional', delay: 5000 }
    ];

    for (const { priority, delay } of testOrder) {
      console.log(`📋 Testing ${priority} APIs with ${delay}ms delays...`);
      
      for (const category of Object.values(apis)) {
        for (const api of category) {
          if (api.priority === priority) {
            // Skip if rate limited
            if (!simpleAPIManager.canMakeCall(api.name)) {
              console.log(`⏳ ${api.name}: Rate limited - skipping`);
              results.push({
                apiName: api.name,
                success: false,
                responseTime: 0,
                error: 'Rate limit exceeded - will retry later'
              });
              continue;
            }

            console.log(`🔍 Testing ${api.name} with authentic data...`);
            const result = await this.testAPI(api.name);
            results.push(result);

            // Log result immediately
            if (result.success) {
              console.log(`✅ ${api.name}: SUCCESS (${result.responseTime}ms)`);
            } else {
              console.log(`❌ ${api.name}: FAILED - ${result.error}`);
            }

            // Intelligent delay based on previous result
            const nextDelay = result.success ? delay : delay * 2;
            console.log(`⏱️ Waiting ${nextDelay}ms before next test...`);
            await new Promise(resolve => setTimeout(resolve, nextDelay));
          }
        }
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failedAPIs = results.filter(r => !r.success).map(r => r.apiName);
    
    console.log(`🏁 API Testing Complete: ${successCount}/${results.length} APIs operational`);
    if (failedAPIs.length > 0) {
      console.log(`❌ Failed APIs: ${failedAPIs.join(', ')}`);
    }

    return results;
  }

  /**
   * Get test history for an API
   */
  getTestHistory(apiName: string): APITestResult[] {
    return this.testResults.get(apiName) || [];
  }

  /**
   * Store test result in history
   */
  private storeTestResult(result: APITestResult) {
    const history = this.testResults.get(result.apiName) || [];
    history.push(result);
    
    // Keep only last 10 results
    if (history.length > 10) {
      history.shift();
    }
    
    this.testResults.set(result.apiName, history);
  }
}

export const apiTester = APITester.getInstance();