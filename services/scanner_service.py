
import requests
import pandas as pd
import numpy as np
import time
import os
import yfinance as yf
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from .market_data import MarketDataService
from .openai_service import OpenAIService

class ScannerService:
    def __init__(self):
        self.market_data_service = MarketDataService()
        self.openai_service = OpenAIService()
        self.is_scanning = False
        self.scan_interval = 300  # 5 minutes
        
    def start_periodic_scanning(self):
        """Start periodic market scanning"""
        def scan_loop():
            while True:
                try:
                    if not self.is_scanning:
                        self.is_scanning = True
                        print(f"🔍 Performing periodic market scan at {datetime.now()}")
                        self.perform_scan()
                        self.is_scanning = False
                    time.sleep(self.scan_interval)
                except Exception as e:
                    print(f"Scanner error: {e}")
                    self.is_scanning = False
                    time.sleep(60)
        
        scan_thread = threading.Thread(target=scan_loop, daemon=True)
        scan_thread.start()
    
    def perform_scan(self) -> List[Dict]:
        """Perform comprehensive market scan"""
        try:
            print("🔍 Starting comprehensive market scan...")
            
            # Popular trading symbols
            symbols = [
                'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX',
                'AMD', 'ADBE', 'CRM', 'ORCL', 'INTC', 'CSCO', 'IBM', 'HPQ',
                'SPY', 'QQQ', 'IWM', 'VTI', 'VOO', 'ARKK', 'SOXL', 'TQQQ',
                'PLTR', 'BB', 'GME', 'AMC', 'BBBY', 'ATER', 'MULN', 'SNDL'
            ]
            
            scan_results = []
            
            for symbol in symbols:
                try:
                    data = self.market_data_service.get_stock_data(symbol)
                    if data:
                        # Calculate technical indicators
                        analysis = self._analyze_technical_patterns(symbol, data)
                        if analysis and analysis.get('signal_strength', 0) > 60:
                            scan_results.append({
                                **data,
                                'analysis': analysis,
                                'scan_time': datetime.now().isoformat()
                            })
                    time.sleep(0.1)  # Rate limiting
                except Exception as e:
                    print(f"Error scanning {symbol}: {e}")
                    continue
            
            # Sort by signal strength
            scan_results.sort(key=lambda x: x.get('analysis', {}).get('signal_strength', 0), reverse=True)
            
            print(f"✅ Scan complete. Found {len(scan_results)} signals")
            return scan_results[:20]  # Return top 20
            
        except Exception as e:
            print(f"Scan error: {e}")
            return []
    
    def pre_market_scan(self, period: str = 'today') -> List[Dict]:
        """Enhanced pre-market scanner with trade analysis"""
        try:
            print(f"🌅 Starting pre-market scan for {period}...")
            
            # Extended symbol list for pre-market scanning
            symbols = [
                # Large caps
                'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'ADBE',
                # Mid caps with potential
                'PLTR', 'RBLX', 'SNOW', 'CRWD', 'ZM', 'PTON', 'SQ', 'PYPL', 'SHOP', 'ROKU',
                # Small caps and momentum plays
                'ATER', 'MULN', 'SNDL', 'BB', 'WISH', 'CLOV', 'SOFI', 'LCID', 'RIVN', 'F',
                # ETFs
                'SPY', 'QQQ', 'IWM', 'ARKK', 'SOXL', 'TQQQ', 'SQQQ', 'SPXU'
            ]
            
            results = []
            
            for symbol in symbols:
                try:
                    # Get stock data
                    stock_data = self.market_data_service.get_stock_data(symbol)
                    if not stock_data:
                        continue
                    
                    # Apply pre-market criteria
                    change_percent = abs(stock_data.get('change_percent', 0))
                    price = stock_data.get('price', 0)
                    volume = stock_data.get('volume', 0)
                    avg_volume = stock_data.get('avg_volume', 1)
                    
                    # Pre-market filters
                    if (change_percent >= 2.0 and  # Min 2% movement
                        1 <= price <= 20 and      # Price range $1-20
                        volume > avg_volume * 1.5): # Volume > 1.5x avg
                        
                        # Get additional data for analysis
                        market_cap = stock_data.get('market_cap', 0)
                        float_shares = self._estimate_float(symbol, market_cap, price)
                        
                        # Generate comprehensive trade analysis
                        trade_analysis = self._generate_trade_analysis(stock_data, float_shares)
                        
                        result = {
                            **stock_data,
                            'float_shares': float_shares,
                            'volume_ratio': volume / max(avg_volume, 1),
                            'momentum_score': self._calculate_momentum_score(stock_data),
                            'trade_analysis': trade_analysis,
                            'scan_period': period,
                            'scan_time': datetime.now().isoformat()
                        }
                        
                        results.append(result)
                    
                    time.sleep(0.1)  # Rate limiting
                    
                except Exception as e:
                    print(f"Error in pre-market scan for {symbol}: {e}")
                    continue
            
            # Sort by Volume Impact Score (combination of change% and volume ratio)
            results.sort(key=lambda x: x.get('momentum_score', 0), reverse=True)
            
            print(f"✅ Pre-market scan complete. Found {len(results)} opportunities")
            return results[:15]  # Return top 15
            
        except Exception as e:
            print(f"Pre-market scan error: {e}")
            return []
    
    def _generate_trade_analysis(self, stock_data: dict, float_shares: float) -> dict:
        """Generate comprehensive trade analysis"""
        try:
            symbol = stock_data.get('symbol', '')
            price = stock_data.get('price', 0)
            change_percent = stock_data.get('change_percent', 0)
            volume = stock_data.get('volume', 0)
            avg_volume = stock_data.get('avg_volume', 1)
            volume_ratio = volume / max(avg_volume, 1)
            
            # Determine strategy based on characteristics
            strategy = self._classify_strategy(float_shares, volume_ratio, abs(change_percent))
            
            # Calculate entry and targets
            entry_price = price
            momentum_direction = 1 if change_percent > 0 else -1
            
            # Set profit targets (5%, 12%, 25%)
            target_1 = round(entry_price * (1 + momentum_direction * 0.05), 2)
            target_2 = round(entry_price * (1 + momentum_direction * 0.12), 2)
            target_3 = round(entry_price * (1 + momentum_direction * 0.25), 2)
            
            # Set stop loss (8% opposite direction)
            stop_loss = round(entry_price * (1 - momentum_direction * 0.08), 2)
            
            # Calculate risk-reward ratios
            risk = abs(entry_price - stop_loss)
            reward_1 = abs(target_1 - entry_price)
            reward_2 = abs(target_2 - entry_price)
            reward_3 = abs(target_3 - entry_price)
            
            risk_reward_1 = round(reward_1 / max(risk, 0.01), 2)
            risk_reward_2 = round(reward_2 / max(risk, 0.01), 2)
            risk_reward_3 = round(reward_3 / max(risk, 0.01), 2)
            
            # Determine position size and risk level
            risk_level, position_size = self._assess_risk_and_position(strategy, float_shares, volume_ratio)
            
            # Estimate holding period
            holding_period = self._estimate_holding_period(strategy, volume_ratio)
            
            # Generate reasoning
            reasoning = f"{strategy} setup on {symbol} with {abs(change_percent):.1f}% move and {volume_ratio:.1f}x volume. Float: {float_shares/1000000:.1f}M shares."
            
            # Determine confidence level
            confidence = self._calculate_confidence(strategy, volume_ratio, abs(change_percent))
            
            return {
                'strategy': strategy,
                'entry_price': entry_price,
                'targets': [
                    {'level': 1, 'price': target_1, 'probability': '75%', 'risk_reward': risk_reward_1},
                    {'level': 2, 'price': target_2, 'probability': '45%', 'risk_reward': risk_reward_2},
                    {'level': 3, 'price': target_3, 'probability': '20%', 'risk_reward': risk_reward_3}
                ],
                'stop_loss': stop_loss,
                'risk_level': risk_level,
                'position_size': position_size,
                'holding_period': holding_period,
                'reasoning': reasoning,
                'confidence': confidence
            }
            
        except Exception as e:
            print(f"Error generating trade analysis: {e}")
            return {}
    
    def _classify_strategy(self, float_shares: float, volume_ratio: float, change_percent: float) -> str:
        """Classify trading strategy based on stock characteristics"""
        if float_shares < 5000000:  # Less than 5M shares
            return 'LOW_FLOAT_SQUEEZE'
        elif volume_ratio > 3:  # 3x+ volume
            return 'VOLUME_BREAKOUT'
        elif change_percent > 10:  # 10%+ move
            return 'GAP_TRADE'
        else:
            return 'MOMENTUM_SCALP'
    
    def _assess_risk_and_position(self, strategy: str, float_shares: float, volume_ratio: float) -> tuple:
        """Assess risk level and recommend position size"""
        if strategy == 'LOW_FLOAT_SQUEEZE':
            return 'HIGH', '1-2%'
        elif strategy == 'VOLUME_BREAKOUT' and volume_ratio > 5:
            return 'HIGH', '2-3%'
        elif strategy == 'GAP_TRADE':
            return 'MEDIUM', '3-4%'
        else:
            return 'MEDIUM', '4-5%'
    
    def _estimate_holding_period(self, strategy: str, volume_ratio: float) -> str:
        """Estimate optimal holding period"""
        if strategy == 'LOW_FLOAT_SQUEEZE':
            return '1-4 hours'
        elif strategy == 'VOLUME_BREAKOUT':
            return '15 minutes - 2 hours'
        elif strategy == 'GAP_TRADE':
            return '30 minutes - 6 hours'
        else:
            return '2-24 hours'
    
    def _calculate_confidence(self, strategy: str, volume_ratio: float, change_percent: float) -> str:
        """Calculate confidence level"""
        confidence_score = 0
        
        if strategy == 'LOW_FLOAT_SQUEEZE':
            confidence_score += 30
        if volume_ratio > 3:
            confidence_score += 25
        if change_percent > 5:
            confidence_score += 20
        if volume_ratio > 5:
            confidence_score += 15
        if change_percent > 10:
            confidence_score += 10
        
        if confidence_score >= 70:
            return 'HIGH'
        elif confidence_score >= 50:
            return 'MEDIUM'
        else:
            return 'LOW'
    
    def _estimate_float(self, symbol: str, market_cap: float, price: float) -> float:
        """Estimate float shares (simplified calculation)"""
        if market_cap > 0 and price > 0:
            total_shares = market_cap / price
            # Assume float is 70-90% of total shares
            return total_shares * 0.8
        else:
            # Default estimates for common ranges
            if price < 5:
                return 50000000  # 50M shares
            elif price < 15:
                return 20000000  # 20M shares
            else:
                return 100000000  # 100M shares
    
    def _calculate_momentum_score(self, stock_data: dict) -> float:
        """Calculate momentum score for ranking"""
        change_percent = abs(stock_data.get('change_percent', 0))
        volume = stock_data.get('volume', 0)
        avg_volume = stock_data.get('avg_volume', 1)
        volume_ratio = volume / max(avg_volume, 1)
        
        # Volume Impact Score = Change% * Volume Ratio
        return change_percent * volume_ratio
    
    def get_latest_signals(self) -> List[Dict]:
        """Get latest trading signals"""
        try:
            # For now, return recent scan results
            return self.perform_scan()
        except Exception as e:
            print(f"Error getting signals: {e}")
            return []
    
    def get_trading_strategies(self) -> List[Dict]:
        """Get trading strategies from recent scans"""
        try:
            signals = self.get_latest_signals()
            strategies = []
            
            for signal in signals:
                if signal.get('analysis'):
                    strategies.append({
                        'symbol': signal.get('symbol'),
                        'strategy': signal.get('analysis', {}).get('strategy', 'Unknown'),
                        'signal_strength': signal.get('analysis', {}).get('signal_strength', 0),
                        'entry_price': signal.get('price'),
                        'target_price': signal.get('analysis', {}).get('target_price'),
                        'stop_loss': signal.get('analysis', {}).get('stop_loss'),
                        'confidence': signal.get('analysis', {}).get('confidence', 'MEDIUM'),
                        'reasoning': signal.get('analysis', {}).get('reasoning', '')
                    })
            
            return strategies
        except Exception as e:
            print(f"Error getting strategies: {e}")
            return []
    
    def analyze_symbol_strategy(self, symbol: str) -> Dict:
        """Analyze specific symbol for strategy room"""
        try:
            print(f"🎯 Analyzing {symbol} for strategy room...")
            
            # Get market data
            stock_data = self.market_data_service.get_stock_data(symbol)
            if not stock_data:
                return {"error": f"Could not fetch data for {symbol}"}
            
            # Get options data if available
            options_data = self.market_data_service.get_options_data(symbol)
            
            if options_data:
                # Use authentic options flow analysis
                analysis = {
                    'symbol': symbol,
                    'analysis_type': 'options_flow',
                    'data_source': 'authentic',
                    **stock_data,
                    'options_flow': options_data,
                    'analysis_time': datetime.now().isoformat()
                }
            else:
                # Fall back to AI multi-brain analysis
                ai_analysis = self.openai_service.get_multi_brain_analysis(symbol, stock_data)
                analysis = {
                    'symbol': symbol,
                    'analysis_type': 'multi_brain_ai',
                    'data_source': 'claude_ai',
                    **stock_data,
                    'ai_analysis': ai_analysis,
                    'analysis_time': datetime.now().isoformat()
                }
            
            return analysis
            
        except Exception as e:
            print(f"Error analyzing {symbol}: {e}")
            return {"error": str(e)}
    
    def _analyze_technical_patterns(self, symbol: str, data: dict) -> Optional[Dict]:
        """Analyze technical patterns and generate signals"""
        try:
            # Get historical data for technical analysis
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period='5d', interval='1h')
            
            if hist.empty:
                return None
            
            # Calculate basic technical indicators
            closes = hist['Close'].values
            volumes = hist['Volume'].values
            
            if len(closes) < 10:
                return None
            
            # Simple moving averages
            sma_5 = np.mean(closes[-5:])
            sma_10 = np.mean(closes[-10:])
            
            # Volume analysis
            avg_volume = np.mean(volumes[-10:])
            current_volume = data.get('volume', 0)
            volume_ratio = current_volume / max(avg_volume, 1)
            
            # Price momentum
            price_change = data.get('change_percent', 0)
            
            # Generate signal
            signal_strength = 0
            strategy = 'HOLD'
            
            # Bullish signals
            if closes[-1] > sma_5 > sma_10 and price_change > 2:
                signal_strength += 30
                strategy = 'BUY'
            
            if volume_ratio > 2:
                signal_strength += 25
            
            if abs(price_change) > 5:
                signal_strength += 20
            
            # Bearish signals  
            if closes[-1] < sma_5 < sma_10 and price_change < -2:
                signal_strength += 30
                strategy = 'SELL'
            
            # Calculate targets and stops
            current_price = data.get('price', 0)
            if strategy == 'BUY':
                target_price = round(current_price * 1.08, 2)
                stop_loss = round(current_price * 0.95, 2)
            elif strategy == 'SELL':
                target_price = round(current_price * 0.92, 2)
                stop_loss = round(current_price * 1.05, 2)
            else:
                target_price = current_price
                stop_loss = current_price
            
            return {
                'strategy': strategy,
                'signal_strength': signal_strength,
                'target_price': target_price,
                'stop_loss': stop_loss,
                'volume_ratio': round(volume_ratio, 2),
                'sma_5': round(sma_5, 2),
                'sma_10': round(sma_10, 2),
                'confidence': 'HIGH' if signal_strength > 70 else 'MEDIUM' if signal_strength > 50 else 'LOW',
                'reasoning': f"{strategy} signal with {signal_strength}% strength based on price momentum and volume"
            }
            
        except Exception as e:
            print(f"Technical analysis error for {symbol}: {e}")
            return None
