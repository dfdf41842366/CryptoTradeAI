
import os
import requests
import json
import time
from typing import Dict, List, Any

class APIHealthChecker:
    def __init__(self):
        self.results = {}
        self.required_keys = [
            'OPENAI_API_KEY',
            'FINNHUB_API_KEY', 
            'ALPHA_VANTAGE_API_KEY',
            'NEWS_API_KEY',
            'POLYGON_API_KEY'
        ]
        
    def clean_openai_key(self, raw_key: str) -> str:
        """Clean OpenAI API key format"""
        if not raw_key:
            return ""
        
        # Remove common prefixes
        clean_key = raw_key.strip()
        clean_key = clean_key.replace('Authorization: Bearer ', '')
        clean_key = clean_key.replace('Bearer ', '')
        clean_key = clean_key.replace('Authorization: ', '')
        clean_key = clean_key.replace('"', '').replace("'", '').strip()
        
        return clean_key
    
    def test_yahoo_finance(self) -> Dict[str, Any]:
        """Test Yahoo Finance API (no key required)"""
        print("🔍 Testing Yahoo Finance API...")
        
        try:
            url = "https://query1.finance.yahoo.com/v8/finance/chart/AAPL"
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('chart', {}).get('result'):
                    print("✅ Yahoo Finance: SUCCESS")
                    return {"success": True, "message": "Working properly"}
                else:
                    print("❌ Yahoo Finance: No data returned")
                    return {"success": False, "message": "No data in response"}
            else:
                print(f"❌ Yahoo Finance: HTTP {response.status_code}")
                return {"success": False, "message": f"HTTP {response.status_code}"}
                
        except Exception as e:
            print(f"❌ Yahoo Finance: {str(e)}")
            return {"success": False, "message": str(e)}
    
    def test_openai_api(self) -> Dict[str, Any]:
        """Test OpenAI API with cleaned key"""
        print("🔍 Testing OpenAI API...")
        
        raw_key = os.getenv('OPENAI_API_KEY')
        if not raw_key:
            print("❌ OpenAI: API key not found")
            return {"success": False, "message": "OPENAI_API_KEY not set in environment"}
        
        clean_key = self.clean_openai_key(raw_key)
        
        if not clean_key.startswith('sk-'):
            print("❌ OpenAI: Invalid key format")
            return {"success": False, "message": "API key should start with 'sk-'"}
        
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                'Authorization': f'Bearer {clean_key}',
                'Content-Type': 'application/json'
            }
            data = {
                "model": "gpt-4o",
                "messages": [{"role": "user", "content": "Test - respond with 'OK'"}],
                "max_tokens": 5
            }
            
            response = requests.post(url, headers=headers, json=data, timeout=30)
            
            if response.status_code == 200:
                print("✅ OpenAI: SUCCESS")
                return {"success": True, "message": "Working properly"}
            elif response.status_code == 429:
                print("❌ OpenAI: Rate limited or quota exceeded")
                return {"success": False, "message": "Rate limited - need to add credits or upgrade plan"}
            elif response.status_code == 401:
                print("❌ OpenAI: Invalid API key")
                return {"success": False, "message": "Invalid API key - check key format"}
            else:
                error_msg = response.json().get('error', {}).get('message', f'HTTP {response.status_code}')
                print(f"❌ OpenAI: {error_msg}")
                return {"success": False, "message": error_msg}
                
        except Exception as e:
            print(f"❌ OpenAI: {str(e)}")
            return {"success": False, "message": str(e)}
    
    def test_finnhub_api(self) -> Dict[str, Any]:
        """Test Finnhub API"""
        print("🔍 Testing Finnhub API...")
        
        api_key = os.getenv('FINNHUB_API_KEY')
        if not api_key:
            print("❌ Finnhub: API key not found")
            return {"success": False, "message": "FINNHUB_API_KEY not set in environment"}
        
        try:
            url = f"https://finnhub.io/api/v1/quote?symbol=AAPL&token={api_key}"
            response = requests.get(url, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if 'c' in data and isinstance(data['c'], (int, float)):
                    print("✅ Finnhub: SUCCESS")
                    return {"success": True, "message": "Working properly"}
                else:
                    print("❌ Finnhub: Invalid response format")
                    return {"success": False, "message": "No price data returned"}
            else:
                print(f"❌ Finnhub: HTTP {response.status_code}")
                return {"success": False, "message": f"HTTP {response.status_code}"}
                
        except Exception as e:
            print(f"❌ Finnhub: {str(e)}")
            return {"success": False, "message": str(e)}
    
    def test_alpha_vantage_api(self) -> Dict[str, Any]:
        """Test Alpha Vantage API"""
        print("🔍 Testing Alpha Vantage API...")
        
        api_key = os.getenv('ALPHA_VANTAGE_API_KEY')
        if not api_key:
            print("❌ Alpha Vantage: API key not found")
            return {"success": False, "message": "ALPHA_VANTAGE_API_KEY not set in environment"}
        
        try:
            url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey={api_key}"
            response = requests.get(url, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if 'Global Quote' in data:
                    print("✅ Alpha Vantage: SUCCESS")
                    return {"success": True, "message": "Working properly"}
                elif 'Note' in data:
                    print("❌ Alpha Vantage: Rate limited")
                    return {"success": False, "message": "API rate limit exceeded"}
                else:
                    print("❌ Alpha Vantage: Invalid response")
                    return {"success": False, "message": "No quote data returned"}
            else:
                print(f"❌ Alpha Vantage: HTTP {response.status_code}")
                return {"success": False, "message": f"HTTP {response.status_code}"}
                
        except Exception as e:
            print(f"❌ Alpha Vantage: {str(e)}")
            return {"success": False, "message": str(e)}
    
    def test_news_api(self) -> Dict[str, Any]:
        """Test News API"""
        print("🔍 Testing News API...")
        
        api_key = os.getenv('NEWS_API_KEY')
        if not api_key:
            print("❌ News API: API key not found")
            return {"success": False, "message": "NEWS_API_KEY not set in environment"}
        
        try:
            url = f"https://newsapi.org/v2/everything?q=stocks&language=en&pageSize=1&apiKey={api_key}"
            response = requests.get(url, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('articles') and len(data['articles']) > 0:
                    print("✅ News API: SUCCESS")
                    return {"success": True, "message": "Working properly"}
                else:
                    print("❌ News API: No articles returned")
                    return {"success": False, "message": "No articles in response"}
            else:
                error_msg = response.json().get('message', f'HTTP {response.status_code}')
                print(f"❌ News API: {error_msg}")
                return {"success": False, "message": error_msg}
                
        except Exception as e:
            print(f"❌ News API: {str(e)}")
            return {"success": False, "message": str(e)}
    
    def test_stocktwits_api(self) -> Dict[str, Any]:
        """Test StockTwits API (no key required)"""
        print("🔍 Testing StockTwits API...")
        
        try:
            url = "https://api.stocktwits.com/api/2/streams/symbol/AAPL.json"
            response = requests.get(url, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('messages') and len(data['messages']) > 0:
                    print("✅ StockTwits: SUCCESS")
                    return {"success": True, "message": "Working properly"}
                else:
                    print("❌ StockTwits: No messages returned")
                    return {"success": False, "message": "No messages in response"}
            else:
                print(f"❌ StockTwits: HTTP {response.status_code}")
                return {"success": False, "message": f"HTTP {response.status_code}"}
                
        except Exception as e:
            print(f"❌ StockTwits: {str(e)}")
            return {"success": False, "message": str(e)}
    
    def check_all_apis(self) -> Dict[str, Any]:
        """Test all APIs and return comprehensive report"""
        print("🧪 Starting Comprehensive API Health Check...")
        print("=" * 50)
        
        # Test all APIs with delays between calls
        self.results['yahoo_finance'] = self.test_yahoo_finance()
        time.sleep(2)
        
        self.results['openai'] = self.test_openai_api()
        time.sleep(2)
        
        self.results['finnhub'] = self.test_finnhub_api()
        time.sleep(2)
        
        self.results['alpha_vantage'] = self.test_alpha_vantage_api()
        time.sleep(2)
        
        self.results['news_api'] = self.test_news_api()
        time.sleep(2)
        
        self.results['stocktwits'] = self.test_stocktwits_api()
        
        # Generate summary
        working_apis = [name for name, result in self.results.items() if result['success']]
        failed_apis = [name for name, result in self.results.items() if not result['success']]
        
        print("\n" + "=" * 50)
        print("📊 API HEALTH SUMMARY")
        print("=" * 50)
        print(f"✅ Working APIs: {len(working_apis)}/{len(self.results)}")
        print(f"❌ Failed APIs: {len(failed_apis)}")
        
        if working_apis:
            print(f"\n🟢 Working: {', '.join(working_apis)}")
        
        if failed_apis:
            print(f"\n🔴 Failed: {', '.join(failed_apis)}")
            print("\n🔧 Issues Found:")
            for api in failed_apis:
                print(f"   • {api}: {self.results[api]['message']}")
        
        # Check environment variables
        print("\n🔑 Environment Variables Status:")
        for key in self.required_keys:
            value = os.getenv(key)
            if value:
                # Show partial key for security
                masked_key = f"{key[:8]}...{key[-4:]}" if len(key) > 12 else "***"
                print(f"   ✅ {key}: Set")
            else:
                print(f"   ❌ {key}: Missing")
        
        return {
            'total_apis': len(self.results),
            'working_apis': len(working_apis),
            'failed_apis': len(failed_apis),
            'success_rate': len(working_apis) / len(self.results) * 100,
            'results': self.results,
            'working': working_apis,
            'failed': failed_apis
        }

if __name__ == "__main__":
    checker = APIHealthChecker()
    summary = checker.check_all_apis()
    
    print(f"\n🎯 Success Rate: {summary['success_rate']:.1f}%")
    
    if summary['failed_apis'] > 0:
        print("\n🚨 ACTION REQUIRED:")
        print("Some APIs need attention. Check the issues above and:")
        print("1. Verify API keys are correctly set in Replit Secrets")
        print("2. Check if APIs need credits/subscription upgrades")
        print("3. Ensure keys are in correct format (OpenAI keys start with 'sk-')")
