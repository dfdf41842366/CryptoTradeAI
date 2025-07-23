# Complete API Requirements for AI Trading Platform

## ESSENTIAL APIs (Required for Core Functionality)

### 1. Market Data APIs
**Yahoo Finance API** - Primary market data source
- **Cost**: FREE
- **Setup**: No API key required
- **Purpose**: Real-time stock quotes, historical data, market news
- **Status**: Currently integrated and working
- **Rate Limits**: None specified, but reasonable usage recommended

**Finnhub Stock API** - Professional market data
- **Cost**: FREE tier (60 calls/minute), Premium $25-250/month
- **Setup**: Sign up at https://finnhub.io/
- **API Key**: Add `FINNHUB_API_KEY` to Replit Secrets
- **Purpose**: Enhanced market data, earnings, insider trading, social sentiment
- **Status**: Currently integrated with your existing key

### 2. AI Analysis APIs (Choose Primary + Backup)

**🥇 PRIORITY 1: Anthropic Claude 4.0 Sonnet** - Best reasoning
- **Cost**: $3-30 per 1M tokens (premium quality)
- **Setup**: https://console.anthropic.com/
- **API Key**: Add `ANTHROPIC_API_KEY` to Replit Secrets
- **Purpose**: Advanced financial reasoning, complex market analysis
- **Why Essential**: Best AI for sophisticated trading strategies

**🥈 PRIORITY 2: Google Gemini 2.5 Pro** - Best value
- **Cost**: $1.25-2.50 per 1M tokens (best intelligence per dollar)
- **Setup**: https://aistudio.google.com/app/apikey
- **API Key**: Add `GEMINI_API_KEY` to Replit Secrets
- **Purpose**: Large context analysis, pattern recognition
- **Why Essential**: 2M context window, excellent value for money

**⚡ PRIORITY 3: xAI Grok 2.0** - Real-time insights
- **Cost**: $2 per 1M tokens
- **Setup**: https://console.x.ai/
- **API Key**: Add `XAI_API_KEY` to Replit Secrets
- **Purpose**: Real-time social media data, Twitter sentiment
- **Why Essential**: Only AI with real-time social market data

**🔄 BACKUP: OpenAI GPT-4o** - Reliable standard
- **Cost**: $2.50-10 per 1M tokens
- **Setup**: https://platform.openai.com/api-keys
- **API Key**: Currently configured but quota exceeded
- **Purpose**: General market analysis, signal generation
- **Status**: ⚠️ QUOTA EXCEEDED - Need to add credits or upgrade plan

**💰 BUDGET: DeepSeek R1** - Ultra-budget option
- **Cost**: $0.95 per 1M tokens (90% performance at 10% cost)
- **Setup**: https://platform.deepseek.com/
- **API Key**: Add `DEEPSEEK_API_KEY` to Replit Secrets
- **Purpose**: Cost-effective analysis for high-volume operations

## ENHANCED APIS (Improve Trading Quality)

### 3. Professional Market Data
**Alpha Vantage API** - Technical indicators
- **Cost**: FREE (5 calls/minute), Premium $50-600/month
- **Setup**: https://www.alphavantage.co/support/#api-key
- **API Key**: Add `ALPHA_VANTAGE_API_KEY` to Replit Secrets
- **Purpose**: Technical indicators, earnings, economic data
- **Current Key**: 94T80GRG2FDF7BVD (already configured)

**Polygon.io API** - Professional data
- **Cost**: FREE (5 calls/minute), Premium $99-999/month
- **Setup**: https://polygon.io/
- **API Key**: Add `POLYGON_API_KEY` to Replit Secrets
- **Purpose**: Real-time data, options flow, institutional data
- **Current Key**: uj6d6syChWvBCLm1l7F2M99yUZLwuDCF (already configured)

### 4. News & Sentiment APIs
**News API** - Financial news aggregation
- **Cost**: FREE (100 requests/day), Premium $449/month
- **Setup**: https://newsapi.org/register
- **API Key**: Add `NEWS_API_KEY` to Replit Secrets
- **Purpose**: Bloomberg, Reuters, WSJ news aggregation
- **Current Key**: 978240c2cd104f27ab47b27d54739c0d (already configured)

