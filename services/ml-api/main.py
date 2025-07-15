from fastapi import FastAPI, Body
import joblib, numpy as np
model = joblib.load("iso_forest.pkl")  # train later

app = FastAPI()

@app.post("/predict")
async def predict(amounts: list[float] = Body(...)):
    preds = model.predict(np.array(amounts).reshape(-1, 1)).tolist()
    return {"anomaly": preds}
