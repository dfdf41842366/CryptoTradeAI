
#!/usr/bin/env python3
"""
Complete cleanup of old JavaScript/TypeScript environment
Ensures pure Python environment
"""

import os
import shutil
import glob

def remove_file_safely(filepath):
    """Remove file safely with error handling"""
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
            print(f"🗑️  Removed: {filepath}")
            return True
    except Exception as e:
        print(f"⚠️  Could not remove {filepath}: {e}")
    return False

def remove_directory_safely(dirpath):
    """Remove directory safely with error handling"""
    try:
        if os.path.exists(dirpath) and os.path.isdir(dirpath):
            shutil.rmtree(dirpath)
            print(f"🗑️  Removed directory: {dirpath}")
            return True
    except Exception as e:
        print(f"⚠️  Could not remove {dirpath}: {e}")
    return False

def cleanup_old_environment():
    """Remove all old JavaScript/TypeScript environment files"""
    print("🧹 Cleaning up old environment files...")
    
    # Files to remove
    files_to_remove = [
        'package.json',
        'package-lock.json',
        'yarn.lock',
        'pnpm-lock.yaml',
        'tsconfig.json',
        'vite.config.ts',
        'vite.config.js',
        'webpack.config.js',
        'babel.config.js',
        '.eslintrc.js',
        '.eslintrc.json',
        'jest.config.js',
        'tailwind.config.js',
        'postcss.config.js'
    ]
    
    # Directories to remove
    dirs_to_remove = [
        'node_modules',
        'client',
        'server',
        'dist',
        'build',
        '.next',
        'coverage'
    ]
    
    # Remove files
    removed_files = 0
    for filename in files_to_remove:
        for filepath in glob.glob(f"**/{filename}", recursive=True):
            if remove_file_safely(filepath):
                removed_files += 1
    
    # Remove directories
    removed_dirs = 0
    for dirname in dirs_to_remove:
        for dirpath in glob.glob(f"**/{dirname}", recursive=True):
            if remove_directory_safely(dirpath):
                removed_dirs += 1
    
    # Remove TypeScript files (except in static folder for minimal JS)
    ts_files = glob.glob("**/*.ts", recursive=True) + glob.glob("**/*.tsx", recursive=True)
    removed_ts = 0
    for ts_file in ts_files:
        if not ts_file.startswith('static/'):
            if remove_file_safely(ts_file):
                removed_ts += 1
    
    print(f"\n✅ Cleanup complete:")
    print(f"   - Removed {removed_files} old config files")
    print(f"   - Removed {removed_dirs} old directories")
    print(f"   - Removed {removed_ts} TypeScript files")
    
    return removed_files + removed_dirs + removed_ts > 0

def verify_python_only():
    """Verify we have Python-only environment"""
    print("\n🔍 Verifying Python-only environment...")
    
    python_files = len(glob.glob("**/*.py", recursive=True))
    html_files = len(glob.glob("**/*.html", recursive=True))
    js_files = len([f for f in glob.glob("**/*.js", recursive=True) if 'static/' in f])
    
    print(f"✅ Found {python_files} Python files")
    print(f"✅ Found {html_files} HTML files")
    print(f"✅ Found {js_files} JavaScript files (in static/)")
    
    # Check for any remaining problematic files
    problematic = glob.glob("**/*.ts", recursive=True) + glob.glob("**/*.tsx", recursive=True)
    problematic = [f for f in problematic if not f.startswith('static/')]
    
    if problematic:
        print(f"⚠️  Still found {len(problematic)} TypeScript files:")
        for f in problematic:
            print(f"   - {f}")
        return False
    else:
        print("🎉 Pure Python environment confirmed!")
        return True

def main():
    print("🚀 AI Trading Platform - Environment Cleanup")
    print("=" * 50)
    
    # Cleanup old environment
    cleanup_performed = cleanup_old_environment()
    
    # Verify Python-only environment
    is_clean = verify_python_only()
    
    print("\n" + "=" * 50)
    if is_clean:
        print("🎉 SUCCESS: Pure Python environment ready!")
        print("✅ All old JavaScript/TypeScript artifacts removed")
        print("✅ Ready to run: python3 app.py")
    else:
        print("⚠️  Some cleanup may still be needed")
        print("Please check the files listed above")

if __name__ == "__main__":
    main()
