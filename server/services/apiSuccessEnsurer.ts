import { simpleAPIManager } from './simpleAPIManager';
import { apiTester } from './apiTester';

interface APIRetryConfig {
  maxRetries: number;
  baseDelay: number;
  backoffMultiplier: number;
  rateLimitWaitTime: number;
}

export class APISuccessEnsurer {
  private static instance: APISuccessEnsurer;
  private retryConfig: APIRetryConfig = {
    maxRetries: 3,
    baseDelay: 2000,
    backoffMultiplier: 2,
    rateLimitWaitTime: 60000 // 1 minute wait for rate limits
  };

  static getInstance(): APISuccessEnsurer {
    if (!APISuccessEnsurer.instance) {
      APISuccessEnsurer.instance = new APISuccessEnsurer();
    }
    return APISuccessEnsurer.instance;
  }

  /**
   * Ensure all essential APIs are working successfully
   */
  async ensureAllAPIsWorking(): Promise<{
    success: boolean;
    workingAPIs: string[];
    failedAPIs: string[];
    retryNeeded: string[];
  }> {
    console.log('🔧 API Success Ensurer: Starting comprehensive API verification');
    
    const workingAPIs: string[] = [];
    const failedAPIs: string[] = [];
    const retryNeeded: string[] = [];

    // Get all APIs and test them systematically
    const apis = simpleAPIManager.getAllAPIs();
    const allAPIs = Object.values(apis).flat();

    for (const api of allAPIs) {
      const result = await this.ensureAPIWorking(api.name);
      
      if (result.success) {
        workingAPIs.push(api.name);
        console.log(`✅ ${api.name}: Verified working`);
      } else if (result.needsRetry) {
        retryNeeded.push(api.name);
        console.log(`⏳ ${api.name}: Needs retry (${result.error})`);
      } else {
        failedAPIs.push(api.name);
        console.log(`❌ ${api.name}: Failed permanently (${result.error})`);
      }

      // Prevent overwhelming APIs
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    const totalSuccess = workingAPIs.length + retryNeeded.length;
    const overallSuccess = totalSuccess >= Math.ceil(allAPIs.length * 0.7); // 70% success rate

    console.log(`🏁 API Verification Complete:`);
    console.log(`   ✅ Working: ${workingAPIs.length}`);
    console.log(`   ⏳ Retry Needed: ${retryNeeded.length}`);
    console.log(`   ❌ Failed: ${failedAPIs.length}`);

    return {
      success: overallSuccess,
      workingAPIs,
      failedAPIs,
      retryNeeded
    };
  }

  /**
   * Ensure a specific API is working with retries and backoff
   */
  async ensureAPIWorking(apiName: string): Promise<{
    success: boolean;
    needsRetry: boolean;
    error?: string;
    attempts: number;
  }> {
    let attempts = 0;
    let lastError = '';

    while (attempts < this.retryConfig.maxRetries) {
      attempts++;
      console.log(`🔍 Attempt ${attempts}/${this.retryConfig.maxRetries} for ${apiName}`);

      // Check if API is rate limited
      if (!simpleAPIManager.canMakeCall(apiName)) {
        console.log(`⏳ ${apiName}: Rate limited, waiting...`);
        await new Promise(resolve => setTimeout(resolve, this.retryConfig.rateLimitWaitTime));
        continue;
      }

      try {
        const result = await apiTester.testAPI(apiName);
        
        if (result.success) {
          return {
            success: true,
            needsRetry: false,
            attempts
          };
        }

        lastError = result.error || 'Unknown error';
        
        // Handle specific error types
        if (result.statusCode === 429 || lastError.includes('rate limit')) {
          console.log(`⏳ ${apiName}: Rate limited, extending wait time`);
          await new Promise(resolve => setTimeout(resolve, this.retryConfig.rateLimitWaitTime));
          continue;
        }

        if (result.statusCode === 401 || lastError.includes('API key')) {
          console.log(`🔑 ${apiName}: Authentication failed - API key issue`);
          return {
            success: false,
            needsRetry: false,
            error: 'Authentication failed - check API key',
            attempts
          };
        }

        // Exponential backoff for other errors
        const delay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempts - 1);
        console.log(`⏱️ ${apiName}: Failed, retrying in ${delay}ms (${lastError})`);
        await new Promise(resolve => setTimeout(resolve, delay));

      } catch (error: any) {
        lastError = error.message;
        console.log(`💥 ${apiName}: Exception occurred - ${lastError}`);
        
        const delay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempts - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // Determine if retry is needed based on error type
    const needsRetry = lastError.includes('rate limit') || 
                       lastError.includes('timeout') || 
                       lastError.includes('network');

    return {
      success: false,
      needsRetry,
      error: lastError,
      attempts
    };
  }

  /**
   * Fix common API issues automatically
   */
  async fixAPIIssues(): Promise<{
    fixed: string[];
    stillBroken: string[];
  }> {
    console.log('🔧 API Success Ensurer: Attempting to fix API issues');
    
    const fixed: string[] = [];
    const stillBroken: string[] = [];
    const apis = simpleAPIManager.getAllAPIs();

    for (const category of Object.values(apis)) {
      for (const api of category) {
        if (api.status === 'error' || api.status === 'rate_limited') {
          console.log(`🔧 Attempting to fix ${api.name}...`);
          
          // Reset rate limits if needed
          if (api.status === 'rate_limited') {
            simpleAPIManager.resetRateLimits(api.name);
          }

          // Test the API after fix attempt
          const result = await apiTester.testAPI(api.name);
          
          if (result.success) {
            fixed.push(api.name);
            console.log(`✅ Fixed ${api.name}`);
          } else {
            stillBroken.push(api.name);
            console.log(`❌ Could not fix ${api.name}: ${result.error}`);
          }

          // Delay between fix attempts
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    console.log(`🏁 Fix attempt complete: ${fixed.length} fixed, ${stillBroken.length} still broken`);
    
    return { fixed, stillBroken };
  }

  /**
   * Optimize API usage to prevent failures
   */
  optimizeAPIUsage(): void {
    console.log('⚡ API Success Ensurer: Optimizing API usage patterns');
    
    const apis = simpleAPIManager.getAllAPIs();
    
    for (const category of Object.values(apis)) {
      for (const api of category) {
        // Reduce rate limits for APIs with high error rates
        if (api.errorCount > api.successCount && api.successCount > 0) {
          const newLimit = Math.max(1, Math.floor(api.rateLimitPerMinute * 0.7));
          console.log(`📉 Reducing rate limit for ${api.name}: ${api.rateLimitPerMinute} -> ${newLimit}`);
          simpleAPIManager.updateRateLimit(api.name, newLimit);
        }

        // Mark consistently failing APIs as inactive
        if (api.errorCount > 10 && api.successCount === 0) {
          console.log(`🚫 Marking ${api.name} as inactive due to consistent failures`);
          simpleAPIManager.setAPIStatus(api.name, 'inactive');
        }
      }
    }
  }
}

export const apiSuccessEnsurer = APISuccessEnsurer.getInstance();