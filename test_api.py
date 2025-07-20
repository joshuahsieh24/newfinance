import requests
import json

# Test data
data = {
    "amount": -1114.77,
    "step": 163,
    "merchant_freq": 1,
    "category_freq": 1,
    "merchant_code": 0,
    "category_code": 0
}

# Make request
response = requests.post("http://localhost:8000/score", json=data)
print(f"Status: {response.status_code}")
print(f"Response text: {response.text}")
print(f"Headers: {response.headers}") 