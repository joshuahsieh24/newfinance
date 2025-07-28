# 🚀 Deployment Guide - FinanceAI to Render

## 📋 Prerequisites

1. **GitHub Repository** - Push your code to GitHub
2. **Render Account** - Sign up at [render.com](https://render.com)
3. **Environment Variables** - Prepare your API keys

## 🔧 Step-by-Step Deployment

### **Step 1: Prepare Your Repository**

1. **Push to GitHub** (if not already done):
```bash
git add .
git commit -m "Add deployment configuration"
git push origin main
```

2. **Verify these files exist**:
- ✅ `render.yaml` (Render configuration)
- ✅ `services/ml-api/model_api.py` (ML API)
- ✅ `services/ml-api/requirements.txt` (Python dependencies)
- ✅ `apps/web/next.config.ts` (Next.js config)

### **Step 2: Deploy ML API Service**

1. **Go to Render Dashboard**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Configure the ML API service**:

   **Name**: `financeai-ml-api`
   
   **Environment**: `Python 3`
   
   **Build Command**:
   ```bash
   cd services/ml-api && pip install -r requirements.txt
   ```
   
   **Start Command**:
   ```bash
   cd services/ml-api && uvicorn model_api:app --host 0.0.0.0 --port $PORT
   ```

5. **Add Environment Variables**:
   - `MODEL_PATH`: `financeai_lgbm.pkl`
   - `PYTHONPATH`: `/opt/render/project/src/services/ml-api`

6. **Deploy** and note the URL (e.g., `https://financeai-ml-api.onrender.com`)

### **Step 3: Deploy Frontend Service**

1. **Create another Web Service**
2. **Configure the Frontend service**:

   **Name**: `financeai-frontend`
   
   **Environment**: `Node`
   
   **Build Command**:
   ```bash
   cd apps/web && npm install -g pnpm && pnpm install && pnpm build
   ```
   
   **Start Command**:
   ```bash
   cd apps/web && npm install -g pnpm && pnpm start
   ```

3. **Add Environment Variables**:
   - `NODE_ENV`: `production`
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `ML_API_URL`: `https://financeai-ml-api.onrender.com` (from Step 2)

4. **Deploy** and get your frontend URL

### **Step 4: Upload ML Model**

1. **Upload your model file** to the ML API service:
   - Go to your ML API service in Render
   - Click "Files" tab
   - Upload `financeai_lgbm.pkl` to the root directory

2. **Redeploy the ML API service** to load the model

### **Step 5: Test Deployment**

1. **Test ML API**: Visit `https://financeai-ml-api.onrender.com/health`
2. **Test Frontend**: Visit your frontend URL
3. **Test Full Flow**: Upload a CSV file

## 🔧 Alternative: Using render.yaml (Blueprints)

If you prefer automatic deployment:

1. **Push your code with `render.yaml`**
2. **Go to Render Dashboard**
3. **Click "New +" → "Blueprint"**
4. **Connect your repository**
5. **Render will automatically create both services**

## 🛠️ Troubleshooting

### **Common Issues:**

1. **ML Model Not Found**:
   - Ensure `financeai_lgbm.pkl` is uploaded to ML API service
   - Check `MODEL_PATH` environment variable

2. **Frontend Can't Connect to ML API**:
   - Verify `ML_API_URL` environment variable
   - Check ML API service is running

3. **Build Failures**:
   - Check all dependencies are in `requirements.txt`
   - Verify Node.js version compatibility

### **Environment Variables Checklist**:

**Frontend Service**:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `OPENAI_API_KEY`
- ✅ `ML_API_URL`

**ML API Service**:
- ✅ `MODEL_PATH`
- ✅ `PYTHONPATH`

## 📊 Monitoring

- **Render Dashboard**: Monitor service health
- **Logs**: Check service logs for errors
- **Health Endpoints**: `/health` for ML API

## 🔄 Updates

To update your deployment:
1. **Push changes to GitHub**
2. **Render will automatically redeploy**
3. **Or manually redeploy from dashboard**

## 💰 Cost

- **Free Tier**: 750 hours/month per service
- **Paid Plans**: Start at $7/month for always-on services

Your app will be live at your frontend URL! 🎉