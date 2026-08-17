"""
🚀 OrbitTrace Nexus - Master Launcher
Autonomous Cyber-Physical Digital Twin for Secure Satellite Constellations
"""

import os
import sys
import subprocess
import time

def main():
    print("==================================================================")
    print("       🚀 ORBITTRACE NEXUS - SPACE SECURITY OPERATIONS CENTER     ")
    print("   Autonomous Cyber-Physical Digital Twin for Satellite Fleets   ")
    print("==================================================================")
    
    backend_dir = os.path.join(os.path.dirname(__file__), "backend")
    frontend_dir = os.path.join(os.path.dirname(__file__), "frontend")
    
    python_exe = r"C:\Users\Rajviba Chudasama\python311\python.exe"
    if not os.path.exists(python_exe):
        python_exe = "python"
        
    print(f"[*] Backend Directory: {backend_dir}")
    print(f"[*] Frontend Directory: {frontend_dir}")
    print(f"[*] Launching FastAPI Backend on http://localhost:8000 ...")
    
    # Run backend
    os.chdir(backend_dir)
    subprocess.run([python_exe, "run.py"])

if __name__ == "__main__":
    main()
