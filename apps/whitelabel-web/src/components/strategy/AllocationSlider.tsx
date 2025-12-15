/**
 * AllocationSlider - Slider component for custom allocation editing
 */

interface AllocationSliderProps {
    id: string
    name: string
    value: number
    color: string
    onChange: (id: string, value: number) => void
    disabled?: boolean
}

export function AllocationSlider({
    id,
    name,
    value,
    color,
    onChange,
    disabled = false,
}: AllocationSliderProps) {
    return (
        <div className="flex items-center gap-4">
            {/* Protocol name with color indicator */}
            <div className="flex items-center gap-2 w-32">
                <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                />
                <span className="text-sm font-medium text-gray-700">{name}</span>
            </div>

            {/* Slider */}
            <div className="flex-1">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => onChange(id, parseInt(e.target.value))}
                    disabled={disabled}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                        background: `linear-gradient(to right, ${color} 0%, ${color} ${value}%, #E5E7EB ${value}%, #E5E7EB 100%)`,
                    }}
                />
            </div>

            {/* Percentage value */}
            <div className="w-12 text-right">
                <span className="text-sm font-bold text-gray-900">{value}%</span>
            </div>
        </div>
    )
}
