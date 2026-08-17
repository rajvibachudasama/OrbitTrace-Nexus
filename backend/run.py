import uvicorn
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

if __name__ == "__main__":
    print("[*] Starting OrbitTrace Nexus Space Defense Backend on port 8000...")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False, log_level="info")
