from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import math
import os
import random
from typing import Optional

app = FastAPI(title="FinanceAI ML API", version="1.0.0")

# Mock model for demonstration (since scikit-learn compilation fails on Render)
class MockModel:
    def __init__(self):
        self.threshold = 0.85
    
    def predict_proba(self, features):
        # Simulate LightGBM predictions based on transaction patterns
        amount = features[0][0]  # log1p(abs(amount))
        hour = features[0][1]    # hour of day
        merchant_freq = features[0][2]
        category_freq = features[0][3]
        
        # Simple risk scoring logic
        risk_score = 0.0
        
        # High amount transactions are riskier
        if amount > 8.0:  # log(3000) ≈ 8.0
            risk_score += 0.3
        
        # Late night transactions are riskier
        if hour < 6 or hour > 22:
            risk_score += 0.2
        
        # Infrequent merchants are riskier
        if merchant_freq == 1:
            risk_score += 0.2
        
        # Add some randomness for demo
        risk_score += random.uniform(0, 0.1)
        
        # Ensure score is between 0 and 1
        risk_score = min(1.0, max(0.0, risk_score))
        
        return [[1 - risk_score, risk_score]]

# Initialize mock model
MODEL = MockModel()
print("✅ Mock ML model initialized successfully")

class Tx(BaseModel):
    amount: float
    step: int
    merchant_freq: int
    category_freq: int
    merchant_code: int
    category_code: int

@app.get("/")
def read_root():
    return {"message": "FinanceAI ML API", "status": "healthy", "model_loaded": True}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": True,
        "model_type": "mock_lightgbm_simulator"
    }

@app.post("/score")
def score(tx: Tx):
    try:
        feat = [
            math.log1p(abs(tx.amount)),
            tx.step % 24,
            tx.merchant_freq,
            tx.category_freq,
            tx.merchant_code,
            tx.category_code,
        ]
        
        # Get prediction from mock model
        prob = float(MODEL.predict_proba([feat])[0][1])
        
        return {"prob": prob, "features": feat}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)