import Link from "next/link"

export function Navbar() {
  return (
    <nav className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
              FinanceAI
            </Link>
          </div>
          
          <div className="flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              Home
            </Link>
            <Link 
              href="/about" 
              className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              About
            </Link>
            <Link 
              href="/test-security" 
              className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              Security Test
            </Link>
            <Link 
              href="/test-encryption" 
              className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              Encryption Test
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
