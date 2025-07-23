import { apiManager, APIConfig } from './apiManager';
import { performanceOptimizer } from './performanceOptimizer';

interface APICallRequest {
  apiName: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  headers?: Record<string, string>;
  priority: 'high' | 'medium' | 'low';
  cacheable?: boolean;
  cacheKey?: string;
  cacheDuration?: number;
}

interface APICallResult {
  success: boolean;
  data?: any;
  error?: string;
  responseTime: number;
  fromCache: boolean;
  apiUsed: string;
}

export class AIAPIOptimizer {
  private requestQueue: Map<string, APICallRequest[]> = new Map();
  private batchCallTimer: NodeJS.Timeout | null = null;
  private optimizationRules = new Map<string, any>();

  constructor() {
    this.initializeOptimizationRules();
    this.startBatchProcessor();
  }

  /**
   * Initialize AI-driven optimization rules
   */
  private initializeOptimizationRules() {
    // Market data optimization rules
    this.optimizationRules.set('market_data', {
      batchSize: 10,
      batchDelay: 2000, // 2 seconds
      cacheStrategy: 'aggressive',
      fallbackAPIs: ['Yahoo Finance', 'Finnhub Stock API', 'Alpha Vantage'],
      retryAttempts: 3,
      parallelCalls: 5
    });

    // AI analysis optimization rules
    this.optimizationRules.set('ai_analysis', {
      batchSize: 3,
      batchDelay: 5000, // 5 seconds to avoid rate limits
      cacheStrategy: 'conservative',
      fallbackAPIs: ['OpenAI GPT-4o'],
      retryAttempts: 2,
      parallelCalls: 1
    });

    // News optimization rules
    this.optimizationRules.set('news', {
      batchSize: 15,
      batchDelay: 10000, // 10 seconds
      cacheStrategy: 'moderate',
      fallbackAPIs: ['News API', 'StockTwits API'],
      retryAttempts: 2,
      parallelCalls: 3
    });
  }

  /**
   * Optimized API call with intelligent routing and caching
   */
  async makeOptimizedCall(request: APICallRequest): Promise<APICallResult> {
    const startTime = Date.now();
    
    // Check cache first for cacheable requests
    if (request.cacheable && request.cacheKey) {
      const cached = await this.getCachedResult(request.cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          responseTime: Date.now() - startTime,
          fromCache: true,
          apiUsed: 'cache'
        };
      }
    }

    // Get optimal API for the request
    const api = this.getOptimalAPIForRequest(request);
    if (!api) {
      return {
        success: false,
        error: 'No available API for request',
        responseTime: Date.now() - startTime,
        fromCache: false,
        apiUsed: 'none'
      };
    }

    // Check rate limits
    const rateLimitCheck = apiManager.canMakeCall(api.name);
    if (!rateLimitCheck.allowed) {
      // Try to find alternative API or queue the request
      return await this.handleRateLimitedRequest(request, rateLimitCheck.reason, rateLimitCheck.waitTime);
    }

