/**
 * RiskProfileCard - Selectable card for risk profile selection
 */

import type { ReactNode } from "react"

interface RiskProfileCardProps {
    id: string
    name: string
    expectedAPY: string
    description: string
    icon: ReactNode
    isSelected: boolean
    isLoading?: boolean
    onClick: () => void
}

export function RiskProfileCard({
    name,
    expectedAPY,
    description,
    icon,
    isSelected,
    isLoading,
    onClick,
}: RiskProfileCardProps) {
    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            className={`
                relative p-5 rounded-2xl text-left transition-all duration-200 w-full
                ${isSelected
                    ? "bg-emerald-50 border-2 border-emerald-500 shadow-lg shadow-emerald-100"
                    : "bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-md"
                }
                ${isLoading ? "opacity-70 cursor-wait" : ""}
            `}
        >
            {/* Selected indicator */}
            {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
            )}

            {/* Loading spinner */}
            {isLoading && isSelected && (
                <div className="absolute top-3 right-3">
                    <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Icon */}
            <div className="text-gray-600 mb-2">{icon}</div>

            {/* Title */}
            <div className="text-lg font-bold text-gray-900 mb-1">{name}</div>

            {/* Expected APY */}
            <div className="text-sm text-gray-600 mb-2">
                Expected: <span className="font-semibold text-emerald-600">{expectedAPY}</span>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
        </button>
    )
}
