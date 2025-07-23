/**
 * Performance Optimizer - Ultra-Fast Platform Operations
 * Ensures maximum speed and efficiency across all functions
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface PerformanceMetrics {
  apiCalls: number;
  cacheHits: number;
  cacheMisses: number;
  averageResponseTime: number;
  errorRate: number;
  totalRequests: number;
}

export class PerformanceOptimizer {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private requestQueue: Map<string, Promise<any>> = new Map();
  private metrics: PerformanceMetrics = {
    apiCalls: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageResponseTime: 0,
    errorRate: 0,
    totalRequests: 0
  };

  // Performance configuration
  private config = {
    defaultCacheTTL: 30000, // 30 seconds
    maxCacheSize: 10000,
    debounceDelay: 1000, // 1 second
    requestTimeout: 10000, // 10 seconds
    maxConcurrentRequests: 50
  };

  constructor() {
    console.log('🚀 Performance Optimizer: Initializing high-speed optimizations...');
    this.startMetricsReporting();
    this.startCacheCleanup();
  }

  /**
   * Cache data with automatic TTL management
   */
  public cache_set<T>(key: string, data: T, ttl?: number): void {
    const cacheEntry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultCacheTTL
    };

    // Prevent cache from growing too large
    if (this.cache.size >= this.config.maxCacheSize) {
      this.evictOldestEntries();
    }

    this.cache.set(key, cacheEntry);
  }

  /**
   * Retrieve cached data if valid
   */
  public cache_get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T>;
    
    if (!entry) {
      this.metrics.cacheMisses++;
      return null;
    }

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      this.metrics.cacheMisses++;
      return null;
    }

    this.metrics.cacheHits++;
    return entry.data;
  }

  /**
   * Smart caching with automatic key generation
   */
  public async smartCache<T>(
    keyBase: string,
    dataFetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cacheKey = `smart_${keyBase}_${JSON.stringify(arguments)}`;
    
    // Try cache first
    const cached = this.cache_get<T>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Fetch new data
    const startTime = Date.now();
    try {
      const data = await dataFetcher();
      this.cache_set(cacheKey, data, ttl);
      
      // Update metrics
      this.updateResponseTimeMetrics(Date.now() - startTime);
      this.metrics.apiCalls++;
      
      return data;
    } catch (error) {
      this.metrics.errorRate = (this.metrics.errorRate * this.metrics.totalRequests + 1) / (this.metrics.totalRequests + 1);
      throw error;
    } finally {
      this.metrics.totalRequests++;
    }
  }

  /**
   * Debounced API calls to prevent excessive requests
   */
  public async debouncedApiCall<T>(
    key: string,
    apiCall: () => Promise<T>,
    delay?: number
  ): Promise<T> {
    const debounceDelay = delay || this.config.debounceDelay;
    
    // Clear existing timer
    const existingTimer = this.debounceTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(async () => {
        try {
          const result = await apiCall();
          this.debounceTimers.delete(key);
          resolve(result);
        } catch (error) {
          this.debounceTimers.delete(key);
          reject(error);
        }
      }, debounceDelay);

      this.debounceTimers.set(key, timer);
    });
  }

  /**
   * Request deduplication to prevent duplicate API calls
   */
  public async deduplicateRequest<T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    // Check if request is already in flight
    const existingRequest = this.requestQueue.get(key);
    if (existingRequest) {
      return existingRequest as Promise<T>;
    }

    // Create new request
    const request = requestFn().finally(() => {
      this.requestQueue.delete(key);
    });

    this.requestQueue.set(key, request);
    return request;
  }

  /**
   * Batch API calls for efficiency
   */
  public async batchProcess<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 10,
    concurrency: number = 3
  ): Promise<R[]> {
    const results: R[] = [];
    
    // Split items into batches
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    // Process batches with controlled concurrency
    for (let i = 0; i < batches.length; i += concurrency) {
      const batchPromises = batches
        .slice(i, i + concurrency)
        .map(async (batch) => {
          const batchResults = await Promise.allSettled(
            batch.map(item => processor(item))
          );
          return batchResults
            .filter(result => result.status === 'fulfilled')
            .map(result => (result as PromiseFulfilledResult<R>).value);
        });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.flat());
    }

    return results;
  }

  /**
   * Intelligent rate limiting
   */
  public async rateLimitedCall<T>(
    key: string,
    apiCall: () => Promise<T>,
    rateLimit: number = 10, // calls per minute
    retryAttempts: number = 3
  ): Promise<T> {
    const rateLimitKey = `rateLimit_${key}`;
    const callHistory = this.cache_get<number[]>(rateLimitKey) || [];
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Remove calls older than 1 minute
    const recentCalls = callHistory.filter(timestamp => timestamp > oneMinuteAgo);

    if (recentCalls.length >= rateLimit) {
      const oldestCall = Math.min(...recentCalls);
      const waitTime = 60000 - (now - oldestCall);
      
      console.log(`⏱️ Rate limit reached for ${key}, waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Make the API call with retries
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        const result = await apiCall();
        
        // Record successful call
        recentCalls.push(Date.now());
        this.cache_set(rateLimitKey, recentCalls, 60000);
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < retryAttempts) {
          const backoffDelay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`🔄 Retry ${attempt}/${retryAttempts} for ${key} in ${backoffDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
      }
    }

    throw lastError || new Error(`Failed after ${retryAttempts} attempts`);
  }

  /**
   * Evict oldest cache entries when cache is full
   */
  private evictOldestEntries(): void {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toEvict = Math.floor(this.config.maxCacheSize * 0.1); // Evict 10%
    for (let i = 0; i < toEvict; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * Clean up expired cache entries
   */
  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      const keysToDelete: string[] = [];

      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(key => this.cache.delete(key));
      
      if (keysToDelete.length > 0) {
        console.log(`🧹 Performance Optimizer: Cleaned up ${keysToDelete.length} expired cache entries`);
      }
    }, 60000); // Clean every minute
  }

  /**
   * Update response time metrics
   */
  private updateResponseTimeMetrics(responseTime: number): void {
    const totalRequests = this.metrics.totalRequests;
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * totalRequests + responseTime) / (totalRequests + 1);
  }

  /**
   * Start periodic metrics reporting
   */
  private startMetricsReporting(): void {
    setInterval(() => {
      const cacheHitRate = this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100;
      
      console.log(`📊 Performance Metrics:
        • Cache Hit Rate: ${cacheHitRate.toFixed(1)}%
        • Avg Response Time: ${this.metrics.averageResponseTime.toFixed(0)}ms
        • Total API Calls: ${this.metrics.apiCalls}
        • Error Rate: ${(this.metrics.errorRate * 100).toFixed(1)}%
        • Cache Size: ${this.cache.size}/${this.config.maxCacheSize}
        • Active Requests: ${this.requestQueue.size}`);
    }, 300000); // Report every 5 minutes
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): PerformanceMetrics & { 
    cacheSize: number; 
    cacheHitRate: number; 
    activeRequests: number 
  } {
    const cacheHitRate = this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100;
    
    return {
      ...this.metrics,
      cacheSize: this.cache.size,
      cacheHitRate: isNaN(cacheHitRate) ? 0 : cacheHitRate,
      activeRequests: this.requestQueue.size
    };
  }

  /**
   * Clear all caches and reset metrics
   */
  public reset(): void {
    this.cache.clear();
    this.requestQueue.clear();
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
    
    this.metrics = {
      apiCalls: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      errorRate: 0,
      totalRequests: 0
    };
    
    console.log('🔄 Performance Optimizer: Reset completed');
  }

  /**
   * Optimize configuration based on usage patterns
   */
  public optimizeConfiguration(): void {
    const metrics = this.getMetrics();
    
    // Adjust cache TTL based on hit rate
    if (metrics.cacheHitRate < 50) {
      this.config.defaultCacheTTL *= 1.5; // Increase TTL
      console.log('📈 Increased cache TTL for better hit rate');
    } else if (metrics.cacheHitRate > 90) {
      this.config.defaultCacheTTL *= 0.8; // Decrease TTL
      console.log('📉 Decreased cache TTL to keep data fresh');
    }

    // Adjust debounce delay based on error rate
    if (metrics.errorRate > 0.1) {
      this.config.debounceDelay *= 1.2; // Increase delay
      console.log('⏱️ Increased debounce delay to reduce errors');
    } else if (metrics.errorRate < 0.01) {
      this.config.debounceDelay *= 0.9; // Decrease delay
      console.log('⚡ Decreased debounce delay for faster responses');
    }
  }
}

// Global performance optimizer instance
export const performanceOptimizer = new PerformanceOptimizer();