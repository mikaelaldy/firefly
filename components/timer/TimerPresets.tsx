'use client'

interface TimerPresetsProps {
  onSelectDuration: (minutes: number) => void;
  disabled?: boolean;
}

export function TimerPresets({ onSelectDuration, disabled = false }: TimerPresetsProps) {
  const presets = [
    { minutes: 25, label: '25 min', description: 'Pomodoro Focus' },
    { minutes: 45, label: '45 min', description: 'Deep Work' },
    { minutes: 50, label: '50 min', description: 'Extended Focus' }
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 text-center">
        Choose Focus Duration
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {presets.map(({ minutes, label, description }) => (
          <button
            key={minutes}
            onClick={() => onSelectDuration(minutes)}
            disabled={disabled}
            className={`
              p-6 rounded-xl border-2 text-center transition-all duration-200 transform
              focus:outline-none focus:ring-4 focus:ring-blue-200
              ${disabled 
                ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:scale-105 active:scale-95 cursor-pointer'
              }
            `}
            aria-label={`Start ${minutes} minute timer for ${description}`}
          >
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {label}
            </div>
            <div className="text-sm text-gray-600">
              {description}
            </div>
          </button>
        ))}
      </div>
      
      <div className="text-center text-sm text-gray-500">
        <p>💡 Timer starts immediately - no waiting for AI suggestions</p>
      </div>
    </div>
  )
}