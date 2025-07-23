
#!/usr/bin/env python3

import requests
import json
import time
from datetime import datetime

class FrontendButtonTester:
    def __init__(self):
        self.base_url = "http://0.0.0.0:5000"
        self.test_results = {}
        
    def test_dashboard_buttons(self):
        """Test all dashboard functionality"""
        print("🎛️ TESTING DASHBOARD BUTTONS...")
        
        tests = []
        
        # Test refresh functionality
        try:
            response = requests.get(f"{self.base_url}/api/signals", timeout=10)
            if response.status_code == 200:
                print("✅ Refresh Data Button: Working")
                tests.append(True)
            else:
                print("❌ Refresh Data Button: Failed")
                tests.append(False)
        except:
            print("❌ Refresh Data Button: Error")
            tests.append(False)
            
        return all(tests)
    
    def test_scanner_buttons(self):
        """Test scanner functionality"""
        print("🔍 TESTING SCANNER BUTTONS...")
        
        tests = []
        
        # Test run scan button
        try:
            response = requests.post(f"{self.base_url}/api/scan", timeout=15)
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('data'):
                    print(f"✅ Run Scan Button: Found {len(data['data'])} results")
                    tests.append(True)
                else:
                    print("❌ Run Scan Button: No data returned")
                    tests.append(False)
            else:
                print("❌ Run Scan Button: HTTP error")
                tests.append(False)
        except Exception as e:
            print(f"❌ Run Scan Button: {str(e)}")
            tests.append(False)
            
        # Test pre-market scanner
        try:
            response = requests.get(f"{self.base_url}/api/pre-market-scanner", timeout=15)
            if response.status_code == 200:
                print("✅ Pre-Market Scanner: Working")
                tests.append(True)
            else:
                print("❌ Pre-Market Scanner: Failed")
                tests.append(False)
        except:
            print("❌ Pre-Market Scanner: Error")
            tests.append(False)
            
        return all(tests)
    
    def test_ai_analysis_buttons(self):
        """Test AI analysis functionality"""
        print("🧠 TESTING AI ANALYSIS BUTTONS...")
        
        tests = []
        
        # Test AI analysis button
        try:
            test_data = {
                "symbol": "AAPL",
                "timeHorizon": "1d"
            }
            response = requests.post(f"{self.base_url}/api/ai/predictions", 
                                   json=test_data, timeout=30)
            if response.status_code == 200:
                print("✅ AI Analysis Button: Working")
                tests.append(True)
            else:
                print("❌ AI Analysis Button: Failed")
                tests.append(False)
        except Exception as e:
            print(f"❌ AI Analysis Button: {str(e)}")
            tests.append(False)
            
        # Test AI swarm analysis
        try:
            response = requests.get(f"{self.base_url}/api/ai/swarm/AAPL", timeout=30)
            if response.status_code == 200:
                print("✅ AI Swarm Button: Working")
                tests.append(True)
            else:
                print("❌ AI Swarm Button: Failed")
                tests.append(False)
        except:
            print("❌ AI Swarm Button: Error")
            tests.append(False)
            
        return all(tests)
    
    def test_autonomous_ai_buttons(self):
        """Test ARIA autonomous AI controls"""
        print("🤖 TESTING AUTONOMOUS AI BUTTONS...")
        
        tests = []
        
        # Test status check
        try:
            response = requests.get(f"{self.base_url}/api/ai/autonomous/status", timeout=10)
            if response.status_code == 200:
                print("✅ ARIA Status: Working")
                tests.append(True)
            else:
                print("❌ ARIA Status: Failed")
                tests.append(False)
        except:
            print("❌ ARIA Status: Error")
            tests.append(False)
            
        # Test start button
        try:
            response = requests.post(f"{self.base_url}/api/ai/autonomous/start", timeout=10)
            if response.status_code == 200:
                print("✅ Start ARIA Button: Working")
                
                # Test stop button
                response = requests.post(f"{self.base_url}/api/ai/autonomous/stop", timeout=10)
                if response.status_code == 200:
                    print("✅ Stop ARIA Button: Working")
                    tests.append(True)
                else:
                    print("❌ Stop ARIA Button: Failed")
                    tests.append(False)
            else:
                print("❌ Start ARIA Button: Failed")
                tests.append(False)
        except:
            print("❌ ARIA Control Buttons: Error")
            tests.append(False)
            
        return all(tests)
    
    def test_data_retrieval_buttons(self):
        """Test data retrieval functionality"""
        print("📊 TESTING DATA RETRIEVAL BUTTONS...")
        
        tests = []
        endpoints = [
            ("Market Data", "/api/market-data/AAPL"),
            ("Options Data", "/api/options/AAPL"),
            ("Volume Leaders", "/api/volume-leaders"),
            ("Top Movers", "/api/top-movers"),
            ("Strategy Room", "/api/strategy-room"),
            ("News Room", "/api/news/room")
        ]
        
        for name, endpoint in endpoints:
            try:
                response = requests.get(f"{self.base_url}{endpoint}", timeout=15)
                if response.status_code == 200:
                    data = response.json()
                    if data.get('success', True):
                        print(f"✅ {name}: Working")
                        tests.append(True)
                    else:
                        print(f"❌ {name}: No success flag")
                        tests.append(False)
                else:
                    print(f"❌ {name}: HTTP {response.status_code}")
                    tests.append(False)
            except Exception as e:
                print(f"❌ {name}: {str(e)}")
                tests.append(False)
                
        return len([t for t in tests if t]) >= len(tests) * 0.8  # 80% success rate
    
    def run_all_button_tests(self):
        """Run all button tests"""
        print("🧪 STARTING COMPREHENSIVE BUTTON TESTING")
        print("=" * 50)
        
        button_tests = [
            ("Dashboard Buttons", self.test_dashboard_buttons),
            ("Scanner Buttons", self.test_scanner_buttons),
            ("AI Analysis Buttons", self.test_ai_analysis_buttons),
            ("Autonomous AI Buttons", self.test_autonomous_ai_buttons),
            ("Data Retrieval Buttons", self.test_data_retrieval_buttons)
        ]
        
        results = []
        
        for test_name, test_func in button_tests:
            print(f"\n{'='*15} {test_name.upper()} {'='*15}")
            try:
                result = test_func()
                results.append((test_name, result))
                time.sleep(1)  # Brief pause between tests
            except Exception as e:
                print(f"❌ {test_name} FAILED: {str(e)}")
                results.append((test_name, False))
        
        # Generate report
        passed = sum(1 for _, result in results if result)
        total = len(results)
        success_rate = (passed / total) * 100
        
        print("\n" + "="*50)
        print("📊 BUTTON TEST REPORT")
        print("="*50)
        print(f"✅ Working Button Groups: {passed}/{total}")
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        for test_name, result in results:
            status = "✅ WORKING" if result else "❌ ISSUES"
            print(f"   {status} {test_name}")
        
        if success_rate >= 90:
            print("\n🎉 EXCELLENT: All buttons working perfectly!")
        elif success_rate >= 70:
            print("\n👍 GOOD: Most buttons working, minor issues")
        else:
            print("\n⚠️  WARNING: Multiple button issues detected")
            
        return results

if __name__ == "__main__":
    print("🔧 Waiting for Flask app...")
    time.sleep(3)
    
    tester = FrontendButtonTester()
    results = tester.run_all_button_tests()
