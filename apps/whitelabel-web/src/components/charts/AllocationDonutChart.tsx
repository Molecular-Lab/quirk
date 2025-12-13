/**
 * AllocationDonutChart - Pure SVG donut chart for protocol allocations
 */

import { useMemo } from "react"

interface Allocation {
    id: string
    name: string
    allocation: number
    color: string
}

interface AllocationDonutChartProps {
    allocations: Allocation[]
    centerText?: string
    centerSubtext?: string
    size?: number
}

// Protocol brand colors
const PROTOCOL_COLORS: Record<string, string> = {
    aave: "#B6509E",      // Aave purple/pink
    compound: "#00D395",  // Compound green
    morpho: "#2470FF",    // Morpho blue
}

export function AllocationDonutChart({
    allocations,
    centerText,
    centerSubtext,
    size = 200,
}: AllocationDonutChartProps) {
    const radius = 40
    const strokeWidth = 12
    const circumference = 2 * Math.PI * radius

    // Calculate stroke-dasharray segments
    const segments = useMemo(() => {
        let cumulativeOffset = 0
        return allocations
            .filter((a) => a.allocation > 0)
            .map((alloc) => {
                const segmentLength = (alloc.allocation / 100) * circumference
                const offset = cumulativeOffset
                cumulativeOffset += segmentLength
                return {
                    ...alloc,
                    segmentLength,
                    offset,
                    color: PROTOCOL_COLORS[alloc.id] || alloc.color || "#9CA3AF",
                }
            })
    }, [allocations, circumference])

    return (
        <div className="flex flex-col items-center">
            <svg
                width={size}
                height={size}
                viewBox="0 0 100 100"
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth={strokeWidth}
                />

                {/* Allocation segments */}
                {segments.map((segment, index) => (
                    <circle
                        key={segment.id}
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke={segment.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${segment.segmentLength} ${circumference}`}
                        strokeDashoffset={-segment.offset}
                        strokeLinecap="round"
                        className="transition-all duration-500 ease-out"
                        style={{
                            filter: `drop-shadow(0 0 4px ${segment.color}40)`,
                        }}
                    />
                ))}

                {/* Center text */}
                <g className="transform rotate-90" style={{ transformOrigin: "50% 50%" }}>
                    {centerText && (
                        <text
                            x="50"
                            y="46"
                            textAnchor="middle"
                            className="fill-gray-900 text-2xl font-bold"
                            style={{ fontSize: "16px", fontWeight: 700 }}
                        >
                            {centerText}
                        </text>
                    )}
                    {centerSubtext && (
                        <text
                            x="50"
                            y="58"
                            textAnchor="middle"
                            className="fill-gray-500"
                            style={{ fontSize: "8px" }}
                        >
                            {centerSubtext}
                        </text>
                    )}
                </g>
            </svg>

            {/* Legend */}
            <div className="mt-4 space-y-2">
                {segments.map((segment) => (
                    <div key={segment.id} className="flex items-center gap-3">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: segment.color }}
                        />
                        <span className="text-sm text-gray-700">{segment.name}</span>
                        <span className="text-sm font-semibold text-gray-900">
                            {segment.allocation}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
