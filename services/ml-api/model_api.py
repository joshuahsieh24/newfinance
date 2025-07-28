from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import math
import os
from typing import Optional

app = FastAPI(title="FinanceAI ML API", version="1.0.0")

# Load model with error handling
try:
    model_path = os.getenv("MODEL_PATH", "financeai_lgbm.pkl")
    MODEL = joblib.load(model_path)
    print(f"✅ Model loaded successfully from {model_path}")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    MODEL = None

class Tx(BaseModel):
    amount: float
    step: int
    merchant_freq: int
    category_freq: int
    merchant_code: int
    category_code: int

@app.get("/")
def read_root():
    return {"message": "FinanceAI ML API", "status": "healthy", "model_loaded": MODEL is not None}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": MODEL is not None,
        "model_path": os.getenv("MODEL_PATH", "financeai_lgbm.pkl")
    }

@app.post("/score")
def score(tx: Tx):
    if MODEL is None:
        raise HTTPException(status_code=500, detail="ML model not loaded")
    
    try:
        feat = [
            math.log1p(abs(tx.amount)),
            tx.step % 24,
            tx.merchant_freq,
            tx.category_freq,
            tx.merchant_code,
            tx.category_code,
        ]
        prob = float(MODEL.predict_proba([feat])[0][1])
        return {"prob": prob, "features": feat}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)