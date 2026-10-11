import uvicorn
import sys
import os

# Add parent directory to sys.path so 'app' can be resolved
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("Starting VoyageFlow FastAPI Server on http://127.0.0.1:8000 ...")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
