
import openai
import os
from typing import Dict, Optional

class OpenAIService:
    def __init__(self):
        self.client = openai.OpenAI(
            api_key=os.getenv('OPENAI_API_KEY')
        )
    
    def analyze_stock(self, symbol: str, stock_data: Dict) -> str:
        """Analyze stock using GPT-4"""
        try:
            prompt = f"""
            Analyze this stock data for {symbol}:
            Price: ${stock_data.get('price', 0):.2f}
            Change: {stock_data.get('change_percent', 0):.2f}%
            Volume: {stock_data.get('volume', 0):,}
            Average Volume: {stock_data.get('avg_volume', 0):,}
            
            Provide a brief trading analysis including:
            1. Technical outlook
            2. Volume analysis
            3. Recommended action (BUY/SELL/HOLD)
            4. Risk level
            
            Keep response under 150 words.
            """
            
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=200,
                temperature=0.3
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"OpenAI analysis error for {symbol}: {e}")
            return f"Technical analysis unavailable. Price: ${stock_data.get('price', 0):.2f}, Change: {stock_data.get('change_percent', 0):.2f}%"
    
    def generate_signal(self, market_data: Dict) -> Optional[Dict]:
        """Generate trading signal using AI"""
        try:
            prompt = f"""
            Based on this market data, generate a trading signal:
            {market_data}
            
            Return analysis focusing on:
            1. Entry price
            2. Target price
            3. Stop loss
            4. Confidence level (1-100)
            5. Time horizon
            """
            
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=300,
                temperature=0.3
            )
            
            analysis = response.choices[0].message.content.strip()
            
            return {
                'ai_signal': analysis,
                'model': 'gpt-4',
                'timestamp': market_data.get('timestamp')
            }
            
        except Exception as e:
            print(f"Signal generation error: {e}")
            return None
