
# API Setup Guide - Current Status Check

## 🔍 CURRENT API STATUS

Run `python api_health_checker.py` to see the live status of all APIs.

## 🔑 REQUIRED API KEYS (Add to Replit Secrets)

### 1. **OPENAI_API_KEY** (Essential)
- **Status**: Check with health checker
- **Format**: Should start with `sk-`
- **Get Key**: https://platform.openai.com/api-keys
- **Cost**: Pay-per-use (need credits for API calls)
- **Issue**: If failing, likely need to add credits to OpenAI account

### 2. **FINNHUB_API_KEY** (Essential)
- **Status**: Check with health checker  
- **Get Key**: https://finnhub.io/register
- **Cost**: Free tier (60 calls/minute)
- **Current**: Should be configured

### 3. **ALPHA_VANTAGE_API_KEY** (Important)
- **Status**: Check with health checker
- **Get Key**: https://www.alphavantage.co/support/#api-key
- **Cost**: Free tier (5 calls/minute)
- **Current**: Key might be set already

### 4. **NEWS_API_KEY** (Optional)
- **Status**: Check with health checker
- **Get Key**: https://newsapi.org/register
- **Cost**: Free tier (100 requests/day)
- **Current**: Key might be set already

### 5. **POLYGON_API_KEY** (Professional)
- **Status**: Check with health checker
- **Get Key**: https://polygon.io/pricing
- **Cost**: $99/month for real-time data
- **Current**: May have free tier key

## 🆓 FREE APIs (No Keys Required)
- ✅ **Yahoo Finance**: Works without API key
- ✅ **StockTwits**: Works without API key

## 🚨 MOST LIKELY ISSUES

### OpenAI API Quota Exceeded
**Problem**: "Rate limited or quota exceeded"
**Solution**: 
1. Go to https://platform.openai.com/billing
2. Add $5-20 in credits
3. Or upgrade to paid plan

### Invalid API Key Format
**Problem**: API key format errors
**Solution**:
1. Check key doesn't have extra text like "Bearer" or "Authorization:"
2. OpenAI keys should start with "sk-"
3. Copy key exactly as provided

## ⚡ QUICK SETUP STEPS

1. **Run Health Check**: `python api_health_checker.py`
2. **Add Missing Keys**: Use Replit Secrets tool
3. **Test Again**: Run health check again
4. **Get Support**: Let me know which specific APIs are failing

## 🔧 HOW TO ADD API KEYS IN REPLIT

1. Click **Tools** → **Secrets** in Replit sidebar
2. Click **+ New Secret**
3. Add key name (e.g., `OPENAI_API_KEY`)
4. Add key value (the actual API key)
5. Click **Add Secret**
6. Restart your app

## 💡 RECOMMENDATIONS

**Minimal Setup** (Free):
- Yahoo Finance ✅ (already working)
- StockTwits ✅ (already working)  
- OpenAI with $10 credits
- Finnhub free tier

**Professional Setup** ($100/month):
- All free APIs +
- OpenAI credits +
- Polygon.io professional data

Let me know which APIs are failing and I'll help you get them working!
