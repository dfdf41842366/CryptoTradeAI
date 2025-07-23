
import requests
import time
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import feedparser

class NewsRoomService:
    def __init__(self):
        self.is_monitoring = False
        self.news_sources = [
            'https://feeds.finance.yahoo.com/rss/2.0/headline',
            'https://feeds.reuters.com/reuters/businessNews',
            'https://www.marketwatch.com/rss/marketpulse',
        ]
        self.latest_news = []
        
    def start_monitoring(self):
        """Start monitoring news feeds"""
        def monitor_loop():
            self.is_monitoring = True
            while self.is_monitoring:
                try:
                    print(f"📰 News Room monitoring at {datetime.now()}")
                    self._fetch_latest_news()
                    time.sleep(300)  # Check every 5 minutes
                except Exception as e:
                    print(f"News monitoring error: {e}")
                    time.sleep(60)
        
        monitor_thread = threading.Thread(target=monitor_loop, daemon=True)
        monitor_thread.start()
    
    def stop_monitoring(self):
        """Stop news monitoring"""
        self.is_monitoring = False
        print("📰 News Room monitoring stopped")
    
    def _fetch_latest_news(self):
        """Fetch latest financial news"""
        try:
            all_news = []
            
            for source_url in self.news_sources:
                try:
                    feed = feedparser.parse(source_url)
                    
                    for entry in feed.entries[:5]:  # Get top 5 from each source
                        news_item = {
                            'title': entry.get('title', ''),
                            'summary': entry.get('summary', ''),
                            'link': entry.get('link', ''),
                            'published': entry.get('published', ''),
                            'source': source_url,
                            'sentiment': self._analyze_news_sentiment(entry.get('title', '')),
                            'timestamp': datetime.now().isoformat()
                        }
                        all_news.append(news_item)
                        
                except Exception as e:
                    print(f"Error fetching from {source_url}: {e}")
                    continue
            
            # Sort by timestamp and keep most recent
            all_news.sort(key=lambda x: x['timestamp'], reverse=True)
            self.latest_news = all_news[:20]  # Keep top 20
            
        except Exception as e:
            print(f"Error fetching news: {e}")
    
    def _analyze_news_sentiment(self, title: str) -> dict:
        """Simple sentiment analysis of news titles"""
        try:
            positive_words = ['gains', 'rises', 'up', 'bullish', 'positive', 'growth', 'strong', 'beats', 'upgrade']
            negative_words = ['falls', 'drops', 'down', 'bearish', 'negative', 'decline', 'weak', 'misses', 'downgrade']
            
            title_lower = title.lower()
            
            positive_count = sum(1 for word in positive_words if word in title_lower)
            negative_count = sum(1 for word in negative_words if word in title_lower)
            
            if positive_count > negative_count:
                return {'sentiment': 'positive', 'score': positive_count}
            elif negative_count > positive_count:
                return {'sentiment': 'negative', 'score': -negative_count}
            else:
                return {'sentiment': 'neutral', 'score': 0}
                
        except Exception as e:
            print(f"Sentiment analysis error: {e}")
            return {'sentiment': 'neutral', 'score': 0}
    
    def get_latest_news(self) -> List[Dict]:
        """Get latest news items"""
        try:
            if not self.latest_news:
                self._fetch_latest_news()
            
            return self.latest_news
            
        except Exception as e:
            print(f"Error getting news: {e}")
            return []
    
    def get_catalyst_analysis(self) -> List[Dict]:
        """Get potential market catalysts from news"""
        try:
            catalysts = []
            catalyst_keywords = ['earnings', 'merger', 'acquisition', 'ipo', 'fda', 'approval', 'patent', 'lawsuit']
            
            for news_item in self.latest_news:
                title_lower = news_item.get('title', '').lower()
                
                for keyword in catalyst_keywords:
                    if keyword in title_lower:
                        catalysts.append({
                            **news_item,
                            'catalyst_type': keyword.upper(),
                            'importance': 'HIGH' if keyword in ['earnings', 'merger', 'fda'] else 'MEDIUM'
                        })
                        break
            
            return catalysts[:10]  # Return top 10 catalysts
            
        except Exception as e:
            print(f"Catalyst analysis error: {e}")
            return []
