
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import threading
import time
import yfinance as yf
import pandas as pd
import numpy as np
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from services.scanner_service import ScannerService
from services.ai_entity import AutonomousAI
from services.news_room import NewsRoomService
from services.market_data import MarketDataService
from services.openai_service import OpenAIService
from dotenv import load_dotenv
import json

load_dotenv()

app = Flask(__name__, static_folder='static')
CORS(app)

# Initialize services
scanner_service = ScannerService()
market_data_service = MarketDataService()
openai_service = OpenAIService()
news_room_service = NewsRoomService()
autonomous_ai = None

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('static', path)

@app.route('/api/health')
def health():
    return jsonify({"status": "healthy", "message": "AI Trading Platform Python Edition is running"})

@app.route('/api/scan', methods=['POST'])
def trigger_scan():
    try:
        results = scanner_service.perform_scan()
        return jsonify({"success": True, "data": results})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/signals')
def get_signals():
    try:
        signals = scanner_service.get_latest_signals()
        return jsonify({"success": True, "data": signals})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/market-data/<symbol>')
def get_market_data(symbol):
    try:
        data = market_data_service.get_stock_data(symbol.upper())
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/options/<symbol>')
def get_options_data(symbol):
    try:
        data = market_data_service.get_options_data(symbol.upper())
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/pre-market-scanner')
def pre_market_scanner():
    try:
        results = scanner_service.pre_market_scan()
        return jsonify({"success": True, "data": results})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/pre-market-scanner/<period>')
def pre_market_scanner_period(period):
    try:
        results = scanner_service.pre_market_scan(period=period)
        return jsonify({"success": True, "data": results})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/strategy-room')
def strategy_room():
    try:
        strategies = scanner_service.get_trading_strategies()
        return jsonify({"success": True, "data": strategies})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/strategy-room/<symbol>')
def analyze_symbol(symbol):
    try:
        analysis = scanner_service.analyze_symbol_strategy(symbol.upper())
        return jsonify({"success": True, "data": analysis})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/ai/predictions', methods=['POST'])
def ai_predictions():
    try:
        data = request.get_json()
        symbol = data.get('symbol')
        model = data.get('model', 'ensemble')
        time_horizon = data.get('timeHorizon', '1d')
        
        if not symbol:
            return jsonify({"error": "Symbol is required"}), 400
        
        # Get market data
        quote = market_data_service.get_stock_data(symbol)
        if not quote:
            return jsonify({"error": "Could not fetch market data"}), 500
        
        # Generate AI predictions
        predictions = openai_service.generate_predictions(symbol, quote, time_horizon)
        return jsonify(predictions)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/ai/swarm/<symbol>')
def ai_swarm_analysis(symbol):
    try:
        analysis = openai_service.get_swarm_analysis(symbol.upper())
        return jsonify({"success": True, "data": analysis})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/sentiment/<symbol>')
def sentiment_analysis(symbol):
    try:
        sentiment = openai_service.analyze_sentiment(symbol.upper())
        return jsonify({"success": True, "data": sentiment})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/ai/autonomous/status')
def autonomous_status():
    try:
        global autonomous_ai
        if autonomous_ai:
            return jsonify({
                "isRunning": autonomous_ai.is_running,
                "lastActivity": autonomous_ai.last_activity if hasattr(autonomous_ai, 'last_activity') else None,
                "systemsMonitored": 8,
                "autonomyLevel": 94.7,
                "performance": 91.3
            })
        else:
            return jsonify({"isRunning": False})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/ai/autonomous/start', methods=['POST'])
def start_autonomous():
    try:
        global autonomous_ai
        if not autonomous_ai or not autonomous_ai.is_running:
            autonomous_ai = AutonomousAI()
        return jsonify({"success": True, "message": "ARIA autonomous monitoring started"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/ai/autonomous/stop', methods=['POST'])
def stop_autonomous():
    try:
        global autonomous_ai
        if autonomous_ai:
            autonomous_ai.stop_monitoring()
        return jsonify({"success": True, "message": "ARIA autonomous monitoring stopped"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/news/room')
def news_room():
    try:
        news = news_room_service.get_latest_news()
        return jsonify({"success": True, "data": news})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/volume-leaders')
def volume_leaders():
    try:
        leaders = market_data_service.get_volume_leaders()
        return jsonify({"success": True, "data": leaders})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/top-movers')
def top_movers():
    try:
        movers = market_data_service.get_top_movers()
        return jsonify({"success": True, "data": movers})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/api-status')
def api_status():
    try:
        status = {
            "openai": bool(os.getenv('OPENAI_API_KEY')),
            "finnhub": bool(os.getenv('FINNHUB_API_KEY')),
            "alpha_vantage": bool(os.getenv('ALPHA_VANTAGE_API_KEY')),
            "twelve_data": bool(os.getenv('TWELVE_DATA_API_KEY')),
            "anthropic": bool(os.getenv('ANTHROPIC_API_KEY')),
            "gemini": bool(os.getenv('GEMINI_API_KEY'))
        }
        return jsonify({"success": True, "data": status})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

def start_background_services():
    """Start autonomous services in background threads"""
    def run_scanner():
        print('🔍 Starting scanner service for periodic market scanning...')
        scanner_service.start_periodic_scanning()
    
    def run_ai_entity():
        print('🚀 Starting ARIA autonomous AI entity for 24/7 operation...')
        global autonomous_ai
        autonomous_ai = AutonomousAI()
    
    def run_news_room():
        print('📰 Starting News Room for real-time catalyst monitoring...')
        news_room_service.start_monitoring()
    
    # Start services in separate threads
    threading.Thread(target=run_scanner, daemon=True).start()
    threading.Thread(target=run_ai_entity, daemon=True).start()
    threading.Thread(target=run_news_room, daemon=True).start()

if __name__ == '__main__':
    # Start background services
    start_background_services()
    
    # Start Flask app
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 AI Trading Platform Python Edition starting on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
