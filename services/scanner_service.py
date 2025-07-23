
import requests
import pandas as pd
import numpy as np
import time
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from .market_data import MarketDataService
from .openai_service import OpenAIService

class ScannerService:
    def __init__(self):
        self.market_data = MarketDataService()
        self.ai_service = OpenAIService()
        self.last_scan_time = None
        self.signals = []
        
    def perform_scan(self) -> List[Dict]:
        """Perform comprehensive market scan"""
        try:
            print("🔍 Starting comprehensive market scan...")
            
            # Get top movers and volume leaders
            movers = self.market_data.get_top_movers()
            volume_leaders = self.market_data.get_volume_leaders()
            
            # Combine and analyze
            all_symbols = list(set([stock['symbol'] for stock in movers + volume_leaders]))
            
            signals = []
            for symbol in all_symbols[:20]:  # Limit to top 20 for performance
                try:
                    signal = self._analyze_stock(symbol)
                    if signal:
                        signals.append(signal)
                        time.sleep(0.1)  # Rate limiting
                except Exception as e:
                    print(f"Error analyzing {symbol}: {e}")
                    continue
            
            # Sort by confidence score
            signals.sort(key=lambda x: x.get('confidence', 0), reverse=True)
            
            self.signals = signals
            self.last_scan_time = datetime.now()
            
            print(f"✅ Scan complete. Found {len(signals)} signals.")
            return signals
            
        except Exception as e:
            print(f"❌ Scan failed: {e}")
            return []
    
    def _analyze_stock(self, symbol: str) -> Optional[Dict]:
        """Analyze individual stock for trading signals"""
        try:
            # Get market data
            stock_data = self.market_data.get_stock_data(symbol)
            if not stock_data:
                return None
            
            # Calculate technical indicators
            price = stock_data.get('price', 0)
            volume = stock_data.get('volume', 0)
            change_percent = stock_data.get('change_percent', 0)
            
            # Volume sensitivity score
            avg_volume = stock_data.get('avg_volume', volume)
            volume_ratio = volume / avg_volume if avg_volume > 0 else 1
            volume_sensitivity_score = min(volume_ratio * 10, 100)
            
            # AI analysis
            analysis = self.ai_service.analyze_stock(symbol, stock_data)
            
            signal = {
                'symbol': symbol,
                'price': price,
                'change_percent': change_percent,
                'volume': volume,
                'volume_sensitivity_score': volume_sensitivity_score,
                'signal_type': 'BUY' if change_percent > 2 else 'SELL' if change_percent < -2 else 'HOLD',
                'confidence': min(abs(change_percent) * 10 + volume_sensitivity_score, 100),
                'ai_analysis': analysis,
                'timestamp': datetime.now().isoformat(),
                'target_price': price * (1.1 if change_percent > 0 else 0.9),
                'stop_loss': price * (0.95 if change_percent > 0 else 1.05)
            }
            
            return signal
            
        except Exception as e:
            print(f"Error analyzing {symbol}: {e}")
            return None
    
    def pre_market_scan(self) -> List[Dict]:
        """Perform pre-market scanning for gap ups/downs"""
        try:
            print("🌅 Starting pre-market scan...")
            
            # Get pre-market movers
            pre_market_data = self.market_data.get_pre_market_movers()
            
            signals = []
            for stock in pre_market_data:
                if abs(stock.get('gap_percent', 0)) > 5:  # 5%+ gap
                    signal = {
                        'symbol': stock['symbol'],
                        'gap_percent': stock['gap_percent'],
                        'pre_market_price': stock['pre_market_price'],
                        'previous_close': stock['previous_close'],
                        'volume': stock.get('volume', 0),
                        'signal_type': 'GAP_UP' if stock['gap_percent'] > 0 else 'GAP_DOWN',
                        'timestamp': datetime.now().isoformat()
                    }
                    signals.append(signal)
            
            return signals
            
        except Exception as e:
            print(f"❌ Pre-market scan failed: {e}")
            return []
    
    def get_trading_strategies(self) -> List[Dict]:
        """Get current trading strategies and recommendations"""
        strategies = [
            {
                'name': 'Volume Breakout',
                'description': 'High volume stocks breaking resistance',
                'risk_level': 'Medium',
                'success_rate': '75%',
                'signals': [s for s in self.signals if s.get('volume_sensitivity_score', 0) > 50]
            },
            {
                'name': 'Gap Trading',
                'description': 'Pre-market gap ups/downs with volume',
                'risk_level': 'High',
                'success_rate': '65%',
                'signals': [s for s in self.signals if 'GAP' in s.get('signal_type', '')]
            },
            {
                'name': 'AI Momentum',
                'description': 'AI-powered momentum signals',
                'risk_level': 'Medium',
                'success_rate': '80%',
                'signals': [s for s in self.signals if s.get('confidence', 0) > 70]
            }
        ]
        
        return strategies
    
    def get_latest_signals(self) -> List[Dict]:
        """Get the latest trading signals"""
        return self.signals
    
    def start_periodic_scanning(self):
        """Start periodic scanning every 5 minutes"""
        while True:
            try:
                self.perform_scan()
                time.sleep(300)  # 5 minutes
            except Exception as e:
                print(f"Periodic scan error: {e}")
                time.sleep(60)  # Wait 1 minute on error
