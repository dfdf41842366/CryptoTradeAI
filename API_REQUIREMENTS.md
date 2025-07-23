# Required Market Data APIs for AI Trading Platform

## Essential APIs (in order of priority):

### 1. Yahoo Finance API (yfinance) - FREE
- **Purpose**: Primary real-time stock quotes, historical data
- **Cost**: Free, no API key required
- **Endpoint**: https://query1.finance.yahoo.com/v8/finance/chart/SYMBOL
- **Rate Limits**: Generous for individual use
- **Data**: Price, volume, market cap, P/E ratio, 52-week high/low
- **Status**: ✅ Already integrated in code

### 2. Alpha Vantage API - FREE TIER + PAID
- **Purpose**: Technical indicators, fundamental data, news sentiment
- **Cost**: Free (5 calls/min, 500 calls/day) | Premium ($49/month)
- **API Key Required**: ALPHA_VANTAGE_API_KEY
- **Endpoint**: https://www.alphavantage.co/query
- **Data**: RSI, MACD, moving averages, earnings, financial ratios
- **Get Key**: https://www.alphavantage.co/support/#api-key

### 3. Polygon.io API - PAID (Most Reliable)
- **Purpose**: Professional-grade market data, real-time quotes
- **Cost**: $99/month for real-time data
- **API Key Required**: POLYGON_API_KEY  
- **Endpoint**: https://api.polygon.io/v2/aggs/ticker/SYMBOL
- **Data**: Real-time quotes, options data, market news
- **Get Key**: https://polygon.io/pricing

### 4. IEX Cloud API - FREEMIUM
- **Purpose**: Real-time quotes, company fundamentals
- **Cost**: Free (100 credits/day) | Paid ($9/month+)
- **API Key Required**: IEX_CLOUD_API_KEY
- **Endpoint**: https://cloud.iexapis.com/stable/stock/SYMBOL/quote
- **Data**: Real-time quotes, financial statements, insider trading
- **Get Key**: https://iexcloud.io/pricing

### 5. Finnhub API - FREEMIUM (Already Have)
- **Purpose**: Company news, earnings, market sentiment
- **Cost**: Free (60 calls/min) | Pro ($10/month+)
- **API Key**: Already configured (FINNHUB_API_KEY)
- **Status**: ✅ Currently rate-limited - upgrade needed for production

### 6. News & Sentiment APIs

#### News API
- **Purpose**: Financial news aggregation
- **Cost**: Free (500 requests/day) | Paid ($99/month+)
- **API Key Required**: NEWS_API_KEY
- **Get Key**: https://newsapi.org/pricing

#### Twitter/X API (Optional)
- **Purpose**: Social sentiment analysis
- **Cost**: $100/month for basic tier
- **API Key Required**: TWITTER_BEARER_TOKEN
- **Note**: Expensive but valuable for meme stock analysis

## Recommended Setup for Production:

1. **Start Free**: Yahoo Finance + Alpha Vantage free tier
2. **Upgrade Path**: Add Polygon.io ($99/month) for real-time data
3. **Full Production**: All APIs for maximum reliability and data accuracy

## Current Status:
- ✅ FINNHUB_API_KEY: Configured (rate-limited)
- ❌ ALPHA_VANTAGE_API_KEY: Needed
- ❌ POLYGON_API_KEY: Needed for pro features
- ❌ IEX_CLOUD_API_KEY: Needed for backup
- ❌ NEWS_API_KEY: Needed for news sentiment

Would you like me to configure these APIs one by one?