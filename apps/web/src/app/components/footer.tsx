import { Linkedin, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-slate-200/60 bg-white/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-6">
            <a
              href="https://www.linkedin.com/in/joshua--hsieh/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 transition-all duration-200 hover:scale-105"
              aria-label="Connect on LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="mailto:hsiehjoshua424@gmail.com"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-700 transition-all duration-200 hover:scale-105"
              aria-label="Send email"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
          <p className="text-sm text-slate-500">Built with FinanceAI</p>
        </div>
      </div>
    </footer>
  )
}
