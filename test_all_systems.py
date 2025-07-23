
#!/usr/bin/env python3

import requests
import json
import time
import os
from datetime import datetime
import yfinance as yf
from services.market_data import MarketDataService
from services.scanner_service import ScannerService
from services.openai_service import OpenAIService
from services.news_room import NewsRoomService
from api_health_checker import APIHealthChecker

class ComprehensiveSystemTest:
    def __init__(self):
        self.base_url = "http://0.0.0.0:5000"
        self.test_results = {}
        self.market_data_service = MarketDataService()
        self.scanner_service = ScannerService()
        self.openai_service = OpenAIService()
        self.news_room_service = NewsRoomService()
        
    def test_api_health(self):
        """Test all external APIs"""
        print("🧪 TESTING EXTERNAL APIs...")
        print("=" * 50)
        
        checker = APIHealthChecker()
        results = checker.check_all_apis()
        
        self.test_results['api_health'] = results
        print(f"✅ API Health Check: {results['success_rate']:.1f}% success rate")
        return results['success_rate'] > 80
    
    def test_yahoo_finance_data(self):
        """Test Yahoo Finance with real data"""
        print("\n🔍 TESTING YAHOO FINANCE DATA...")
        
        try:
            # Test real stock data
            ticker = yf.Ticker("AAPL")
            info = ticker.info
            hist = ticker.history(period="1d")
            
            if info and 'currentPrice' in info and not hist.empty:
                current_price = info['currentPrice']
                volume = hist['Volume'].iloc[-1]
                print(f"✅ AAPL Real Data: ${current_price:.2f}, Volume: {volume:,}")
                self.test_results['yahoo_finance'] = {"success": True, "price": current_price, "volume": volume}
                return True
            else:
                print("❌ Yahoo Finance: No valid data returned")
                return False
                
        except Exception as e:
            print(f"❌ Yahoo Finance Error: {str(e)}")
            self.test_results['yahoo_finance'] = {"success": False, "error": str(e)}
            return False
    
    def test_market_data_service(self):
        """Test market data service with authentic data"""
        print("\n📊 TESTING MARKET DATA SERVICE...")
        
        try:
            # Test stock data
            stock_data = self.market_data_service.get_stock_data("AAPL")
            if stock_data and 'price' in stock_data:
                print(f"✅ Market Data Service: AAPL ${stock_data['price']:.2f}")
                
                # Test options data
                options_data = self.market_data_service.get_options_data("AAPL")
                if options_data:
                    print(f"✅ Options Data: {len(options_data.get('calls', []))} calls, {len(options_data.get('puts', []))} puts")
                    
                # Test volume leaders
                volume_leaders = self.market_data_service.get_volume_leaders()
                print(f"✅ Volume Leaders: {len(volume_leaders)} stocks")
                
                self.test_results['market_data'] = {"success": True, "data": stock_data}
                return True
            else:
                print("❌ Market Data Service: No valid data")
                return False
                
        except Exception as e:
            print(f"❌ Market Data Service Error: {str(e)}")
            return False
    
    def test_scanner_service(self):
        """Test scanner service functionality"""
        print("\n🔍 TESTING SCANNER SERVICE...")
        
        try:
            # Test pre-market scan
            scan_results = self.scanner_service.perform_scan()
            if scan_results and len(scan_results) > 0:
                print(f"✅ Scanner: Found {len(scan_results)} opportunities")
                
                # Test with real symbol analysis
                if scan_results:
                    symbol = scan_results[0]['symbol']
                    analysis = self.scanner_service.analyze_symbol_strategy(symbol)
                    if analysis:
                        print(f"✅ Symbol Analysis: {symbol} analyzed successfully")
                        self.test_results['scanner'] = {"success": True, "results": len(scan_results)}
                        return True
                        
            print("❌ Scanner: No results returned")
            return False
            
        except Exception as e:
            print(f"❌ Scanner Error: {str(e)}")
            return False
    
    def test_flask_endpoints(self):
        """Test all Flask API endpoints"""
        print("\n🌐 TESTING FLASK ENDPOINTS...")
        
        endpoints_to_test = [
            "/api/health",
            "/api/signals", 
            "/api/market-data/AAPL",
            "/api/options/AAPL",
            "/api/pre-market-scanner",
            "/api/strategy-room",
            "/api/volume-leaders",
            "/api/top-movers",
            "/api/api-status"
        ]
        
        working_endpoints = 0
        
        for endpoint in endpoints_to_test:
            try:
                response = requests.get(f"{self.base_url}{endpoint}", timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    if data.get('success', True):  # Some endpoints don't use success field
                        print(f"✅ {endpoint}")
                        working_endpoints += 1
                    else:
                        print(f"❌ {endpoint}: {data.get('error', 'Unknown error')}")
                else:
                    print(f"❌ {endpoint}: HTTP {response.status_code}")
                    
            except Exception as e:
                print(f"❌ {endpoint}: {str(e)}")
        
        success_rate = (working_endpoints / len(endpoints_to_test)) * 100
        print(f"\n📊 Flask Endpoints: {working_endpoints}/{len(endpoints_to_test)} working ({success_rate:.1f}%)")
        self.test_results['flask_endpoints'] = {"success": success_rate > 80, "working": working_endpoints, "total": len(endpoints_to_test)}
        return success_rate > 80
    
    def test_ai_services(self):
        """Test AI services with real requests"""
        print("\n🧠 TESTING AI SERVICES...")
        
        try:
            # Test AI predictions
            response = requests.post(f"{self.base_url}/api/ai/predictions", 
                                   json={"symbol": "AAPL", "timeHorizon": "1d"}, 
                                   timeout=30)
            
            if response.status_code == 200:
                print("✅ AI Predictions: Working")
                
                # Test swarm analysis  
                response = requests.get(f"{self.base_url}/api/ai/swarm/AAPL", timeout=30)
                if response.status_code == 200:
                    print("✅ AI Swarm: Working")
                    
                    # Test sentiment analysis
                    response = requests.get(f"{self.base_url}/api/sentiment/AAPL", timeout=30)
                    if response.status_code == 200:
                        print("✅ Sentiment Analysis: Working")
                        self.test_results['ai_services'] = {"success": True}
                        return True
                        
            print("❌ AI Services: Not responding properly")
            return False
            
        except Exception as e:
            print(f"❌ AI Services Error: {str(e)}")
            return False
    
    def test_frontend_functionality(self):
        """Test frontend HTML page"""
        print("\n🎨 TESTING FRONTEND...")
        
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            if response.status_code == 200 and "AI Trading Platform" in response.text:
                print("✅ Frontend: HTML page loads correctly")
                
                # Check if static files are accessible
                response = requests.get(f"{self.base_url}/static/index.html", timeout=10)
                if response.status_code == 200:
                    print("✅ Static Files: Accessible")
                    self.test_results['frontend'] = {"success": True}
                    return True
                    
            print("❌ Frontend: Not loading properly")
            return False
            
        except Exception as e:
            print(f"❌ Frontend Error: {str(e)}")
            return False
    
    def test_data_authenticity(self):
        """Verify all data is authentic and not fake"""
        print("\n🔐 TESTING DATA AUTHENTICITY...")
        
        authentic_tests = []
        
        try:
            # Test 1: Real-time price consistency
            aapl_yahoo = yf.Ticker("AAPL").info.get('currentPrice', 0)
            aapl_service = self.market_data_service.get_stock_data("AAPL").get('price', 0)
            
            price_diff = abs(aapl_yahoo - aapl_service) / aapl_yahoo * 100
            if price_diff < 5:  # Allow 5% difference for timing
                print(f"✅ Price Consistency: Yahoo ${aapl_yahoo:.2f} vs Service ${aapl_service:.2f}")
                authentic_tests.append(True)
            else:
                print(f"❌ Price Inconsistency: Too much difference ({price_diff:.1f}%)")
                authentic_tests.append(False)
            
            # Test 2: No placeholder data
            scan_results = self.scanner_service.perform_scan()
            fake_symbols = ["TEST", "FAKE", "MOCK", "SAMPLE"]
            has_fake = any(result['symbol'] in fake_symbols for result in scan_results)
            
            if not has_fake:
                print("✅ No Fake Symbols: All scan results use real tickers")
                authentic_tests.append(True)
            else:
                print("❌ Fake Symbols Detected: Found test/mock symbols")
                authentic_tests.append(False)
                
            # Test 3: Real volume data
            volume_leaders = self.market_data_service.get_volume_leaders()
            if volume_leaders and all(stock.get('volume', 0) > 1000 for stock in volume_leaders[:5]):
                print("✅ Authentic Volume: All leaders have realistic volume")
                authentic_tests.append(True)
            else:
                print("❌ Suspicious Volume: Volume data seems artificial")
                authentic_tests.append(False)
            
            authenticity_score = sum(authentic_tests) / len(authentic_tests) * 100
            print(f"\n🎯 Data Authenticity Score: {authenticity_score:.1f}%")
            
            self.test_results['authenticity'] = {"success": authenticity_score >= 80, "score": authenticity_score}
            return authenticity_score >= 80
            
        except Exception as e:
            print(f"❌ Authenticity Test Error: {str(e)}")
            return False
    
    def run_full_test_suite(self):
        """Run all tests and generate comprehensive report"""
        print("🚀 STARTING COMPREHENSIVE SYSTEM TEST")
        print("=" * 60)
        
        test_functions = [
            ("API Health Check", self.test_api_health),
            ("Yahoo Finance Data", self.test_yahoo_finance_data),
            ("Market Data Service", self.test_market_data_service),
            ("Scanner Service", self.test_scanner_service),
            ("Flask Endpoints", self.test_flask_endpoints),
            ("AI Services", self.test_ai_services),
            ("Frontend", self.test_frontend_functionality),
            ("Data Authenticity", self.test_data_authenticity)
        ]
        
        results = []
        start_time = time.time()
        
        for test_name, test_func in test_functions:
            print(f"\n{'='*20} {test_name.upper()} {'='*20}")
            try:
                result = test_func()
                results.append((test_name, result))
                time.sleep(2)  # Prevent rate limiting
            except Exception as e:
                print(f"❌ {test_name} FAILED: {str(e)}")
                results.append((test_name, False))
        
        # Generate final report
        total_time = time.time() - start_time
        passed_tests = sum(1 for _, result in results if result)
        total_tests = len(results)
        success_rate = (passed_tests / total_tests) * 100
        
        print("\n" + "="*60)
        print("📊 FINAL TEST REPORT")
        print("="*60)
        print(f"⏱️  Total Test Time: {total_time:.1f} seconds")
        print(f"✅ Passed Tests: {passed_tests}/{total_tests}")
        print(f"📈 Success Rate: {success_rate:.1f}%")
        print(f"🕐 Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        print("\n📋 DETAILED RESULTS:")
        for test_name, result in results:
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"   {status} {test_name}")
        
        if success_rate >= 90:
            print("\n🎉 EXCELLENT: System is production-ready!")
        elif success_rate >= 75:
            print("\n👍 GOOD: System is mostly functional with minor issues")
        elif success_rate >= 50:
            print("\n⚠️  WARNING: System has significant issues that need attention")
        else:
            print("\n🚨 CRITICAL: System requires major fixes before use")
        
        # Save detailed results
        self.test_results['summary'] = {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "success_rate": success_rate,
            "test_time": total_time,
            "timestamp": datetime.now().isoformat()
        }
        
        return self.test_results

def main():
    """Main test execution"""
    print("🔧 Waiting for Flask app to start...")
    time.sleep(5)  # Give Flask time to start
    
    tester = ComprehensiveSystemTest()
    results = tester.run_full_test_suite()
    
    # Save results to file
    with open('test_results.json', 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\n💾 Detailed results saved to: test_results.json")
    return results

if __name__ == "__main__":
    main()
