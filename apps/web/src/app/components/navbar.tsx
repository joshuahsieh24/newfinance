export function Navbar() {
  return (
    <nav className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              FinanceAI
            </h1>
          </div>
        </div>
      </div>
    </nav>
  )
}
