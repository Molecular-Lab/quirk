export type TimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly'

interface TimeFilterProps {
  value: TimeRange
  onChange: (range: TimeRange) => void
  className?: string
}

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

export default function TimeFilter({ value, onChange, className = '' }: TimeFilterProps) {
  return (
    <div className={`inline-flex rounded-lg border border-gray-300 bg-white p-1 ${className}`}>
      {TIME_RANGES.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            value === range.value
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  )
}
