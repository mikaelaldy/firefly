'use client'

export function DemoPreview() {
  return (
    <div className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-emerald-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            See Firefly in Action
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From overwhelming goal to focused work in under 10 seconds
          </p>
        </div>

        {/* Demo Flow */}
        <div className="space-y-12">
          {/* Step 1: Input */}
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Tell Firefly your goal
                </h3>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                Just type what you want to accomplish. No complex forms, no overwhelming options. 
                Firefly understands natural language and ADHD-friendly input.
              </p>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <input 
                    type="text" 
                    placeholder="What do you want to finish?"
                    className="w-full bg-transparent text-gray-800 placeholder-gray-500 focus:outline-none text-lg"
                    value="Write the introduction for my research paper"
                    readOnly
                  />
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8 text-center">
                <svg className="w-24 h-24 mx-auto text-blue-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <p className="text-blue-800 font-medium">
                  Simple, distraction-free input
                </p>
              </div>
            </div>
          </div>

          {/* Step 2: AI Breakdown */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
            <div className="lg:w-1/2 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Get instant micro-tasks
                </h3>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                AI breaks your goal into a 60-second first step and actionable next steps. 
                No more staring at a blank page wondering where to start.
              </p>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">First small step (60 seconds):</h4>
                    <p className="text-green-700">Open your document and write one sentence about your main topic</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800">Next actions:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Define your research question clearly</li>
                      <li>• List 3 key points to cover</li>
                      <li>• Write a rough outline</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <div className="bg-gradient-to-br from-purple-100 to-emerald-100 rounded-2xl p-8 text-center">
                <svg className="w-24 h-24 mx-auto text-purple-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p className="text-purple-800 font-medium">
                  AI-powered task breakdown
                </p>
              </div>
            </div>
          </div>

          {/* Step 3: Timer */}
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Start your focus session
                </h3>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                Large visual timer with shrinking disc makes time tangible. 
                Choose 25, 45, or 50 minutes and start immediately - no waiting for AI.
              </p>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="text-center space-y-4">
                  <div className="relative w-32 h-32 mx-auto">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="8"
                        strokeDasharray="283"
                        strokeDashoffset="85"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-800">18:32</span>
                    </div>
                  </div>
                  <div className="flex justify-center space-x-2">
                    <button className="px-4 py-2 bg-gray-100 rounded-lg text-sm">Pause</button>
                    <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm">Stop</button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <div className="bg-gradient-to-br from-emerald-100 to-blue-100 rounded-2xl p-8 text-center">
                <svg className="w-24 h-24 mx-auto text-emerald-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-emerald-800 font-medium">
                  Visual, ADHD-friendly timer
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="mt-20 bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">&lt;1s</div>
              <p className="text-gray-600">Timer start time</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">60s</div>
              <p className="text-gray-600">First micro-task</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600 mb-2">0</div>
              <p className="text-gray-600">Setup required</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}