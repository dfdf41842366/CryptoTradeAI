
#!/usr/bin/env python3
"""
Python Environment Verification Script
Ensures complete transformation to Python-only environment
"""

import os
import sys
import importlib
import subprocess

def check_python_version():
    """Check Python version"""
    print(f"🐍 Python version: {sys.version}")
    if sys.version_info < (3, 8):
        print("⚠️  Warning: Python 3.8+ recommended")
    else:
        print("✅ Python version is compatible")

def check_required_packages():
    """Check if all required Python packages are available"""
    required_packages = [
        'flask', 'flask_cors', 'requests', 'pandas', 'numpy', 
        'yfinance', 'dotenv', 'feedparser', 'openai', 'plotly', 'streamlit'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            importlib.import_module(package)
            print(f"✅ {package}: installed")
        except ImportError:
            missing_packages.append(package)
            print(f"❌ {package}: missing")
    
    return missing_packages

def check_old_environment_files():
    """Check for old Node.js/TypeScript files"""
    old_files = [
        'package.json', 'package-lock.json', 'tsconfig.json', 
        'vite.config.ts', 'yarn.lock', 'pnpm-lock.yaml'
    ]
    
    found_old_files = []
    
    for root, dirs, files in os.walk('.'):
        # Skip node_modules and .git directories
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', '__pycache__']]
        
        for file in files:
            if file in old_files:
                found_old_files.append(os.path.join(root, file))
    
    if found_old_files:
        print("⚠️  Found old environment files:")
        for file in found_old_files:
            print(f"   - {file}")
    else:
        print("✅ No old environment files found")
    
    return found_old_files

def check_python_services():
    """Check Python services"""
    services_dir = 'services'
    if os.path.exists(services_dir):
        services = [f for f in os.listdir(services_dir) if f.endswith('.py')]
        print(f"✅ Found {len(services)} Python services:")
        for service in services:
            print(f"   - {service}")
    else:
        print("❌ Services directory not found")

def main():
    print("🔍 Python Environment Verification")
    print("=" * 50)
    
    # Check Python version
    check_python_version()
    print()
    
    # Check required packages
    print("📦 Checking Python packages...")
    missing = check_required_packages()
    print()
    
    # Check for old files
    print("🧹 Checking for old environment files...")
    old_files = check_old_environment_files()
    print()
    
    # Check Python services
    print("🔧 Checking Python services...")
    check_python_services()
    print()
    
    # Summary
    print("📊 SUMMARY")
    print("=" * 50)
    
    if not missing and not old_files:
        print("🎉 SUCCESS: Complete Python environment!")
        print("✅ All dependencies installed")
        print("✅ No old environment artifacts")
        print("✅ Ready to run: python3 app.py")
    else:
        print("⚠️  Issues found:")
        if missing:
            print(f"   - {len(missing)} missing packages")
            print("   - Run: pip install -r requirements.txt")
        if old_files:
            print(f"   - {len(old_files)} old environment files")
            print("   - Consider removing them")

if __name__ == "__main__":
    main()
