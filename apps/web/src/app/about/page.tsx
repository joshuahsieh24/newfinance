import { Footer } from "../components/footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-4xl mx-auto space-y-12">
          <header className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              About FinanceAI
            </h1>
          </header>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8">
            <div className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                Intelligent Personal Finance Analysis
              </h2>
              
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                FinanceAI is a cutting-edge personal finance analyzer that combines machine learning and artificial intelligence to provide intelligent insights into your spending patterns. By uploading your bank CSV data, the system automatically detects unusual transactions and provides personalized financial advice.
              </p>

              <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-slate-900">Machine Learning!</h3>
                  <p className="text-slate-600">
                    Our advanced ML model analyzes transaction patterns to identify anomalies with high accuracy, helping you spot potential fraud or unusual spending behavior.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-slate-900">AI-Powered Insights, yayy :) </h3>
                  <p className="text-slate-600">
                    Get personalized financial advice and explanations for flagged transactions, helping you make better financial decisions.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-slate-900">Smart Detection</h3>
                  <p className="text-slate-600">
                    Combines rule-based detection (large transactions) with ML-powered anomaly detection for comprehensive financial monitoring.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-slate-900">Privacy First.</h3>
                  <p className="text-slate-600">
                    Your financial data is processed locally and securely. We don't store or share your personal information.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-8">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">Built by Joshua Hsieh</h3>
                <p className="text-slate-600">
                  A passionate developer focused on creating intelligent solutions that make financial management easier and more accessible.
                </p>
                <a
                  href="https://joshhsieh.netlify.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 underline underline-offset-2 transition-colors"
                >
                  <span>Visit Portfolio</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
} 