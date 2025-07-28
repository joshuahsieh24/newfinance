# Python ML API service
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for scikit-learn compilation
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies with pre-compiled wheels
RUN pip install --no-cache-dir --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Copy the ML model files
COPY financeai_lgbm.pkl ./financeai_lgbm.pkl

EXPOSE 8000

CMD ["uvicorn", "model_api:app", "--host", "0.0.0.0", "--port", "8000"]