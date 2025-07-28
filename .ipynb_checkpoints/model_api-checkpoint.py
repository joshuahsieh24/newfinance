from fastapi import FastAPI
from pydantic import BaseModel
import joblib, math

app = FastAPI()
MODEL = joblib.load("apps/web/public/model/financeai_lgbm.pkl")

class Tx(BaseModel):
    amount: float
    step: int
    merchant_freq: int
    category_freq: int
    merchant_code: int
    category_code: int

@app.post("/score")
def score(tx: Tx):
    feat = [
        math.log1p(abs(tx.amount)),
        tx.step % 24,
        tx.merchant_freq,
        tx.category_freq,
        tx.merchant_code,
        tx.category_code,
    ]
    prob = float(MODEL.predict_proba([feat])[0][1])
    return {"prob": prob} 