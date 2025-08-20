# User Preferences System

## Overview

The Firefly app includes a comprehensive user preferences system designed specifically for ADHD users, with accessibility features and sensible defaults that prioritize focus and reduce cognitive load.

## Architecture

### Context Provider Pattern
The preferences system uses React Context to provide global state management across the application:

```typescript
interface PreferencesContextType {
  preferences: UserPreferences
  updatePreferences: (updates: Partial<UserPreferences>) => void
  toggleHighContrast: () => void
  toggleReducedMotion: () => void
  loading: boolean
}
```

### Local Storage Persistence
Preferences are automatically saved to `localStorage` with the key `firefly-user-preferences`, ensuring settings persist across browser sessions without requiring authentication.

## Default Settings (ADHD-Optimized)

The system ships with ADHD-friendly defaults:

```typescript
const DEFAULT_PREFERENCES: UserPreferences = {
  defaultTimerDuration: 25,      // 25-minute Pomodoro default
  soundEnabled: false,           // Quiet by default (less distraction)
  tickSoundEnabled: false,       // No ticking sounds
  highContrastMode: false,       // Standard contrast initially
  reducedMotion: true,          // Reduced motion ON by default
  bufferPercentage: 25          // 25% time buffer for deadlines
}
```

**Key ADHD Considerations:**
- **Reduced Motion Default**: Prevents distracting animations that can break focus
- **Sound Disabled**: Avoids auditory distractions during focus sessions
- **25-Minute Default**: Proven Pomodoro technique duration for ADHD users
- **25% Buffer**: Accounts for time estimation challenges common with ADHD

## Preference Categories

### Timer Settings
- `defaultTimerDuration`: 25, 45, or 50 minutes
- `soundEnabled`: Completion sound notifications
- `tickSoundEnabled`: Audible timer ticking

### Accessibility Settings
- `highContrastMode`: Enhanced visual contrast for better readability
- `reducedMotion`: Disables animations and transitions

### Time Management
- `bufferPercentage`: Default buffer percentage for deadline calculations

## CSS Integration

The preferences system automatically applies CSS classes to the document root:

```css
/* High contrast mode */
.high-contrast {
  /* Enhanced contrast styles */
}

/* Reduced motion */
.reduce-motion {
  /* Disable animations and transitions */
}
```

This allows the entire application to respond to accessibility preferences without prop drilling or manual class management.

## Usage Examples

### Basic Usage
```typescript
import { usePreferences } from '@/lib/preferences/context'

function TimerComponent() {
  const { preferences, updatePreferences } = usePreferences()
  
  // Use current preferences
  const duration = preferences.defaultTimerDuration * 60 // Convert to seconds
  
  // Update preferences
  const handleDurationChange = (minutes: number) => {
    updatePreferences({ defaultTimerDuration: minutes })
  }
  
  return (
    <div>
      <p>Default Duration: {preferences.defaultTimerDuration} minutes</p>
      <button onClick={() => handleDurationChange(45)}>
        Set to 45 minutes
      </button>
    </div>
  )
}
```

### Accessibility Toggles
```typescript
function AccessibilityControls() {
  const { preferences, toggleHighContrast, toggleReducedMotion } = usePreferences()
  
  return (
    <div>
      <button onClick={toggleHighContrast}>
        {preferences.highContrastMode ? 'Disable' : 'Enable'} High Contrast
      </button>
      <button onClick={toggleReducedMotion}>
        {preferences.reducedMotion ? 'Enable' : 'Disable'} Animations
      </button>
    </div>
  )
}
```

### Loading State Handling
```typescript
function PreferencesPanel() {
  const { preferences, loading, updatePreferences } = usePreferences()
  
  if (loading) {
    return <div>Loading preferences...</div>
  }
  
  return (
    <form>
      <label>
        Default Timer Duration:
        <select 
          value={preferences.defaultTimerDuration}
          onChange={(e) => updatePreferences({ 
            defaultTimerDuration: Number(e.target.value) as 25 | 45 | 50 
          })}
        >
          <option value={25}>25 minutes</option>
          <option value={45}>45 minutes</option>
          <option value={50}>50 minutes</option>
        </select>
      </label>
    </form>
  )
}
```

## Integration Points

### Layout Integration
The `PreferencesProvider` wraps the entire application in `app/layout.tsx`:

```typescript
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PreferencesProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </PreferencesProvider>
      </body>
    </html>
  )
}
```

### Timer Integration
Timer components can access user preferences for duration defaults and sound settings:

```typescript
const { preferences } = usePreferences()
const defaultDuration = preferences.defaultTimerDuration * 60 // seconds
```

### Buffer System Integration
The deadline management system uses the buffer percentage preference:

```typescript
const bufferTime = estimatedDuration * (preferences.bufferPercentage / 100)
```

## Error Handling

The system includes robust error handling for localStorage operations:

- **Load Failures**: Falls back to default preferences if localStorage is corrupted
- **Save Failures**: Logs warnings but doesn't break functionality
- **Context Errors**: Throws helpful error if hook is used outside provider

```typescript
// Automatic fallback on load error
try {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    const parsed = JSON.parse(stored) as UserPreferences
    setPreferences({ ...DEFAULT_PREFERENCES, ...parsed })
  }
} catch (error) {
  console.warn('Failed to load preferences from localStorage:', error)
  // Continues with DEFAULT_PREFERENCES
}
```

## Future Enhancements

While maintaining the MVP scope, potential improvements include:

- **Cloud Sync**: Sync preferences across devices for authenticated users
- **Profile Integration**: Store preferences in Supabase profiles table
- **Advanced Accessibility**: Screen reader preferences, font size controls
- **Theme System**: Dark/light mode with custom color schemes
- **Export/Import**: Backup and restore preference configurations

## ADHD-Specific Design Decisions

### Cognitive Load Reduction
- **Sensible Defaults**: Users don't need to configure anything to get started
- **Minimal Options**: Only essential preferences to avoid decision paralysis
- **Immediate Application**: Changes take effect instantly without confirmation dialogs

### Focus-Friendly Features
- **Reduced Motion Default**: Prevents animation distractions during focus sessions
- **Sound Control**: Allows users to eliminate auditory distractions
- **High Contrast Option**: Improves readability for users with attention difficulties

### Time Management Support
- **Buffer Percentage**: Helps with time estimation challenges
- **Duration Presets**: Removes decision fatigue around timer length
- **Persistent Settings**: Reduces setup friction for repeated use

## Requirements Satisfied

This implementation addresses several key requirements from the project specification:

- **7.2**: Keyboard navigation support through accessible controls
- **7.3**: High contrast mode for visual accessibility
- **7.4**: Reduced motion preference for motion sensitivity
- **12.1**: User preferences persisted locally
- **12.2**: Accessibility features with ADHD considerations

The preferences system provides a solid foundation for user customization while maintaining the app's core principle of immediate usability without configuration overhead.