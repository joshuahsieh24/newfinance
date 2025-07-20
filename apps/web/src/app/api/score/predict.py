#!/usr/bin/env python3
import sys, json, joblib, traceback

if len(sys.argv) != 2:       # model path passed by Node
    print("Usage: predict.py <model_path>", file=sys.stderr)
    sys.exit(1)

try:
    model = joblib.load(sys.argv[1])
except Exception:
    traceback.print_exc(file=sys.stderr)
    sys.exit(1)

try:
    features = json.loads(sys.stdin.read())   # must be a list
    prob = model.predict_proba([features])[0][1]
    print(prob, flush=True)
except Exception:
    traceback.print_exc(file=sys.stderr)
    sys.exit(1)
