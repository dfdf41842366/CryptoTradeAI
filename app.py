
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import threading
import time
from services.scanner_service import ScannerService
from services.ai_entity import AutonomousAI
from services.news_room import NewsRoomService
from services.market_data import MarketDataService
from services.openai_service import OpenAIService
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='static')
CORS(app)

# Initialize services
scanner_service = ScannerService()
market_data_service = MarketDataService()
openai_service = OpenAIService()

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('static', path)

@app.route('/api/health')
def health():
    return jsonify({"status": "healthy", "message": "AI Trading Platform is running"})

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

@app.route('/api/strategy-room')
def strategy_room():
    try:
        strategies = scanner_service.get_trading_strategies()
        return jsonify({"success": True, "data": strategies})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

def start_background_services():
    """Start autonomous services in background threads"""
    def run_scanner():
        print('🔍 Starting scanner service for periodic market scanning...')
        scanner_service.start_periodic_scanning()
    
    def run_ai_entity():
        print('🚀 Starting ARIA autonomous AI entity for 24/7 operation...')
        autonomous_ai = AutonomousAI()
    
    def run_news_room():
        print('📰 Starting News Room for real-time catalyst monitoring...')
        news_room = NewsRoomService()
    
    # Start services in separate threads
    threading.Thread(target=run_scanner, daemon=True).start()
    threading.Thread(target=run_ai_entity, daemon=True).start()
    threading.Thread(target=run_news_room, daemon=True).start()

if __name__ == '__main__':
    # Start background services
    start_background_services()
    
    # Start Flask app
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('NODE_ENV') == 'development')
