
#!/usr/bin/env python3
"""
Alternative Python-only dashboard using Streamlit
Run with: streamlit run python_dashboard.py
"""

import streamlit as st
import requests
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime, timedelta
import json
import time

# Page config
st.set_page_config(
    page_title="AI Trading Platform - Python Edition",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main-header {
        font-size: 3rem;
        font-weight: bold;
        text-align: center;
        color: #1f77b4;
        margin-bottom: 2rem;
    }
    .metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 1rem;
        border-radius: 10px;
        color: white;
        text-align: center;
    }
    .status-indicator {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        display: inline-block;
        margin-right: 5px;
    }
    .status-online {
        background-color: #28a745;
        animation: pulse 2s infinite;
    }
    .status-offline {
        background-color: #dc3545;
    }
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }
</style>
""", unsafe_allow_html=True)

# Sidebar navigation
st.sidebar.title("🤖 AI Trading Platform")
st.sidebar.markdown("### Navigation")

page = st.sidebar.selectbox(
    "Choose a page:",
    ["Dashboard", "Market Scanner", "AI Analysis", "ARIA Autonomous", "API Status"]
)

# Helper functions
def check_api_health():
    try:
        response = requests.get("http://localhost:5000/api/health", timeout=5)
        return response.status_code == 200
    except:
        return False

def get_signals():
    try:
        response = requests.get("http://localhost:5000/api/signals", timeout=10)
        if response.status_code == 200:
            return response.json().get('data', [])
    except:
        pass
    return []

def run_scan():
    try:
        response = requests.post("http://localhost:5000/api/scan", timeout=30)
        if response.status_code == 200:
            return response.json().get('data', [])
    except:
        pass
    return []

def get_aria_status():
    try:
        response = requests.get("http://localhost:5000/api/ai/autonomous/status", timeout=10)
        if response.status_code == 200:
            return response.json()
    except:
        pass
    return {"isRunning": False, "autonomyLevel": 0, "performance": 0}

# Main content
if page == "Dashboard":
    st.markdown('<h1 class="main-header">📊 Trading Dashboard</h1>', unsafe_allow_html=True)
    
    # System status
    col1, col2, col3 = st.columns(3)
    
    with col1:
        api_health = check_api_health()
        status_class = "status-online" if api_health else "status-offline"
        status_text = "Online" if api_health else "Offline"
        st.markdown(f'<div class="metric-card"><h3>System Status</h3><p><span class="status-indicator {status_class}"></span>{status_text}</p></div>', unsafe_allow_html=True)
    
    with col2:
        signals = get_signals()
        st.markdown(f'<div class="metric-card"><h3>Active Signals</h3><p>{len(signals)} signals</p></div>', unsafe_allow_html=True)
    
    with col3:
        aria_status = get_aria_status()
        autonomy_level = aria_status.get('autonomyLevel', 0)
        st.markdown(f'<div class="metric-card"><h3>ARIA Status</h3><p>{autonomy_level}% Autonomous</p></div>', unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Recent signals
    st.subheader("📈 Recent Trading Signals")
    if signals:
        df = pd.DataFrame(signals)
        st.dataframe(df, use_container_width=True)
    else:
        st.info("No signals available. The backend may be starting up.")

elif page == "Market Scanner":
    st.markdown('<h1 class="main-header">🔍 Market Scanner</h1>', unsafe_allow_html=True)
    
    col1, col2 = st.columns([3, 1])
    
    with col2:
        if st.button("🚀 Run Scan", type="primary"):
            with st.spinner("Scanning markets..."):
                scan_results = run_scan()
                st.session_state.scan_results = scan_results
    
    # Display scan results
    if hasattr(st.session_state, 'scan_results') and st.session_state.scan_results:
        st.subheader("Scan Results")
        df = pd.DataFrame(st.session_state.scan_results)
        st.dataframe(df, use_container_width=True)
        
        # Create a simple chart
        if len(df) > 0 and 'symbol' in df.columns and 'price' in df.columns:
            fig = px.bar(df.head(10), x='symbol', y='price', title="Top 10 Symbols by Price")
            st.plotly_chart(fig, use_container_width=True)
    else:
        st.info("Click 'Run Scan' to analyze the market")

elif page == "AI Analysis":
    st.markdown('<h1 class="main-header">🧠 AI Analysis</h1>', unsafe_allow_html=True)
    
    col1, col2 = st.columns(2)
    
    with col1:
        symbol = st.text_input("Enter Symbol", placeholder="AAPL").upper()
    
    with col2:
        time_horizon = st.selectbox("Time Horizon", ["1d", "1w", "1m"])
    
    if st.button("🔬 Analyze", type="primary") and symbol:
        with st.spinner(f"Analyzing {symbol}..."):
            try:
                response = requests.post("http://localhost:5000/api/ai/predictions", 
                                       json={"symbol": symbol, "timeHorizon": time_horizon},
                                       timeout=60)
                if response.status_code == 200:
                    analysis = response.json()
                    st.subheader(f"Analysis Results for {symbol}")
                    st.json(analysis)
                else:
                    st.error("Analysis failed. Please check if the backend is running.")
            except Exception as e:
                st.error(f"Error: {str(e)}")

elif page == "ARIA Autonomous":
    st.markdown('<h1 class="main-header">🤖 ARIA Autonomous AI</h1>', unsafe_allow_html=True)
    
    aria_status = get_aria_status()
    
    col1, col2 = st.columns(2)
    
    with col1:
        if st.button("▶️ Start ARIA", type="primary", disabled=aria_status.get('isRunning', False)):
            try:
                response = requests.post("http://localhost:5000/api/ai/autonomous/start", timeout=10)
                if response.status_code == 200:
                    st.success("ARIA started successfully!")
                    st.rerun()
            except:
                st.error("Failed to start ARIA")
    
    with col2:
        if st.button("⏹️ Stop ARIA", type="secondary", disabled=not aria_status.get('isRunning', False)):
            try:
                response = requests.post("http://localhost:5000/api/ai/autonomous/stop", timeout=10)
                if response.status_code == 200:
                    st.success("ARIA stopped successfully!")
                    st.rerun()
            except:
                st.error("Failed to stop ARIA")
    
    st.markdown("---")
    
    # ARIA Status Display
    col1, col2, col3 = st.columns(3)
    
    with col1:
        status = "🟢 Running" if aria_status.get('isRunning', False) else "🔴 Stopped"
        st.metric("Status", status)
    
    with col2:
        st.metric("Autonomy Level", f"{aria_status.get('autonomyLevel', 0)}%")
    
    with col3:
        st.metric("Performance", f"{aria_status.get('performance', 0)}%")

elif page == "API Status":
    st.markdown('<h1 class="main-header">🔧 API Status</h1>', unsafe_allow_html=True)
    
    try:
        response = requests.get("http://localhost:5000/api/api-status", timeout=10)
        if response.status_code == 200:
            api_status = response.json().get('data', {})
            
            st.subheader("API Key Status")
            
            for api_name, status in api_status.items():
                status_icon = "✅" if status else "❌"
                status_text = "Configured" if status else "Missing"
                st.write(f"{status_icon} **{api_name.upper()}**: {status_text}")
            
            # Summary
            configured_count = sum(api_status.values())
            total_count = len(api_status)
            
            st.markdown("---")
            st.subheader("Summary")
            st.write(f"**{configured_count}/{total_count}** APIs configured")
            
            if configured_count < total_count:
                st.warning("Some API keys are missing. Please check your .env file or Replit Secrets.")
            else:
                st.success("All API keys are configured!")
        else:
            st.error("Could not fetch API status")
    except Exception as e:
        st.error(f"Error connecting to backend: {str(e)}")
        st.info("Make sure the Flask app is running with: python3 app.py")

# Footer
st.markdown("---")
st.markdown("### 🚀 AI Trading Platform - Pure Python Edition")
st.markdown("Built with Flask + Streamlit | Powered by Python 🐍")

# Auto-refresh every 30 seconds for dashboard
if page == "Dashboard":
    time.sleep(0.1)  # Small delay to prevent rapid refreshes
    if st.button("🔄 Auto-refresh"):
        st.rerun()
