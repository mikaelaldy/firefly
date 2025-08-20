'use client'

interface HeroSectionProps {
  onGetStarted: () => void
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <div className="text-center space-y-8 mb-16">
      {/* Badge */}
      <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-6 py-3 rounded-full text-sm font-medium shadow-sm">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span>ADHD-Friendly Focus Tool</span>
      </div>
      
      {/* Main heading */}
      <div className="space-y-6">
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent leading-tight">
          Firefly
        </h1>
        
        <p className="text-2xl md:text-3xl font-semibold text-gray-800 max-w-4xl mx-auto leading-relaxed">
          Break through task paralysis in seconds
        </p>
        
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          AI-powered micro-tasks and visual timers designed specifically for ADHD brains. 
          Start meaningful work without the overwhelm.
        </p>
      </div>

      {/* CTA Button */}
      <div className="pt-4">
        <button
          onClick={onGetStarted}
          className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xl px-12 py-6 rounded-2xl shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          <div className="flex items-center space-x-3">
            <span>Try Firefly Now</span>
            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </button>
        
        <p className="text-sm text-gray-500 mt-4">
          ✨ Works instantly - no signup required
        </p>
      </div>
    </div>
  )
}