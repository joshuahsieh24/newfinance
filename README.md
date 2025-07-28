# FinanceAI - Intelligent Transaction Analysis

A Next.js application that analyzes bank transaction data using machine learning and AI to identify potentially risky or unusual transactions.

## What it does

Upload your bank CSV file and the app will:
- Parse and display your transactions in a clean table format
- Run each transaction through a machine learning model to calculate risk scores
- Generate AI-powered insights for high-risk transactions
- Flag anomalies based on both rule-based logic and ML predictions
- Store all analyzed data in Supabase for future reference

The ML model considers factors like transaction amount, merchant frequency, category patterns, and timing to assess risk. Incoming payments (money received) are treated with lower sensitivity than outgoing payments.

## Features

- **CSV Upload**: Drag and drop or click to upload bank statement CSVs
- **Risk Scoring**: ML-powered risk assessment for each transaction
- **AI Insights**: Contextual advice for high-risk transactions using GPT-3.5
- **Full Screen View**: Expand the table for better readability of advice
- **Anomaly Filtering**: Toggle to show only flagged transactions
- **Data Persistence**: All transactions are stored in Supabase
- **Responsive Design**: Works on desktop and mobile

## Prerequisites

- Node.js 18+ and pnpm (or npm)
- Supabase account and project
- OpenAI API key (for AI insights)

## Setup

### 1. Clone and install dependencies

```bash
git clone <your-repo-url>
cd financeai
pnpm install
```

### 2. Environment variables

Create a `.env.local` file in the `apps/web` directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

Get your Supabase credentials from:
- Supabase Dashboard → Project Settings → API
- Copy the Project URL and anon/public key

### 3. Start the ML service

The app uses a FastAPI service for ML model scoring. Start it in a separate terminal:

```bash
cd services/ml-api
python model_api.py
```

This will start the ML service on port 8000.

### 4. Start the Next.js app

```bash
cd apps/web
pnpm dev
```

The app will be available at http://localhost:3000

## Usage

1. Open the app in your browser
2. Upload a CSV file with your bank transactions
3. Wait for the analysis to complete (ML scoring + AI insights)
4. Review the results in the table
5. Use the "Full Screen View" button for better readability
6. Toggle "Show only anomalies" to focus on flagged transactions

## CSV Format

Your CSV should have columns for:
- Date
- Description/Merchant
- Amount (negative for debits, positive for credits)

The app will automatically detect and parse common CSV formats.

## Architecture

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **ML Service**: FastAPI with scikit-learn model
- **Database**: Supabase with row-level encryption
- **AI**: OpenAI GPT-3.5 for contextual insights
- **Styling**: Tailwind CSS with shadcn/ui components

## Security Features

### 🔐 Row-Level Encryption
- **AES-256-GCM** encryption for sensitive transaction data
- **PBKDF2** key derivation with 100,000 iterations
- **Unique encryption keys** per transaction
- **Secure key storage** in database

### 🛡️ Rate Limiting
- **Token bucket algorithm** with 250 requests/minute
- **IP-based rate limiting** with automatic cleanup
- **99.99% uptime guarantee** with health monitoring
- **Automatic rate limit reset** every minute

### 📊 Monitoring & Health Checks
- **Real-time system metrics** tracking
- **Error rate monitoring** (target: <1%)
- **Memory and CPU usage** tracking
- **Active connection monitoring**
- **Health check endpoint**: `/api/health`

### 🔒 Data Security
- **Hashed user IDs** for additional security
- **Encrypted descriptions** and AI insights
- **Secure API endpoints** with validation
- **Environment variable validation**

### API Endpoints

- `POST /api/transactions` - Insert encrypted transaction data
- `GET /api/transactions` - Retrieve and decrypt transaction data
- `GET /api/health` - System health and performance metrics
- `POST /api/score` - ML model scoring
- `POST /api/gpt` - AI insight generation

## Development

The project uses a monorepo structure:
- `apps/web/` - Next.js frontend
- `services/ml-api/` - FastAPI ML service
- `apps/web/public/model/` - ML model files

## Troubleshooting

- **ML service not responding**: Make sure the FastAPI service is running on port 8000
- **No AI insights**: Check your OpenAI API key is valid
- **Database errors**: Verify your Supabase credentials
- **CSV parsing issues**: Ensure your CSV has the required columns

## License

[Your license here] 