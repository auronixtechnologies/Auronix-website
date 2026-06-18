"""
Convenience script to run the FastAPI application.
Run with: python main.py
"""

import subprocess
import sys

if __name__ == "__main__":
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn",
            "app.main:app",
            "--reload",
            "--host", "127.0.0.1",
            "--port", "8000"
        ])
    except KeyboardInterrupt:
        pass  # Ctrl+C is expected — server already shut down cleanly
