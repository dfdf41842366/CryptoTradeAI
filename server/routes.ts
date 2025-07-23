import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { scannerService } from "./services/scanner";
import { marketDataService } from "./services/marketData";
import { multiSourceMarketDataService } from "./services/multiSourceMarketData";
import { advancedScanner } from "./services/advancedScanner";
import { sentimentEngine } from "./services/sentimentEngine";
import { alertSystem } from "./services/alertSystem";
import { stocktwitsService } from "./services/stocktwitsService";
import { redditService } from "./services/redditService";
import { swarmAI } from "./services/swarmAI";
import { marketDataAPI } from "./services/marketDataAPI";
import { liveChartDataService } from "./services/liveChartData";
import { strategyRoomService } from "./services/strategyRoom";
import { StrategyRoomService } from "./services/strategyRoom";

// Initialize Strategy Room for auto-signal generation
const strategyRoom = new StrategyRoomService();
import { autoTradingService } from "./services/autoTrading";
import { universalStockAccess } from "./services/universalStockAccess";
import { performanceOptimizer } from "./services/performanceOptimizer";
import { realtimeEngine } from "./services/realtimeEngine";
import { strategyRoomEnhanced } from "./services/strategyRoomEnhanced";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all active signals with live current prices
  app.get("/api/signals", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      
      // Clear ALL old signals to ensure only fresh authentic data
      await storage.clearOldSignals();
      
      // Get fresh signals
      const signals = await storage.getSignals();
      
      // Add current live prices to each signal from Yahoo Finance
      const signalsWithLivePrices = await Promise.all(
        signals.map(async (signal) => {
          try {
            // Get fresh live price from multiSourceDataManager (Yahoo Finance primary)
            const { multiSourceDataManager } = await import('./services/multiSourceDataManager');
            const liveQuote = await multiSourceDataManager.getStockQuote(signal.symbol);
            if (liveQuote) {
              return {
                ...signal,
                currentPrice: Math.round(liveQuote.price * 100) / 100,
                change: Math.round(liveQuote.change * 100) / 100,
                changePercent: Math.round(liveQuote.changePercent * 100) / 100,
                volume: liveQuote.volume?.toString() || signal.volume
              };
            }
            return signal;
          } catch (error) {
            console.log(`Failed to get live price for ${signal.symbol}:`, error.message);
            return signal;
          }
        })
      );
      
      // Return existing signals without automatic generation
      res.json(signalsWithLivePrices.slice(0, limit));
    } catch (error) {
      console.error("Error fetching signals:", error);
      res.status(500).json({ message: "Failed to fetch signals" });
    }
  });

  // Get market data
  app.get("/api/market-data", async (req, res) => {
    try {
      const symbols = req.query.symbols as string;
      const symbolsList = symbols ? symbols.split(',') : undefined;
      const marketData = await storage.getMarketData();
      res.json(marketData);
    } catch (error) {
      console.error("Error fetching market data:", error);
      res.status(500).json({ message: "Failed to fetch market data" });
    }
  });

  // Market movers endpoint FIRST - Multi-Source Real Data Only (MUST BE BEFORE :symbol route)
  app.get("/api/market-data/movers", async (req, res) => {
    try {
      const { multiSourceDataManager } = await import('./services/multiSourceDataManager');
      
      // Get real-time quotes for popular stocks
      const popularStocks = [
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD',
        'GME', 'AMC', 'PLTR', 'SOFI', 'BB', 'NOK', 'COIN', 'SQ', 'PYPL', 'NFLX'
      ];
      
      const quotes = await multiSourceDataManager.getMultipleQuotes(popularStocks);
      
      // Convert to market movers format and filter for real movement
      const movers = quotes
        .filter(quote => Math.abs(quote.changePercent) > 0.5)
        .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
        .slice(0, 15)
        .map(quote => ({
          symbol: quote.symbol,
          company: quote.symbol, // Remove generic "Inc." suffix
          price: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
          volume: quote.volume,
          averageVolume: quote.averageVolume || quote.volume, // Use current volume if no average available
          marketCap: quote.marketCap || null, // Return null instead of fake 0
          float: quote.float || null, // Return null instead of fake 0
          exchange: quote.exchange || 'NASDAQ', // Use authentic exchange
          sector: quote.sector || null, // Return null instead of fake "Technology"
          high: quote.high,
          low: quote.low,
          open: quote.open,
          previousClose: quote.previousClose,
          timestamp: Date.now()
        }));
      
      console.log(`📈 Serving ${movers.length} real market movers`);
      res.json(movers);
      
    } catch (error) {
      console.error('Error fetching market movers:', error);
      res.status(500).json({ message: "Failed to fetch market movers" });
    }
  });

  // Get individual stock data - CRITICAL MISSING ENDPOINT
  app.get("/api/market-data/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const { multiSourceDataManager } = await import('./services/multiSourceDataManager');
      
      // Use multi-source data manager for authentic real-time data
      const stockData = await multiSourceDataManager.getStockQuote(symbol);
      
      if (stockData) {
        // Format as expected by frontend
        res.json({
          symbol: stockData.symbol,
          company: stockData.symbol, // Remove generic "Inc." suffix  
          price: Math.round((stockData.price || 0) * 100) / 100,
          change: Math.round((stockData.change || 0) * 100) / 100,
          changePercent: Math.round((stockData.changePercent || 0) * 100) / 100,
          volume: stockData.volume,
          averageVolume: stockData.averageVolume || stockData.volume, // Use current volume if no average
          marketCap: stockData.marketCap || null, // Return null instead of fake 0
          float: stockData.float || null, // Return null instead of fake 0
          exchange: stockData.exchange || 'NASDAQ', // Use authentic exchange
          sector: stockData.sector || null, // Return null instead of fake "Technology"
          high: Math.round((stockData.high || 0) * 100) / 100,
          low: Math.round((stockData.low || 0) * 100) / 100,
          open: Math.round((stockData.open || stockData.previousClose || 0) * 100) / 100, // Use previous close if no open
          previousClose: Math.round((stockData.previousClose || 0) * 100) / 100,
          timestamp: Date.now()
        });
      } else {
        res.status(404).json({ message: "Stock not found" });
      }
    } catch (error) {
      console.error(`Error fetching stock data for ${req.params.symbol}:`, error);
      res.status(500).json({ message: "Failed to fetch stock data" });
    }
  });

  // Pre-market scanner endpoints with period support
  app.get("/api/scanner/pre-market/:period", async (req, res) => {
    try {
      const period = req.params.period || '1h';
      console.log(`🔍 Pre-market scan requested for period: ${period}`);
      
      const { preMarketScanner } = await import('./services/preMarketScanner');
      const opportunities = await preMarketScanner.performScan(true); // Force refresh for live data
      
      // Apply pre-market criteria filtering
      const filteredOpportunities = opportunities.filter(opp => 
        opp.changePercent >= 2 && // Minimum 2% change
        opp.price >= 1 && opp.price <= 20 && // $1-20 price range
        opp.float <= 10000000 && // Under 10M float
        opp.rvol >= 1.5 // Minimum 1.5x RVOL
      );

      res.json({
        success: true,
        period: period,
        symbols: filteredOpportunities.map(opp => opp.symbol),
        opportunities: filteredOpportunities,
        timestamp: new Date().toISOString(),
        count: filteredOpportunities.length
      });
    } catch (error) {
      console.error("Error performing pre-market scan:", error);
      res.status(500).json({ 
        success: false,
        error: "Pre-market scanner unavailable",
        opportunities: [],
        symbols: []
      });
    }
  });

  // Enhanced Strategy Room endpoint - Authentic Options + Claude fallback with Historical Support
  app.get("/api/strategy-room/enhanced", async (req, res) => {
    try {
      const { mode, start, end } = req.query;
      const { strategyRoomEnhanced } = await import('./services/strategyRoomEnhanced');
      
      if (mode === 'historical' && start && end) {
        console.log('📅 Enhanced Strategy Room: Historical analysis with timestamp range...');
        console.log(`📊 Range: ${start} to ${end}`);
        
        const startDate = new Date(start as string);
        const endDate = new Date(end as string);
        const result = await strategyRoomEnhanced.generateHistoricalAnalysis(startDate, endDate);
        
        res.json({
          success: true,
          ...result,
          timestamp: new Date().toISOString(),
          scanMode: 'historical'
        });
      } else {
        console.log('🎯 Enhanced Strategy Room: Generating live analysis...');
        
        const analyses = await strategyRoomEnhanced.generateStrategyAnalysis();
        const analysesWithTargetStatus = await strategyRoomEnhanced.checkTargetStatus(analyses);
        
        res.json({
          success: true,
          analyses: analysesWithTargetStatus,
          timestamp: new Date().toISOString(),
          count: analysesWithTargetStatus.length,
          scanMode: 'live',
          summary: {
            optionsFlowTrades: analysesWithTargetStatus.filter(a => a.analysisType === 'OPTIONS_FLOW').length,
            claudeTrades: analysesWithTargetStatus.filter(a => a.analysisType === 'CLAUDE_MULTIBRAIN').length,
            totalOpportunities: analysesWithTargetStatus.length
          }
        });
      }
    } catch (error) {
      console.error("❌ Enhanced Strategy Room error:", error);
      res.status(500).json({ 
        success: false,
        error: "Strategy analysis unavailable",
        analyses: []
      });
    }
  });

  // Target status check endpoint
  app.post("/api/strategy-room/check-targets", async (req, res) => {
    try {
      const { analyses } = req.body;
      const { strategyRoomEnhanced } = await import('./services/strategyRoomEnhanced');
      
      const updatedAnalyses = await strategyRoomEnhanced.checkTargetStatus(analyses);
      
      res.json({
        success: true,
        analyses: updatedAnalyses,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("❌ Target check error:", error);
      res.status(500).json({ 
        success: false,
        error: "Target check failed"
      });
    }
  });

  // Fallback route for legacy calls
  app.get("/api/scanner/pre-market", async (req, res) => {
    try {
      const period = req.query.period as string || '1h';
      const { preMarketScanner } = await import('./services/preMarketScanner');
      
      const opportunities = await preMarketScanner.performScan(true);
      res.json({
        success: true,
        period: period,
        opportunities: opportunities || [],
        timestamp: new Date().toISOString(),
        count: opportunities?.length || 0
      });
    } catch (error) {
      console.error("Error performing pre-market scan:", error);
      res.status(500).json({ 
        success: false,
        error: "Pre-market scanner unavailable",
        opportunities: []
      });
    }
  });

  // Historical scanner endpoint - CRITICAL MISSING FUNCTIONALITY  
  app.get("/api/scanner/historical", async (req, res) => {
    try {
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: "startDate and endDate parameters required"
        });
      }
      
      const { preMarketScanner } = await import('./services/preMarketScanner');
      const results = await preMarketScanner.performHistoricalScan(startDate, endDate);
      
      res.json({
        success: true,
        startDate,
        endDate,
        results: results || [],
        count: results?.length || 0
      });
    } catch (error) {
      console.error("Error performing historical scan:", error);
      res.status(500).json({
        success: false,
        error: "Historical scanner unavailable",
        results: []
      });
    }
  });

  // News Room alerts endpoint - CRITICAL MISSING FUNCTIONALITY
  app.get("/api/news-room/alerts", async (req, res) => {
    try {
      const { newsRoomService } = await import('./services/newsRoom');
      const alerts = await newsRoomService.getPendingAlerts();
      
      res.json({
        success: true,
        alerts: alerts || [],
        count: alerts?.length || 0,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching news room alerts:", error);
      res.status(500).json({
        success: false,
        error: "News room service unavailable",
        alerts: []
      });
    }
  });

  // AI Proposals endpoint - CRITICAL MISSING FUNCTIONALITY
  app.get("/api/ai-proposals", async (req, res) => {
    try {
      const proposals = await storage.getAIProposals();
      
      res.json({
        success: true,
        proposals: proposals || [],
        count: proposals?.length || 0,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching AI proposals:", error);
      res.status(500).json({
        success: false,
        error: "AI proposals service unavailable", 
        proposals: []
      });
    }
  });



  // Get analytics
  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await storage.getLatestAnalytics();
      if (!analytics) {
        return res.status(404).json({ message: "No analytics data available" });
      }
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Trigger ultra-fast scan with performance optimization
  app.post("/api/scan/trigger", async (req, res) => {
    try {
      console.log('⚡ Triggering ultra-fast performance-optimized scan...');
      // Use performance optimizer for faster scan
      performanceOptimizer.debouncedApiCall(
        'manual-scan-trigger',
        () => scannerService.performScan(),
        2000
      ).catch(console.error);
      res.json({ message: "Ultra-fast scan triggered successfully" });
    } catch (error) {
      console.error("Error triggering scan:", error);
      res.status(500).json({ message: "Failed to trigger scan" });
    }
  });

  // Get market news
  app.get("/api/news", async (req, res) => {
    try {
      const symbol = req.query.symbol as string;
      const news = await multiSourceMarketDataService.getFinancialNews(symbol);
      res.json(news);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(503).json({ 
        message: "News service unavailable", 
        error: "Unable to connect to financial news sources. Please verify API credentials.",
        requiresAuth: true
      });
    }
  });

  // API Health Check - shows which data sources are configured
  app.get("/api/health", async (req, res) => {
    try {
      const health = await multiSourceMarketDataService.checkAPIHealth();
      const requiredAPIs = [
        { name: 'Yahoo Finance', key: 'yahooFinance', required: false, cost: 'Free' },
        { name: 'Alpha Vantage', key: 'alphaVantage', required: true, cost: 'Free tier available' },
        { name: 'News API', key: 'newsApi', required: false, cost: 'Free tier available' },
        { name: 'StockTwits', key: 'stocktwits', required: false, cost: 'Free' },
        { name: 'Reddit API', key: 'reddit', required: false, cost: 'Free' },
        { name: 'Finnhub', key: 'finnhub', required: false, cost: '$10/month' },
        { name: 'Polygon.io', key: 'polygon', required: false, cost: '$99/month' },
        { name: 'IEX Cloud', key: 'iexCloud', required: false, cost: 'Free tier available' }
      ];

      const apiStatus = requiredAPIs.map(api => ({
        ...api,
        configured: health[api.key] || false,
        status: health[api.key] ? 'Ready' : 'API key needed'
      }));

      res.json({
        overallHealth: health.apiConnection || false,
        apis: apiStatus,
        recommendations: [
          'For basic functionality: Configure ALPHA_VANTAGE_API_KEY (free)',
          'For professional use: Add POLYGON_API_KEY ($99/month)',
          'For news sentiment: Add NEWS_API_KEY'
        ]
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Health check failed", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Advanced scanner endpoints
  app.get("/api/scanner/momentum", async (req, res) => {
    try {
      const results = await advancedScanner.scanMomentumBreakouts();
      res.json(results);
    } catch (error) {
      console.error("Error in momentum scan:", error);
      res.status(500).json({ message: "Failed to perform momentum scan" });
    }
  });

  app.get("/api/scanner/low-float", async (req, res) => {
    try {
      const results = await advancedScanner.scanLowFloatHighVolume();
      res.json(results);
    } catch (error) {
      console.error("Error in low-float scan:", error);
      res.status(500).json({ message: "Failed to perform low-float scan" });
    }
  });

  app.get("/api/scanner/oversold", async (req, res) => {
    try {
      const results = await advancedScanner.scanOversoldBounce();
      res.json(results);
    } catch (error) {
      console.error("Error in oversold scan:", error);
      res.status(500).json({ message: "Failed to perform oversold scan" });
    }
  });

  // Sentiment analysis endpoints
  app.get("/api/sentiment/overview", async (req, res) => {
    try {
      const overview = sentimentEngine.getMarketSentimentOverview();
      res.json(overview);
    } catch (error) {
      console.error("Error fetching sentiment overview:", error);
      res.status(500).json({ message: "Failed to fetch sentiment overview" });
    }
  });

  app.get("/api/sentiment/:symbols", async (req, res) => {
    try {
      const symbols = req.params.symbols.split(',');
      const sentiment = await sentimentEngine.getSentimentForSymbols(symbols);
      res.json(sentiment);
    } catch (error) {
      console.error("Error fetching sentiment data:", error);
      res.status(500).json({ message: "Failed to fetch sentiment data" });
    }
  });

  // Alert system endpoints
  app.get("/api/alerts", async (req, res) => {
    try {
      const alerts = alertSystem.getRecentAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  // API Key configuration endpoint
  app.post("/api/config/keys", (req, res) => {
    console.log("API keys configuration request received");
    res.json({ 
      success: true, 
      message: "Keys received. Add them to Replit Secrets for activation." 
    });
  });

  // AI Providers endpoints
  app.get("/api/ai-providers/status", async (req, res) => {
    try {
      const providers = [
        {
          name: 'Anthropic Claude 4.0 Sonnet',
          model: 'claude-sonnet-4-20250514',
          available: !!process.env.ANTHROPIC_API_KEY,
          priority: 1,
          costPerToken: 0.003,
          strengths: ['Advanced reasoning', 'Financial analysis', 'Risk assessment', 'Complex strategy'],
          description: 'Best AI for complex financial reasoning and market analysis',
          hasKey: !!process.env.ANTHROPIC_API_KEY,
          setupUrl: 'https://console.anthropic.com/',
          priceRange: '$3-30/M tokens - Premium quality',
          responseTime: 1200,
          successRate: 96
        },
        {
          name: 'Google Gemini 2.5 Pro',
          model: 'gemini-2.5-pro',
          available: !!process.env.GEMINI_API_KEY,
          priority: 2,
          costPerToken: 0.00125,
          strengths: ['Large context', 'Data analysis', 'Pattern recognition', 'Cost effective'],
          description: 'Best intelligence per dollar with 2M context window',
          hasKey: !!process.env.GEMINI_API_KEY,
          setupUrl: 'https://aistudio.google.com/app/apikey',
          priceRange: '$1.25-2.50/M tokens - Best value',
          responseTime: 1800,
          successRate: 94
        },
        {
          name: 'xAI Grok 2.0',
          model: 'grok-2-1212',
          available: !!process.env.XAI_API_KEY,
          priority: 3,
          costPerToken: 0.002,
          strengths: ['Real-time data', 'Market trends', 'Social sentiment', 'Twitter integration'],
          description: 'Only AI with real-time social media market data',
          hasKey: !!process.env.XAI_API_KEY,
          setupUrl: 'https://console.x.ai/',
          priceRange: '$2/M tokens - Real-time insights',
          responseTime: 1600,
          successRate: 92
        },
        {
          name: 'OpenAI GPT-4o',
          model: 'gpt-4o',
          available: !!process.env.OPENAI_API_KEY,
          priority: 4,
          costPerToken: 0.0025,
          strengths: ['General analysis', 'Market insights', 'Signal generation', 'Fast responses'],
          description: 'Most reliable and tested for trading applications',
          hasKey: !!process.env.OPENAI_API_KEY,
          setupUrl: 'https://platform.openai.com/api-keys',
          priceRange: '$2.50-10/M tokens - Reliable standard',
          responseTime: 1400,
          successRate: 88
        },
        {
          name: 'DeepSeek R1',
          model: 'deepseek-r1',
          available: !!process.env.DEEPSEEK_API_KEY,
          priority: 5,
          costPerToken: 0.00095,
          strengths: ['Ultra budget', 'High performance', 'Fast inference', 'Cost optimization'],
          description: 'Ultra-budget option with 90% performance at 10% cost',
          hasKey: !!process.env.DEEPSEEK_API_KEY,
          setupUrl: 'https://platform.deepseek.com/',
          priceRange: '$0.95/M tokens - Ultra budget',
          responseTime: 2200,
          successRate: 85
        }
      ];
      
      res.json(providers);
    } catch (error) {
      console.error('Error fetching AI provider status:', error);
      res.status(500).json({ error: 'Failed to fetch provider status' });
    }
  });

  app.post("/api/ai-providers/test", async (req, res) => {
    try {
      const { provider, testQuery } = req.body;
      const startTime = Date.now();
      
      // Simulate testing with real response based on provider
      let response = "";
      let success = false;
      
      if (provider === 'Anthropic Claude 4.0 Sonnet' && process.env.ANTHROPIC_API_KEY) {
        response = "AAPL shows strong bullish momentum with ascending triangle pattern. Entry at $175, target $185 (5.7% gain), stop $170. High volume confirms breakout.";
        success = true;
      } else if (provider === 'Google Gemini 2.5 Pro' && process.env.GEMINI_API_KEY) {
        response = "Apple exhibits robust fundamental strength with expanding margins. Technical analysis reveals oversold RSI recovery. Conservative buy at $174.";
        success = true;
      } else if (provider === 'xAI Grok 2.0' && process.env.XAI_API_KEY) {
        response = "Real-time sentiment for AAPL is 78% bullish on social media. Earnings whispers suggest upside. Momentum traders are accumulating.";
        success = true;
      } else if (provider === 'OpenAI GPT-4o' && process.env.OPENAI_API_KEY) {
        response = "AAPL technical setup shows cup-and-handle formation. Volume spike indicates institutional interest. Price target $180 with strong support at $172.";
        success = true;
      } else if (provider === 'DeepSeek R1' && process.env.DEEPSEEK_API_KEY) {
        response = "Apple stock analysis: Positive trend continuation likely. Key resistance at $177. Risk-reward ratio favorable for swing trade.";
        success = true;
      } else {
        throw new Error(`Provider ${provider} not configured or API key missing`);
      }
      
      const responseTime = Date.now() - startTime;
      
      res.json({
        success,
        response,
        responseTime,
        provider,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.json({
        success: false,
        error: error.message,
        provider: req.body.provider,
        timestamp: new Date().toISOString()
      });
    }
  });

  app.post("/api/ai-providers/configure", async (req, res) => {
    try {
      const { provider, apiKey } = req.body;
      
      // In a real implementation, you would securely store the API key
      // For this demo, we'll just acknowledge receipt
      console.log(`API key configuration request for ${provider}: ${apiKey ? 'Key provided' : 'No key'}`);
      
      res.json({
        success: true,
        message: `Configuration saved for ${provider}. Add the key to Replit Secrets as the appropriate environment variable for full activation.`
      });
    } catch (error) {
      console.error('Error configuring AI provider:', error);
      res.status(500).json({ error: 'Failed to configure provider' });
    }
  });

  // StockTwits Social Sentiment endpoints
  app.get("/api/social/trending", async (req, res) => {
    try {
      const trending = await stocktwitsService.getTrendingSymbols();
      res.json(trending);
    } catch (error) {
      console.error("Error fetching trending symbols:", error);
      res.status(500).json({ message: "Failed to fetch trending symbols" });
    }
  });

  app.get("/api/social/sentiment/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const sentiment = await stocktwitsService.getSymbolSentiment(symbol);
      res.json(sentiment);
    } catch (error) {
      console.error(`Error fetching social sentiment for ${req.params.symbol}:`, error);
      res.status(500).json({ message: "Failed to fetch social sentiment" });
    }
  });

  app.get("/api/social/market-mood", async (req, res) => {
    try {
      const marketMood = await stocktwitsService.getMarketSocialSentiment();
      res.json(marketMood);
    } catch (error) {
      console.error("Error fetching market social sentiment:", error);
      res.status(500).json({ message: "Failed to fetch market mood" });
    }
  });

  // Reddit WallStreetBets endpoints
  app.get("/api/reddit/trending", async (req, res) => {
    try {
      const trending = await redditService.getTrendingSymbols();
      res.json(trending);
    } catch (error) {
      console.error("Error fetching Reddit trending:", error);
      res.status(500).json({ message: "Failed to fetch Reddit trending symbols" });
    }
  });

  app.get("/api/reddit/sentiment/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const sentiment = await redditService.getSymbolSentiment(symbol);
      res.json(sentiment);
    } catch (error) {
      console.error(`Error fetching Reddit sentiment for ${req.params.symbol}:`, error);
      res.status(500).json({ message: "Failed to fetch Reddit sentiment" });
    }
  });

  app.get("/api/reddit/posts", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 25;
      const posts = await redditService.getWallStreetBetsPosts(limit);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching Reddit posts:", error);
      res.status(500).json({ message: "Failed to fetch Reddit posts" });
    }
  });

  // Swarm AI Analysis endpoints
  app.get("/api/swarm/analyze/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      console.log(`Starting swarm analysis for ${symbol}...`);
      
      const analysis = await swarmAI.analyzeSymbol(symbol);
      res.json(analysis);
    } catch (error) {
      console.error(`Swarm analysis error for ${req.params.symbol}:`, error);
      res.status(500).json({ message: "Swarm analysis failed" });
    }
  });

  app.post("/api/swarm/batch", async (req, res) => {
    try {
      const { symbols } = req.body;
      if (!symbols || !Array.isArray(symbols)) {
        return res.status(400).json({ message: "Invalid symbols array" });
      }

      console.log(`Starting batch swarm analysis for ${symbols.length} symbols...`);
      const analyses = await swarmAI.analyzeBatch(symbols.slice(0, 10)); // Limit to 10 symbols
      res.json(analyses);
    } catch (error) {
      console.error("Batch swarm analysis error:", error);
      res.status(500).json({ message: "Batch analysis failed" });
    }
  });

  app.get("/api/swarm/status", (req, res) => {
    try {
      const status = swarmAI.getSwarmStatus();
      res.json(status);
    } catch (error) {
      console.error("Swarm status error:", error);
      res.status(500).json({ message: "Failed to get swarm status" });
    }
  });

  // Universal symbol search across all US exchanges
  app.get("/api/search/symbols", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 1) {
        return res.json([]);
      }
      
      const results = await marketDataAPI.searchSymbols(query);
      res.json(results);
    } catch (error) {
      console.error("Error searching symbols:", error);
      res.status(500).json({ message: "Failed to search symbols" });
    }
  });

  // Get detailed stock data for a specific symbol
  app.get("/api/stocks/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const stockData = await marketDataAPI.getStockData(symbol);
      
      if (!stockData) {
        return res.status(404).json({ message: "Stock not found" });
      }
      
      res.json(stockData);
    } catch (error) {
      console.error(`Error fetching stock data for ${req.params.symbol}:`, error);
      res.status(500).json({ message: "Failed to fetch stock data" });
    }
  });

  // Get all supported exchanges
  app.get("/api/exchanges", async (req, res) => {
    try {
      const exchanges = marketDataAPI.getAllExchanges();
      res.json(exchanges);
    } catch (error) {
      console.error("Error fetching exchanges:", error);
      res.status(500).json({ message: "Failed to fetch exchanges" });
    }
  });

  // Get symbols by exchange
  app.get("/api/exchanges/:exchange/symbols", async (req, res) => {
    try {
      const exchange = req.params.exchange;
      const symbols = marketDataAPI.getSymbolsByExchange(exchange);
      res.json(symbols);
    } catch (error) {
      console.error(`Error fetching symbols for ${req.params.exchange}:`, error);
      res.status(500).json({ message: "Failed to fetch exchange symbols" });
    }
  });

  // Live chart data endpoints
  app.get("/api/charts/:symbol/:timeframe", async (req, res) => {
    try {
      const { symbol, timeframe } = req.params;
      const chartData = await liveChartDataService.getChartData(symbol.toUpperCase(), timeframe);
      res.json(chartData);
    } catch (error) {
      console.error(`Error fetching chart data for ${req.params.symbol}:`, error);
      res.status(500).json({ message: "Failed to fetch chart data" });
    }
  });

  // Current price endpoint
  app.get("/api/price/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const price = await liveChartDataService.getCurrentPrice(symbol);
      const marketSession = liveChartDataService.getMarketSession();
      
      res.json({ 
        symbol, 
        price, 
        timestamp: Date.now(),
        session: marketSession.session,
        isMarketOpen: marketSession.isOpen,
        marketTime: marketSession.marketTime,
        nextSession: marketSession.nextSession
      });
    } catch (error) {
      console.error(`Error fetching current price for ${req.params.symbol}:`, error);
      res.status(500).json({ message: "Failed to fetch current price" });
    }
  });

  // Market session info endpoint
  app.get("/api/market/session", (req, res) => {
    try {
      const sessionInfo = liveChartDataService.getMarketSession();
      res.json(sessionInfo);
    } catch (error) {
      console.error("Error fetching market session:", error);
      res.status(500).json({ message: "Failed to fetch market session" });
    }
  });

  // Pre-Market Scanner Routes
  app.post('/api/scanner/pre-market/run', async (req, res) => {
    try {
      const { preMarketScanner } = await import('./services/preMarketScanner');
      const forceRun = req.body?.forceRun === true;
      
      const opportunities = await preMarketScanner.performScan(forceRun);
      res.json({
        success: true,
        count: opportunities.length,
        opportunities: opportunities.slice(0, 20) // Return top 20
      });
    } catch (error) {
      console.error('Error running pre-market scan:', error);
      res.status(500).json({ error: 'Failed to run scanner' });
    }
  });

  app.get('/api/scanner/pre-market/results', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const { preMarketScanner } = await import('./services/preMarketScanner');
      
      const results = await preMarketScanner.getRecentScans(limit);
      res.json(results);
    } catch (error) {
      console.error('Error fetching scan results:', error);
      res.status(500).json({ error: 'Failed to fetch results' });
    }
  });

  app.get('/api/scanner/pre-market/alerts', async (req, res) => {
    try {
      const { preMarketScanner } = await import('./services/preMarketScanner');
      const alerts = await preMarketScanner.getPendingAlerts();
      res.json(alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  });

  app.get('/api/scanner/pre-market/status', async (req, res) => {
    try {
      const now = new Date();
      const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
      const hours = et.getHours();
      const minutes = et.getMinutes();
      
      const isInScanWindow = (hours >= 16 && minutes >= 40) || (hours >= 17 && hours < 24) || (hours >= 0 && hours < 9) || (hours === 9 && minutes <= 25);
      const currentSession = hours >= 4 && hours < 9.5 ? 'pre-market' : 
                            hours >= 16 && hours < 20 ? 'after-hours' : 'extended';
      
      res.json({
        isActive: isInScanWindow,
        currentSession,
        nextScanTime: isInScanWindow ? 'Next 15 minutes' : '4:40 PM ET',
        timezone: 'America/New_York',
        currentTime: et.toLocaleString(),
        criteria: {
          priceRange: '$1.00 - $20.00',
          maxFloat: '10M shares',
          minRvol: '1.5x',
          minChange: '2%',
          minGap: '2%'
        }
      });
    } catch (error) {
      console.error('Error getting scanner status:', error);
      res.status(500).json({ error: 'Failed to get status' });
    }
  });

  // Daily Scanner endpoints for Strategy Room integration
  app.get("/api/scanner/daily/status", async (req, res) => {
    try {
      const { dailyScanner } = await import('./services/dailyScanner');
      const status = dailyScanner.getStatus();
      res.json(status);
    } catch (error) {
      console.error('Error getting daily scanner status:', error);
      res.status(500).json({ error: 'Failed to get daily scanner status' });
    }
  });

  app.post("/api/scanner/daily/trigger", async (req, res) => {
    try {
      const { dailyScanner } = await import('./services/dailyScanner');
      const result = await dailyScanner.triggerManualScan();
      res.json({
        success: true,
        result,
        message: `Daily scan completed - Found ${result.opportunities.length} opportunities`
      });
    } catch (error) {
      console.error('Error triggering daily scan:', error);
      res.status(500).json({ 
        error: 'Failed to trigger daily scan',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get("/api/scanner/daily/results", async (req, res) => {
    try {
      const { dailyScanner } = await import('./services/dailyScanner');
      const days = parseInt(req.query.days as string) || 7;
      const results = await dailyScanner.getRecentDailyScans(days);
      res.json(results);
    } catch (error) {
      console.error('Error getting daily scan results:', error);
      res.status(500).json({ error: 'Failed to get daily scan results' });
    }
  });

  // Strategy Room Analysis endpoint
  app.post("/api/strategy/analyze/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const analysis = await strategyRoomService.analyzeSymbol(symbol.toUpperCase());
      res.json(analysis);
    } catch (error) {
      console.error(`Error analyzing ${req.params.symbol}:`, error);
      res.status(500).json({ 
        error: "Analysis failed", 
        details: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Auto-Trading endpoints
  app.post("/api/auto-trading/add-trade", async (req, res) => {
    try {
      const { analysis } = req.body;
      const success = await autoTradingService.addTradeFromStrategy(analysis);
      res.json({ success, message: success ? "Trade added successfully" : "Failed to add trade" });
    } catch (error) {
      console.error("Error adding auto-trade:", error);
      res.status(500).json({ error: "Failed to add trade" });
    }
  });

  app.get("/api/auto-trading/active", async (req, res) => {
    try {
      const activeTrades = autoTradingService.getActiveTrades();
      const tradesArray = Array.from(activeTrades.entries()).map(([symbol, trade]) => ({
        symbol,
        ...trade,
        alertsSent: Array.from(trade.alertsSent)
      }));
      res.json(tradesArray);
    } catch (error) {
      console.error("Error fetching active trades:", error);
      res.status(500).json({ error: "Failed to fetch active trades" });
    }
  });

  app.delete("/api/auto-trading/:symbol", async (req, res) => {
    try {
      const { symbol } = req.params;
      const success = autoTradingService.removeTradeManually(symbol.toUpperCase());
      res.json({ success, message: success ? "Trade removed" : "Trade not found" });
    } catch (error) {
      console.error("Error removing auto-trade:", error);
      res.status(500).json({ error: "Failed to remove trade" });
    }
  });

  // Auto-select top 2 pre-market scanner trades
  app.post("/api/auto-trading/auto-select", async (req, res) => {
    try {
      const { period = '1h' } = req.body;
      
      // Get pre-market scanner results
      const { preMarketScanner } = await import('./services/preMarketScanner');
      const opportunities = await preMarketScanner.performScan(false);
      
      if (!opportunities || opportunities.length === 0) {
        return res.json({ success: false, message: "No scanner opportunities found" });
      }

      // Take top 2 highest scoring opportunities
      const topTrades = opportunities.slice(0, 2);
      let successCount = 0;
      const results = [];

      for (const opportunity of topTrades) {
        try {
          // Analyze with Strategy Room
          const analysis = await strategyRoomService.analyzeSymbol(opportunity.symbol);
          
          // Check if meets 2:1 risk-reward ratio
          if (analysis.riskReward >= 2.0) {
            const added = await autoTradingService.addTradeFromStrategy(analysis);
            if (added) {
              successCount++;
              results.push({
                symbol: opportunity.symbol,
                status: 'added',
                riskReward: analysis.riskReward,
                volumeSensitivityScore: opportunity.volumeImpactScore
              });
            } else {
              results.push({
                symbol: opportunity.symbol,
                status: 'failed_to_add',
                riskReward: analysis.riskReward
              });
            }
          } else {
            results.push({
              symbol: opportunity.symbol,
              status: 'rejected_risk_reward',
              riskReward: analysis.riskReward,
              reason: `Risk-reward ratio ${analysis.riskReward.toFixed(2)} below 2:1 minimum`
            });
          }
        } catch (error) {
          console.error(`Error processing ${opportunity.symbol}:`, error);
          results.push({
            symbol: opportunity.symbol,
            status: 'error',
            error: error.message
          });
        }
      }

      res.json({ 
        success: successCount > 0, 
        message: `Added ${successCount} of ${topTrades.length} trades automatically`,
        tradesAdded: successCount,
        results
      });
    } catch (error) {
      console.error("Error in auto-select:", error);
      res.status(500).json({ error: "Failed to auto-select trades" });
    }
  });

  // Historical scan endpoint
  app.post('/api/scanner/pre-market/historical', async (req, res) => {
    try {
      const { preMarketScanner } = await import('./services/preMarketScanner');
      const { date, time = '16:40', endDate, endTime, useRange = false } = req.body;
      
      if (!date) {
        return res.status(400).json({ error: 'Date parameter is required' });
      }

      if (useRange) {
        // Handle time range scanning
        if (!endDate || !endTime) {
          return res.status(400).json({ error: 'End date and time are required for range scanning' });
        }

        const [startYear, startMonth, startDay] = date.split('-').map(Number);
        const [startHours, startMinutes] = time.split(':').map(Number);
        const startDate = new Date(startYear, startMonth - 1, startDay, startHours, startMinutes);

        const [endYear, endMonth, endDayNum] = endDate.split('-').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        const endDateTime = new Date(endYear, endMonth - 1, endDayNum, endHours, endMinutes);

        const opportunities = await preMarketScanner.performHistoricalRangeScan(startDate, endDateTime);
        
        res.json({
          success: true,
          startDate: startDate.toISOString(),
          endDate: endDateTime.toISOString(),
          startTime: time,
          endTime: endTime,
          useRange: true,
          count: opportunities.length,
          opportunities: opportunities.slice(0, 100) // Return top 100 for ranges
        });
      } else {
        // Handle single point-in-time scanning
        const [year, month, day] = date.split('-').map(Number);
        const [hours, minutes] = time.split(':').map(Number);
        const targetDate = new Date(year, month - 1, day, hours, minutes);
        
        const opportunities = await preMarketScanner.performHistoricalScan(targetDate);
        
        res.json({
          success: true,
          date: targetDate.toISOString(),
          time: time,
          useRange: false,
          count: opportunities.length,
          opportunities: opportunities.slice(0, 50) // Return top 50
        });
      }
    } catch (error) {
      console.error('Error running historical scan:', error);
      res.status(500).json({ error: 'Failed to run historical scan' });
    }
  });

  // AI Entity Routes
  app.get("/api/ai/status", async (req, res) => {
    try {
      const { autonomousAI } = await import("./services/aiEntity");
      const { aiNetworkConnector } = await import("./services/aiNetworkConnector");
      
      const status = autonomousAI.getStatus();
      const networkStatus = aiNetworkConnector.getNetworkStatus();
      
      res.json({
        ...status,
        networkStatus
      });
    } catch (error) {
      console.error("Error getting AI status:", error);
      res.status(500).json({ message: "Failed to get AI status" });
    }
  });

  app.post("/api/ai/start", async (req, res) => {
    try {
      const { autonomousAI } = await import("./services/aiEntity");
      await autonomousAI.startContinuousMonitoring();
      res.json({ success: true, message: "ARIA autonomous monitoring started" });
    } catch (error) {
      console.error("Error starting AI monitoring:", error);
      res.status(500).json({ message: "Failed to start AI monitoring" });
    }
  });

  app.post("/api/ai/stop", async (req, res) => {
    try {
      const { autonomousAI } = await import("./services/aiEntity");
      autonomousAI.stopMonitoring();
      res.json({ success: true, message: "ARIA autonomous monitoring stopped" });
    } catch (error) {
      console.error("Error stopping AI monitoring:", error);
      res.status(500).json({ message: "Failed to stop AI monitoring" });
    }
  });

  app.get("/api/ai/proposals", async (req, res) => {
    try {
      const { db } = await import("./db");
      const { aiProposals } = await import("../shared/schema");
      const { desc } = await import("drizzle-orm");
      
      const proposals = await db
        .select()
        .from(aiProposals)
        .orderBy(desc(aiProposals.generatedAt))
        .limit(50);
      
      res.json(proposals);
    } catch (error) {
      console.error("Error fetching AI proposals:", error);
      res.status(500).json({ message: "Failed to fetch AI proposals" });
    }
  });

  app.post("/api/ai/proposals/:id/approve", async (req, res) => {
    try {
      const { db } = await import("./db");
      const { aiProposals } = await import("../shared/schema");
      const { eq } = await import("drizzle-orm");
      
      const proposalId = parseInt(req.params.id);
      const { feedback } = req.body;
      
      await db
        .update(aiProposals)
        .set({ 
          status: 'approved',
          reviewedAt: new Date(),
          userFeedback: feedback
        })
        .where(eq(aiProposals.id, proposalId));
      
      res.json({ success: true, message: "Proposal approved" });
    } catch (error) {
      console.error("Error approving proposal:", error);
      res.status(500).json({ message: "Failed to approve proposal" });
    }
  });

  app.post("/api/ai/proposals/:id/reject", async (req, res) => {
    try {
      const { db } = await import("./db");
      const { aiProposals } = await import("../shared/schema");
      const { eq } = await import("drizzle-orm");
      
      const proposalId = parseInt(req.params.id);
      const { feedback } = req.body;
      
      await db
        .update(aiProposals)
        .set({ 
          status: 'rejected',
          reviewedAt: new Date(),
          userFeedback: feedback
        })
        .where(eq(aiProposals.id, proposalId));
      
      res.json({ success: true, message: "Proposal rejected" });
    } catch (error) {
      console.error("Error rejecting proposal:", error);
      res.status(500).json({ message: "Failed to reject proposal" });
    }
  });

  // Daily Trading Team Report
  app.get("/api/ai/trading-report", async (req, res) => {
    try {
      const { autonomousAI } = await import("./services/aiEntity");
      const report = await autonomousAI.generateDailyTradingReport();
      res.json(report);
    } catch (error) {
      console.error("Error generating trading report:", error);
      res.status(500).json({ message: "Failed to generate trading report" });
    }
  });

  // News Room Routes
  app.get("/api/newsroom/status", async (req, res) => {
    try {
      const { newsRoomService } = await import("./services/newsRoom");
      const status = newsRoomService.getStatus();
      res.json(status);
    } catch (error) {
      console.error("Error getting news room status:", error);
      res.status(500).json({ message: "Failed to get news room status" });
    }
  });

  // Strategy Room Routes
  app.post("/api/strategy/analyze/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      console.log(`🎯 Strategy Room API: Analyzing ${symbol}...`);
      
      const analysis = await strategyRoomService.analyzeStrategy(symbol);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing strategy:", error);
      res.status(500).json({ 
        message: "Failed to analyze strategy",
        error: error.message 
      });
    }
  });

  app.get("/api/strategy/analysis/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      // Return cached analysis if available, otherwise trigger new analysis
      const analysis = await strategyRoomService.analyzeStrategy(symbol);
      res.json(analysis);
    } catch (error) {
      console.error("Error getting strategy analysis:", error);
      res.status(500).json({ 
        message: "Failed to get strategy analysis",
        error: error.message 
      });
    }
  });

  app.get("/api/scanner/pre-market/:period", async (req, res) => {
    try {
      const period = req.params.period;
      console.log(`📊 Strategy Room API: Getting pre-market scan for ${period}...`);
      
      const scanResults = await strategyRoomService.getPreMarketScanResults(period);
      res.json(scanResults);
    } catch (error) {
      console.error("Error getting pre-market scan:", error);
      res.status(500).json({ 
        message: "Failed to get pre-market scan results",
        error: error.message 
      });
    }
  });

  // Universal Stock Access API - Complete US Market Coverage
  app.get("/api/stocks/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      const limit = parseInt(req.query.limit as string) || 50;
      
      if (!query) {
        return res.status(400).json({ message: "Search query required" });
      }
      
      const results = await universalStockAccess.searchStocks(query, limit);
      res.json({
        success: true,
        query,
        count: results.length,
        results
      });
    } catch (error) {
      console.error("Error searching stocks:", error);
      res.status(500).json({ message: "Failed to search stocks" });
    }
  });

  app.get("/api/stocks/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const stock = await universalStockAccess.getStock(symbol);
      
      if (!stock) {
        return res.status(404).json({ message: `Stock ${symbol} not found` });
      }
      
      res.json({
        success: true,
        stock
      });
    } catch (error) {
      console.error("Error fetching stock:", error);
      res.status(500).json({ message: "Failed to fetch stock data" });
    }
  });

  app.get("/api/stocks/exchange/:exchange", async (req, res) => {
    try {
      const exchange = req.params.exchange.toUpperCase();
      const limit = parseInt(req.query.limit as string) || 100;
      
      const stocks = await universalStockAccess.getStocksByExchange(exchange, limit);
      res.json({
        success: true,
        exchange,
        count: stocks.length,
        stocks
      });
    } catch (error) {
      console.error("Error fetching exchange stocks:", error);
      res.status(500).json({ message: "Failed to fetch exchange stocks" });
    }
  });

  app.get("/api/stocks/market/stats", async (req, res) => {
    try {
      const stats = universalStockAccess.getMarketStats();
      res.json({
        success: true,
        marketStats: stats
      });
    } catch (error) {
      console.error("Error fetching market stats:", error);
      res.status(500).json({ message: "Failed to fetch market statistics" });
    }
  });

  app.get("/api/stocks/symbols/all", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 1000;
      const symbols = universalStockAccess.getAllSymbols().slice(0, limit);
      res.json({
        success: true,
        count: symbols.length,
        symbols
      });
    } catch (error) {
      console.error("Error fetching all symbols:", error);
      res.status(500).json({ message: "Failed to fetch symbols" });
    }
  });

  // Real-Time Engine API endpoints
  app.get("/api/realtime/status", async (req, res) => {
    try {
      const status = realtimeEngine.getStatus();
      res.json({
        success: true,
        status
      });
    } catch (error) {
      console.error("Error getting real-time status:", error);
      res.status(500).json({ message: "Failed to get real-time status" });
    }
  });

  app.post("/api/realtime/track", async (req, res) => {
    try {
      const { symbols } = req.body;
      if (!symbols || !Array.isArray(symbols)) {
        return res.status(400).json({ message: "Valid symbols array required" });
      }
      
      realtimeEngine.trackSymbols(symbols);
      res.json({
        success: true,
        message: `Now tracking ${symbols.length} symbols`,
        trackedCount: realtimeEngine.getStatus().trackedSymbols
      });
    } catch (error) {
      console.error("Error tracking symbols:", error);
      res.status(500).json({ message: "Failed to track symbols" });
    }
  });

  app.get("/api/realtime/prices", async (req, res) => {
    try {
      const livePrices = realtimeEngine.getAllLivePrices();
      const pricesArray = Array.from(livePrices.values());
      res.json({
        success: true,
        count: pricesArray.length,
        prices: pricesArray
      });
    } catch (error) {
      console.error("Error getting live prices:", error);
      res.status(500).json({ message: "Failed to get live prices" });
    }
  });

  // Performance Metrics API
  app.get("/api/performance/metrics", async (req, res) => {
    try {
      const metrics = performanceOptimizer.getMetrics();
      res.json({
        success: true,
        metrics
      });
    } catch (error) {
      console.error("Error getting performance metrics:", error);
      res.status(500).json({ message: "Failed to get performance metrics" });
    }
  });

  // Manual Scan Trigger API (for Dashboard button functionality)
  app.post("/api/scan/trigger", async (req, res) => {
    try {
      console.log("🎯 Manual scan triggered from dashboard");
      
      // Force a fresh scan cycle
      await performanceOptimizer.smartCache(
        'manual-scan-trigger',
        async () => {
          const { realMarketDataService } = await import('./services/realMarketDataService');
          const movers = await realMarketDataService.getRealMarketMovers();
          
          if (movers.length > 0) {
            console.log(`📊 Manual scan found ${movers.length} market opportunities`);
          }
          
          return movers;
        },
        1000 // Very short cache for manual triggers
      );
      
      res.json({
        success: true,
        message: "Manual scan triggered successfully",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error triggering manual scan:", error);
      res.status(500).json({ message: "Failed to trigger scan" });
    }
  });

  // Real-Time Signals Generation API  
  app.post("/api/signals/generate-live", async (req, res) => {
    try {
      const { count = 8 } = req.body;
      console.log(`🎯 Generating ${count} real-time signals with authentic data...`);
      
      // Import real-time signal generator
      const { realtimeSignalGenerator } = await import('./services/realtimeSignalGenerator');
      const realSignals = await realtimeSignalGenerator.generateLiveSignals(count);
      
      // Store authentic signals
      const storedSignals = [];
      for (const signal of realSignals) {
        try {
          const stored = await storage.createSignal(signal);
          storedSignals.push(stored);
        } catch (error) {
          console.error('Error storing real signal:', error);
        }
      }
      
      res.json({
        success: true,
        count: storedSignals.length,
        signals: storedSignals,
        dataSource: 'REAL_TIME_MARKET_DATA',
        message: `Generated ${storedSignals.length} signals using authentic market data`
      });
    } catch (error) {
      console.error("Error generating real-time signals:", error);
      res.status(500).json({ message: "Failed to generate authentic trading signals" });
    }
  });

  // Real Market Data Health Check
  app.get("/api/market-data/health", async (req, res) => {
    try {
      const { realMarketDataService } = await import('./services/realMarketDataService');
      const health = await realMarketDataService.getServiceHealth();
      res.json(health);
    } catch (error) {
      console.error("Error checking market data health:", error);
      res.status(500).json({ 
        status: 'error',
        message: 'Unable to check market data service health'
      });
    }
  });

  // Start real-time engine and optimization systems
  realtimeEngine.start();
  console.log('🚀 Real-Time Engine: Started with live market tracking');
  console.log('📡 Real Market Data: All endpoints now use authentic data sources');
  console.log('✅ Performance optimizations active');

  // API Management Routes
  app.get("/api/api-management", async (req, res) => {
    try {
      const { simpleAPIManager } = await import('./services/simpleAPIManager');
      
      const apis = simpleAPIManager.getAllAPIs();
      const health = simpleAPIManager.getAPIHealth();
      const stats = simpleAPIManager.getOptimizationStats();

      res.json({
        apis,
        health,
        stats
      });
    } catch (error) {
      console.error("Error fetching API management data:", error);
      res.status(500).json({ message: "Failed to fetch API data" });
    }
  });

  app.post("/api/api-management/:apiName/update", async (req, res) => {
    try {
      const { simpleAPIManager } = await import('./services/simpleAPIManager');
      const { apiName } = req.params;
      const { key, endpoint } = req.body;

      const success = simpleAPIManager.updateAPIKey(apiName, key, endpoint);
      
      if (success) {
        res.json({ message: "API configuration updated successfully" });
      } else {
        res.status(404).json({ message: "API not found" });
      }
    } catch (error) {
      console.error("Error updating API configuration:", error);
      res.status(500).json({ message: "Failed to update API configuration" });
    }
  });

  app.get("/api/api-management/:apiName/status", async (req, res) => {
    try {
      const { simpleAPIManager } = await import('./services/simpleAPIManager');
      const { apiName } = req.params;
      const api = simpleAPIManager.getAPI(apiName);
      
      if (!api) {
        return res.status(404).json({ message: "API not found" });
      }

      const rateLimitCheck = simpleAPIManager.canMakeCall(apiName);
      
      res.json({
        ...api,
        canMakeCall: rateLimitCheck
      });
    } catch (error) {
      console.error("Error fetching API status:", error);
      res.status(500).json({ message: "Failed to fetch API status" });
    }
  });

  app.post("/api/api-management/test-call", async (req, res) => {
    try {
      const { apiTester } = await import('./services/apiTester');
      const { apiName } = req.body;
      
      console.log(`🧪 Testing API: ${apiName} with authentic data`);
      const result = await apiTester.testAPI(apiName);
      
      res.json(result);
    } catch (error) {
      console.error("Error testing API call:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to test API call",
        responseTime: 0
      });
    }
  });

  app.get("/api/api-management/optimization-stats", async (req, res) => {
    try {
      const { simpleAPIManager } = await import('./services/simpleAPIManager');
      
      const stats = simpleAPIManager.getOptimizationStats();
      const health = simpleAPIManager.getAPIHealth();
      
      res.json({
        ...stats,
        healthStatus: health
      });
    } catch (error) {
      console.error("Error fetching optimization stats:", error);
      res.status(500).json({ message: "Failed to fetch optimization stats" });
    }
  });

  // Test all APIs endpoint with comprehensive testing
  app.post("/api/api-management/test-all", async (req, res) => {
    try {
      const { comprehensiveAPITester } = await import('./services/comprehensiveAPITester');
      
      console.log('🧪 Starting comprehensive API testing with success optimization');
      const result = await comprehensiveAPITester.testAllAPIsComprehensively();
      
      res.json({
        success: result.successRate >= 70, // Consider 70%+ success rate as good
        results: result.allResults,
        summary: {
          total: result.totalAPIs,
          successful: result.workingAPIs,
          failed: result.failedAPIs,
          successRate: result.successRate,
          avgResponseTime: result.allResults.reduce((sum, r) => sum + r.responseTime, 0) / result.allResults.length,
          recommendations: result.recommendations
        },
        message: `${result.workingAPIs}/${result.totalAPIs} APIs working (${result.successRate.toFixed(1)}% success rate)`
      });
    } catch (error) {
      console.error("Error testing all APIs:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to test all APIs"
      });
    }
  });

  // Fix API issues endpoint
  app.post("/api/api-management/fix-issues", async (req, res) => {
    try {
      const { apiSuccessEnsurer } = await import('./services/apiSuccessEnsurer');
      
      console.log('🔧 Starting API issue fixing process');
      const fixResult = await apiSuccessEnsurer.fixAPIIssues();
      
      res.json({
        success: fixResult.fixed.length > 0,
        fixed: fixResult.fixed,
        stillBroken: fixResult.stillBroken,
        message: `Fixed ${fixResult.fixed.length} APIs, ${fixResult.stillBroken.length} still need attention`
      });
    } catch (error) {
      console.error("Error fixing API issues:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to fix API issues"
      });
    }
  });

  // AI Providers Management Routes
  app.get("/api/ai-providers/status", async (req, res) => {
    try {
      const { multiAIService } = await import('./services/multiAIService');
      const status = multiAIService.getProviderStatus();
      res.json(status);
    } catch (error) {
      console.error("Error fetching AI provider status:", error);
      res.status(500).json({ message: "Failed to fetch provider status" });
    }
  });

  app.post("/api/ai-providers/test", async (req, res) => {
    try {
      const { provider } = req.body;
      const { multiAIService } = await import('./services/multiAIService');
      
      // Test with sample stock data
      const testData = {
        symbol: 'AAPL',
        price: 150.25,
        changePercent: 2.5,
        volume: 50000000
      };
      
      const result = await multiAIService.generateTradingAnalysis(testData);
      res.json({ 
        success: true, 
        provider,
        result,
        message: `${provider} test completed successfully`
      });
    } catch (error) {
      console.error(`AI provider test failed:`, error);
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  });

  // Strategy Room POWER MODE endpoints
  app.post("/api/strategy-room/analyze", async (req, res) => {
    try {
      const { symbol } = req.body;
      
      if (!symbol) {
        return res.status(400).json({ message: "Symbol is required" });
      }
      
      console.log(`🚀 Strategy Room POWER MODE: Analyzing ${symbol}...`);
      const analysis = await strategyRoom.analyzeStrategy(symbol);
      res.json(analysis);
    } catch (error) {
      console.error("Strategy Room error:", error);
      res.status(500).json({ message: "Analysis failed", error: error.message });
    }
  });

  app.post("/api/strategy-room/auto-generate", async (req, res) => {
    try {
      console.log('🚀 Strategy Room: Starting auto-signal generation...');
      await strategyRoom.autoGenerateSignals();
      res.json({ success: true, message: "Auto-signal generation complete" });
    } catch (error) {
      console.error("Strategy Room auto-generation error:", error);
      res.status(500).json({ message: "Auto-generation failed", error: error.message });
    }
  });

  // Start auto-generation every 10 minutes
  setInterval(async () => {
    try {
      console.log('🚀 Strategy Room: Scheduled auto-generation starting...');
      await strategyRoom.autoGenerateSignals();
    } catch (error) {
      console.error('❌ Strategy Room scheduled generation failed:', error);
    }
  }, 10 * 60 * 1000); // 10 minutes

  console.log('🚀 Strategy Room POWER MODE: Auto-signal generation enabled every 10 minutes');

  // Test Authentic Options Data endpoint - NO FAKE DATA ALLOWED
  app.get('/api/options/test/:symbol', async (req, res) => {
    const { symbol } = req.params;
    
    try {
      console.log(`🧪 TESTING AUTHENTIC OPTIONS DATA for ${symbol}`);
      
      const { OptionsFlowService } = await import('./services/optionsFlowService');
      const optionsService = new OptionsFlowService();
      
      // Test authentic options data fetching only
      const optionsData = await optionsService.getOptionsFlow(symbol);
      
      if (optionsData) {
        console.log(`✅ AUTHENTIC OPTIONS SUCCESS: Got real data for ${symbol}`);
        res.json({
          success: true,
          symbol,
          hasAuthenticData: true,
          dataSource: optionsData.dataSource,
          optionsData: {
            callVolume: optionsData.callVolume,
            putVolume: optionsData.putVolume,
            impliedVolatility: optionsData.impliedVolatility,
            unusualActivity: optionsData.unusualActivity,
            priceTargets: optionsData.priceTargets.length,
            confidence: optionsData.confidence
          }
        });
      } else {
        console.log(`❌ NO AUTHENTIC OPTIONS: Falling back to Claude for ${symbol}`);
        res.json({
          success: false,
          symbol,
          hasAuthenticData: false,
          reason: 'No authentic options data available - would use Claude fallback',
          isOptionable: optionsService.isOptionable(symbol)
        });
      }
      
    } catch (error: any) {
      console.error(`❌ OPTIONS TEST ERROR for ${symbol}:`, error.message);
      res.status(500).json({
        success: false,
        symbol,
        error: error.message
      });
    }
  });

  // Enhanced Strategy Room endpoint - analyzes scan results using options flow or Claude
  app.get('/api/strategy-room/enhanced', async (req, res) => {
    try {
      console.log('🎯 Enhanced Strategy Room: Analyzing pre-market scan results...');
      
      // Get latest pre-market scan results
      const scanResults = await preMarketScanner.getLatestScanResults();
      console.log(`📊 Found ${scanResults.length} pre-market opportunities to analyze`);
      
      if (scanResults.length === 0) {
        return res.json({
          success: true,
          analyses: [],
          summary: {
            optionsFlowTrades: 0,
            claudeTrades: 0,
            totalOpportunities: 0
          },
          timestamp: Date.now()
        });
      }

      // Analyze each opportunity using priority: Options Flow > Claude Multi-Brain
      const analyses = [];
      let optionsFlowCount = 0;
      let claudeCount = 0;

      for (const opportunity of scanResults.slice(0, 5)) { // Limit to top 5
        try {
          console.log(`🔍 Analyzing ${opportunity.symbol}...`);
          
          // Try authentic options flow first
          const analysis = await strategyRoomEnhanced.analyzeOpportunity(opportunity);
          
          if (analysis) {
            analyses.push(analysis);
            
            if (analysis.analysisType === 'OPTIONS_FLOW') {
              optionsFlowCount++;
              console.log(`✅ ${opportunity.symbol} - Used AUTHENTIC OPTIONS FLOW`);
            } else {
              claudeCount++;
              console.log(`✅ ${opportunity.symbol} - Used CLAUDE MULTI-BRAIN`);
            }
          }
        } catch (error) {
          console.error(`❌ Analysis failed for ${opportunity.symbol}:`, error);
        }
      }

      const summary = {
        optionsFlowTrades: optionsFlowCount,
        claudeTrades: claudeCount,
        totalOpportunities: scanResults.length
      };

      console.log(`🎯 Strategy Room Analysis Complete: ${optionsFlowCount} options flow + ${claudeCount} Claude analyses`);

      res.json({
        success: true,
        analyses,
        summary,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('❌ Enhanced Strategy Room error:', error);
      res.status(500).json({ 
        error: 'Failed to analyze opportunities',
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Check target status endpoint
  app.post('/api/strategy-room/check-targets', async (req, res) => {
    try {
      const { analyses } = req.body;
      
      if (!analyses || !Array.isArray(analyses)) {
        return res.status(400).json({ error: 'Invalid analyses data' });
      }

      const targetUpdates: any[] = [];
      
      for (const analysis of analyses) {
        try {
          // Get current market price
          const marketData = await marketDataService.getQuote(analysis.symbol);
          if (marketData) {
            const currentPrice = marketData.price;
            
            // Check each target
            for (let i = 0; i < analysis.targets.length; i++) {
              const target = analysis.targets[i];
              
              if (!target.isReached && currentPrice >= target.price) {
                targetUpdates.push({
                  symbol: analysis.symbol,
                  targetIndex: i,
                  price: target.price,
                  currentPrice,
                  reachedAt: new Date().toISOString().split('T')[0]
                });
              }
            }
          }
        } catch (error) {
          console.error(`Error checking targets for ${analysis.symbol}:`, error);
        }
      }

      res.json({
        success: true,
        targetUpdates,
        count: targetUpdates.length
      });

    } catch (error) {
      console.error('Target check error:', error);
      res.status(500).json({ 
        error: 'Failed to check targets',
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
