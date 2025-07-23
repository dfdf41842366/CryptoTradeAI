
import requests
import time
import threading
from datetime import datetime
from typing import List, Dict

class NewsRoomService:
    def __init__(self):
        self.is_running = True
        self.news_data = []
        
        # Start news monitoring
        self.start_monitoring()
    
    def start_monitoring(self):
        """Start real-time news monitoring"""
        print("📰 News Room started - monitoring market catalysts")
        
        def news_loop():
            while self.is_running:
                try:
                    self.fetch_market_news()
                    time.sleep(300)  # 5 minutes
                except Exception as e:
                    print(f"News Room error: {e}")
                    time.sleep(60)
        
        # Start in background thread
        news_thread = threading.Thread(target=news_loop, daemon=True)
        news_thread.start()
    
    def fetch_market_news(self):
        """Fetch latest market news and catalysts"""
        try:
            # Simulated news data for now
            # In production, would integrate with news APIs
            
            sample_news = [
                {
                    'title': 'Market opens higher on tech earnings',
                    'symbol': 'TECH',
                    'sentiment': 'positive',
                    'impact': 'high',
                    'timestamp': datetime.now().isoformat()
                },
                {
                    'title': 'Fed signals rate cut ahead',
                    'symbol': 'SPY',
                    'sentiment': 'positive', 
                    'impact': 'high',
                    'timestamp': datetime.now().isoformat()
                }
            ]
            
            self.news_data = sample_news
            print(f"📰 Updated news data: {len(sample_news)} items")
            
        except Exception as e:
            print(f"News fetch error: {e}")
    
    def get_latest_news(self) -> List[Dict]:
        """Get latest market news"""
        return self.news_data
    
    def stop_monitoring(self):
        """Stop news monitoring"""
        self.is_running = False