**StockTwits API** - Social sentiment
- **Cost**: FREE
- **Setup**: No API key required
- **Purpose**: Real-time trader sentiment, trending symbols
- **Status**: Currently integrated and working

## NOTIFICATION APIS (Trading Alerts)

### 5. Alert & Communication
**Discord Webhook** - Trading alerts
- **Cost**: FREE
- **Setup**: Create webhook in Discord server settings
- **API Key**: Add `DISCORD_WEBHOOK_URL` to Replit Secrets
- **Purpose**: Real-time trade alerts, strategy notifications
- **Format**: https://discord.com/api/webhooks/YOUR_WEBHOOK_URL

**Telegram Bot API** - Mobile alerts
- **Cost**: FREE
- **Setup**: Create bot with @BotFather on Telegram
- **API Key**: Add `TELEGRAM_BOT_TOKEN` to Replit Secrets
- **Chat ID**: Add `TELEGRAM_CHAT_ID` to Replit Secrets
- **Purpose**: Mobile trading alerts, portfolio updates

## IMMEDIATE ACTION REQUIRED

### 🚨 CRITICAL: OpenAI API Credits
Your OpenAI API has exceeded its quota. You need to:
1. Go to https://platform.openai.com/billing
2. Add payment method and credits
3. Or upgrade to a paid plan
4. Current usage shows rate limit errors (429 status)

### 🎯 RECOMMENDED SETUP ORDER
1. **Fix OpenAI quota** - Add $5-20 credits immediately
2. **Add Gemini API key** - Best value for money ($1.25/M tokens)
3. **Add Anthropic Claude** - Premium quality analysis ($3/M tokens)
4. **Add Discord webhook** - Free trading alerts
5. **Optional: Grok, DeepSeek** - Advanced features

## ENVIRONMENT VARIABLES TO ADD

Add these to your Replit Secrets:

```bash
# AI Providers (Priority Order)
ANTHROPIC_API_KEY=sk-ant-api03-...
GEMINI_API_KEY=AIza...
XAI_API_KEY=xai-...
OPENAI_API_KEY=sk-proj-... (fix quota)
DEEPSEEK_API_KEY=sk-...

# Market Data (Already have FINNHUB_API_KEY)
ALPHA_VANTAGE_API_KEY=94T80GRG2FDF7BVD
POLYGON_API_KEY=uj6d6syChWvBCLm1l7F2M99yUZLwuDCF
NEWS_API_KEY=978240c2cd104f27ab47b27d54739c0d

# Notifications
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
TELEGRAM_BOT_TOKEN=1234567890:ABC...
TELEGRAM_CHAT_ID=123456789
```

## COST ESTIMATES

### Minimal Setup (Essential Only)
- **Yahoo Finance**: FREE
- **Finnhub**: FREE tier (60 calls/min)
- **Gemini 2.5 Pro**: $10-50/month (depending on usage)
- **Total**: $10-50/month

### Professional Setup (Recommended)
- **All Essential APIs**: $10-50/month
- **Claude 4.0**: $20-100/month (premium analysis)
- **Alpha Vantage Premium**: $50/month
- **Total**: $80-200/month

### Enterprise Setup (Maximum Performance)
- **All APIs included**
- **Polygon.io Premium**: $99/month
- **News API Premium**: $449/month
- **Total**: $600-800/month

## CURRENT STATUS SUMMARY

✅ **Working**: Yahoo Finance, StockTwits, Finnhub (with your key)
⚠️ **Quota Issues**: OpenAI API (needs credits)
❌ **Missing**: Claude, Gemini, Grok, Discord webhooks
🔧 **Pre-configured**: Alpha Vantage, Polygon, News API (keys ready)

## NEXT STEPS

1. **Immediate**: Fix OpenAI quota or add Gemini API key
2. **This week**: Add Claude for premium analysis
3. **Optional**: Add notification webhooks for alerts
4. **Advanced**: Add Grok for real-time social data

The system will work with just Yahoo Finance + one AI provider, but multiple AI providers provide redundancy and specialized capabilities.