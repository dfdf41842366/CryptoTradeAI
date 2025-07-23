
import requests
import yfinance as yf
import pandas as pd
import os
from typing import Dict, List, Optional
from datetime import datetime, timedelta

class MarketDataService:
    def __init__(self):
        self.finnhub_key = os.getenv('FINNHUB_API_KEY')
        self.alpha_vantage_key = os.getenv('ALPHA_VANTAGE_API_KEY')
        self.twelve_data_key = os.getenv('TWELVE_DATA_API_KEY')
        
    def get_stock_data(self, symbol: str) -> Optional[Dict]:
        """Get real-time stock data"""
        try:
            # Try yfinance first (free)
            ticker = yf.Ticker(symbol)
            info = ticker.info
            hist = ticker.history(period='1d', interval='1m')
            
            if hist.empty:
                return None
            
            current_price = hist['Close'].iloc[-1]
            previous_close = info.get('previousClose', current_price)
            
            return {
                'symbol': symbol,
                'price': float(current_price),
                'previous_close': float(previous_close),
                'change': float(current_price - previous_close),
                'change_percent': float((current_price - previous_close) / previous_close * 100),
                'volume': int(hist['Volume'].iloc[-1]),
                'avg_volume': int(info.get('averageVolume', 0)),
                'market_cap': info.get('marketCap', 0),
                'pe_ratio': info.get('trailingPE', 0),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error getting data for {symbol}: {e}")
            return self._get_finnhub_data(symbol)
    
    def _get_finnhub_data(self, symbol: str) -> Optional[Dict]:
        """Fallback to Finnhub API"""
        if not self.finnhub_key:
            return None
            
        try:
            # Get quote
            quote_url = f"https://finnhub.io/api/v1/quote?symbol={symbol}&token={self.finnhub_key}"
            response = requests.get(quote_url)
            data = response.json()
            
            if 'c' not in data:
                return None
            
            return {
                'symbol': symbol,
                'price': float(data['c']),
                'previous_close': float(data['pc']),
                'change': float(data['d']),
                'change_percent': float(data['dp']),
                'high': float(data['h']),
                'low': float(data['l']),
                'open': float(data['o']),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Finnhub error for {symbol}: {e}")
            return None
    
    def get_top_movers(self) -> List[Dict]:
        """Get top market movers"""
        try:
            # Use a predefined list of popular stocks for demo
            symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'ADBE']
            movers = []
            
            for symbol in symbols:
                data = self.get_stock_data(symbol)
                if data and abs(data.get('change_percent', 0)) > 1:
                    movers.append(data)
            
            return sorted(movers, key=lambda x: abs(x.get('change_percent', 0)), reverse=True)
            
        except Exception as e:
            print(f"Error getting top movers: {e}")
            return []
    
    def get_volume_leaders(self) -> List[Dict]:
        """Get volume leaders"""
        try:
            symbols = ['SPY', 'QQQ', 'IWM', 'AAPL', 'MSFT', 'TSLA', 'AMD', 'NVDA']
            leaders = []
            
            for symbol in symbols:
                data = self.get_stock_data(symbol)
                if data:
                    volume_ratio = data.get('volume', 0) / max(data.get('avg_volume', 1), 1)
                    if volume_ratio > 1.5:  # 50% above average
                        data['volume_ratio'] = volume_ratio
                        leaders.append(data)
            
            return sorted(leaders, key=lambda x: x.get('volume_ratio', 0), reverse=True)
            
        except Exception as e:
            print(f"Error getting volume leaders: {e}")
            return []
    
    def get_pre_market_movers(self) -> List[Dict]:
        """Get pre-market movers (gap ups/downs)"""
        try:
            symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX']
            movers = []
            
            for symbol in symbols:
                try:
                    ticker = yf.Ticker(symbol)
                    data = ticker.history(period='2d', interval='1d')
                    
                    if len(data) >= 2:
                        current_price = float(data['Close'].iloc[-1])
                        previous_close = float(data['Close'].iloc[-2])
                        gap_percent = (current_price - previous_close) / previous_close * 100
                        
                        if abs(gap_percent) > 2:  # 2%+ gap
                            movers.append({
                                'symbol': symbol,
                                'pre_market_price': current_price,
                                'previous_close': previous_close,
                                'gap_percent': gap_percent,
                                'volume': int(data['Volume'].iloc[-1])
                            })
                            
                except Exception as e:
                    print(f"Error getting pre-market data for {symbol}: {e}")
                    continue
            
            return movers
            
        except Exception as e:
            print(f"Error getting pre-market movers: {e}")
            return []
    
    def get_options_data(self, symbol: str) -> Optional[Dict]:
        """Get options flow data"""
        try:
            ticker = yf.Ticker(symbol)
            
            # Get options expiration dates
            expirations = ticker.options
            if not expirations:
                return None
            
            # Get next expiration options
            next_expiry = expirations[0]
            options_chain = ticker.option_chain(next_expiry)
            
            calls = options_chain.calls
            puts = options_chain.puts
            
            # Calculate unusual activity
            calls_volume = calls['volume'].sum() if 'volume' in calls else 0
            puts_volume = puts['volume'].sum() if 'volume' in puts else 0
            
            return {
                'symbol': symbol,
                'expiration': next_expiry,
                'calls_volume': int(calls_volume),
                'puts_volume': int(puts_volume),
                'put_call_ratio': puts_volume / max(calls_volume, 1),
                'unusual_activity': calls_volume + puts_volume > 10000,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error getting options data for {symbol}: {e}")
            return None