    // Make the API call
    try {
      const result = await this.executeAPICall(api, request);
      
      // Cache successful results
      if (result.success && request.cacheable && request.cacheKey) {
        await this.cacheResult(request.cacheKey, result.data, request.cacheDuration || 300000);
      }

      return result;
    } catch (error) {
      // Try fallback APIs
      return await this.tryFallbackAPIs(request, api.name, error.message);
    }
  }

  /**
   * Batch API calls for efficiency
   */
  async batchOptimizedCalls(requests: APICallRequest[]): Promise<APICallResult[]> {
    // Group requests by API and priority
    const groupedRequests = this.groupRequestsByAPI(requests);
    const results: APICallResult[] = [];

    // Process each group with optimal timing
    for (const [apiName, apiRequests] of Array.from(groupedRequests.entries())) {
      const api = apiManager.getAPI(apiName);
      if (!api) continue;

      const rules = this.optimizationRules.get(api.category);
      const batchSize = rules?.batchSize || 5;
      
      // Process in batches to respect rate limits
      for (let i = 0; i < apiRequests.length; i += batchSize) {
        const batch = apiRequests.slice(i, i + batchSize);
        const batchResults = await Promise.allSettled(
          batch.map((req: APICallRequest) => this.makeOptimizedCall(req))
        );

        batchResults.forEach(result => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            const errorMessage = result.reason instanceof Error ? result.reason.message : 'Batch call failed';
            results.push({
              success: false,
              error: errorMessage,
              responseTime: 0,
              fromCache: false,
              apiUsed: apiName
            });
          }
        });

        // Add delay between batches
        if (i + batchSize < apiRequests.length) {
          await new Promise(resolve => setTimeout(resolve, rules?.batchDelay || 2000));
        }
      }
    }

    return results;
  }

  /**
   * Intelligent API selection based on multiple factors
   */
  private getOptimalAPIForRequest(request: APICallRequest): APIConfig | null {
    const api = apiManager.getAPI(request.apiName);
    
    // If specific API requested and available, use it
    if (api && apiManager.canMakeCall(api.name).allowed) {
      return api;
    }

    // Otherwise, find optimal API for the category
    const category = this.inferCategoryFromEndpoint(request.endpoint);
    return apiManager.getOptimalAPI(category);
  }

  /**
   * Handle rate-limited requests
   */
  private async handleRateLimitedRequest(
    request: APICallRequest, 
    reason: string, 
    waitTime?: number
  ): Promise<APICallResult> {
    console.log(`🚦 Rate limit hit for ${request.apiName}: ${reason}`);

    // Try alternative APIs first
    const category = this.inferCategoryFromEndpoint(request.endpoint);
    const alternativeAPI = apiManager.getOptimalAPI(category, [request.apiName]);
    
    if (alternativeAPI) {
      console.log(`🔄 Switching to alternative API: ${alternativeAPI.name}`);
      request.apiName = alternativeAPI.name;
      return await this.makeOptimizedCall(request);
    }

    // If no alternatives and request is low priority, queue it
    if (request.priority === 'low' && waitTime && waitTime < 300000) {
      return await this.queueRequest(request, waitTime);
    }

    return {
      success: false,
      error: `Rate limited: ${reason}`,
      responseTime: 0,
      fromCache: false,
      apiUsed: request.apiName
    };
  }

  /**
   * Try fallback APIs when primary fails
   */
  private async tryFallbackAPIs(
    request: APICallRequest, 
    failedAPI: string, 
    error: string
  ): Promise<APICallResult> {
    const category = this.inferCategoryFromEndpoint(request.endpoint);
    const rules = this.optimizationRules.get(category);
    const fallbackAPIs = rules?.fallbackAPIs || [];

    for (const fallbackAPIName of fallbackAPIs) {
      if (fallbackAPIName === failedAPI) continue;

      const fallbackAPI = apiManager.getAPI(fallbackAPIName);
      if (!fallbackAPI || !apiManager.canMakeCall(fallbackAPI.name).allowed) continue;

      console.log(`🔄 Trying fallback API: ${fallbackAPIName}`);
      
      try {
        request.apiName = fallbackAPIName;
        return await this.executeAPICall(fallbackAPI, request);
      } catch (fallbackError) {
        const errorMessage = fallbackError instanceof Error ? fallbackError.message : 'Unknown error';
        console.log(`❌ Fallback API ${fallbackAPIName} also failed: ${errorMessage}`);
        continue;
      }
    }

    return {
      success: false,
      error: `All APIs failed. Primary error: ${error}`,
      responseTime: 0,
      fromCache: false,
      apiUsed: failedAPI
    };
  }

  /**
   * Execute the actual API call
   */
  private async executeAPICall(api: APIConfig, request: APICallRequest): Promise<APICallResult> {
    const startTime = Date.now();
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'AI-Trading-Platform/1.0',
        ...request.headers
      };

      // Add API key if required
      if (api.key) {
        if (api.name === 'OpenAI GPT-4o') {
          headers['Authorization'] = `Bearer ${api.key}`;
        } else if (api.name === 'Finnhub Stock API') {
          headers['X-Finnhub-Token'] = api.key;
        } else if (api.name === 'Alpha Vantage') {
          // Alpha Vantage uses query parameter
        } else {
          headers['Authorization'] = `Bearer ${api.key}`;
        }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(request.endpoint, {
        method: request.method,
        headers,
        body: request.data ? JSON.stringify(request.data) : undefined,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      // Record successful call
      apiManager.recordAPICall(api.name, true, responseTime);

      return {
        success: true,
        data: responseData,
        responseTime,
        fromCache: false,
        apiUsed: api.name
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Record failed call
      apiManager.recordAPICall(api.name, false, responseTime, errorMessage);

      throw error;
    }
  }

  /**
   * Cache result for future use
   */
  private async cacheResult(key: string, data: any, duration: number): Promise<void> {
    return performanceOptimizer.smartCache(key, async () => data, duration);
  }

  /**
   * Get cached result
   */
  private async getCachedResult(key: string): Promise<any | null> {
    try {
      // Check if cache exists for this key
      const cached = performanceOptimizer.getFromCache?.(key);
      return cached || null;
    } catch {
      return null;
    }
  }

  /**
   * Queue request for later execution
   */
  private async queueRequest(request: APICallRequest, waitTime: number): Promise<APICallResult> {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const result = await this.makeOptimizedCall(request);
        resolve(result);
      }, waitTime);
    });
  }

  /**
   * Group requests by API for batch processing
   */
  private groupRequestsByAPI(requests: APICallRequest[]): Map<string, APICallRequest[]> {
    const grouped = new Map<string, APICallRequest[]>();
    
    requests.forEach(request => {
      const apiName = request.apiName;
      if (!grouped.has(apiName)) {
        grouped.set(apiName, []);
      }
      grouped.get(apiName)!.push(request);
    });

    return grouped;
  }

  /**
   * Infer API category from endpoint
   */
  private inferCategoryFromEndpoint(endpoint: string): string {
    if (endpoint.includes('finance') || endpoint.includes('stock') || endpoint.includes('market')) {
      return 'market_data';
    }
    if (endpoint.includes('openai') || endpoint.includes('gpt')) {
      return 'ai_analysis';
    }
    if (endpoint.includes('news') || endpoint.includes('stocktwits')) {
      return 'news';
    }
    if (endpoint.includes('discord') || endpoint.includes('telegram')) {
      return 'notifications';
    }
    return 'utilities';
  }

  /**
   * Start batch processor for queued requests
   */
  private startBatchProcessor(): void {
    setInterval(() => {
      this.processBatchedRequests();
    }, 5000); // Process every 5 seconds
  }

  /**
   * Process batched requests
   */
  private async processBatchedRequests(): Promise<void> {
    if (this.requestQueue.size === 0) return;

    for (const [priority, requests] of Array.from(this.requestQueue.entries())) {
      if (requests.length === 0) continue;

      const batch = requests.splice(0, 10); // Process up to 10 requests at a time
      
      // Process batch asynchronously
      this.batchOptimizedCalls(batch).catch(error => {
        console.error('Batch processing error:', error);
      });
    }
  }

  /**
   * Get optimization statistics
   */
  getOptimizationStats() {
    const apis = apiManager.getAllAPIs();
    const stats = {
      totalAPIs: Object.values(apis).flat().length,
      activeAPIs: Object.values(apis).flat().filter(api => api.status === 'active').length,
      totalCalls: Object.values(apis).flat().reduce((sum, api) => sum + api.successCount + api.errorCount, 0),
      successRate: 0,
      avgResponseTime: 0,
      cacheHitRate: 0
    };

    const totalSuccessful = Object.values(apis).flat().reduce((sum, api) => sum + api.successCount, 0);
    stats.successRate = stats.totalCalls > 0 ? (totalSuccessful / stats.totalCalls) * 100 : 0;
    
    const totalResponseTime = Object.values(apis).flat().reduce((sum, api) => sum + (api.avgResponseTime * (api.successCount + api.errorCount)), 0);
    stats.avgResponseTime = stats.totalCalls > 0 ? totalResponseTime / stats.totalCalls : 0;

    return stats;
  }
}

export const aiAPIOptimizer = new AIAPIOptimizer();