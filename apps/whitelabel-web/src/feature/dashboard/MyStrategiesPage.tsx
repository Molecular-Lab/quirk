import { useState, useEffect } from "react"
import axios from "axios"
import { Shield, Scale, Rocket, Settings } from "lucide-react"
import { AllocationDonutChart } from "../../components/charts/AllocationDonutChart"
import { RiskProfileCard } from "../../components/strategy/RiskProfileCard"
import { AllocationSlider } from "../../components/strategy/AllocationSlider"
import { useFloatingConcierge } from "../../contexts/FloatingConciergeContext"
import { useMockUSDCBalance } from "../../hooks/useMockUSDCBalance"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8888/api/v1"
const CUSTODIAL_WALLET_ADDRESS = import.meta.env.VITE_CUSTODIAL_WALLET_ADDRESS

// Protocol colors for consistent branding
const PROTOCOL_COLORS: Record<string, string> = {
    aave: "#B6509E",
    compound: "#00D395",
    morpho: "#2470FF",
}

interface ProtocolAllocation {
    id: "aave" | "compound" | "morpho"
    name: string
    allocation: number
    expectedAPY: string
    tvl: string
    color: string
}

interface RiskProfile {
    id: "conservative" | "moderate" | "aggressive" | "custom"
    name: string
    icon: React.ReactNode
    expectedAPY: string
    description: string
}

const RISK_PROFILES: RiskProfile[] = [
    {
        id: "conservative",
        name: "Conservative",
        icon: <Shield className="w-6 h-6" />,
        expectedAPY: "3-4%",
        description: "Low risk, stable returns with established protocols",
    },
    {
        id: "moderate",
        name: "Moderate",
        icon: <Scale className="w-6 h-6" />,
        expectedAPY: "4-5%",
        description: "Balanced risk-reward with diversified allocation",
    },
    {
        id: "aggressive",
        name: "Aggressive",
        icon: <Rocket className="w-6 h-6" />,
        expectedAPY: "5-6%",
        description: "Higher risk, maximum yield potential",
    },
    {
        id: "custom",
        name: "Custom",
        icon: <Settings className="w-6 h-6" />,
        expectedAPY: "You decide",
        description: "Build your own allocation strategy",
    },
]

const DEFAULT_ALLOCATIONS: ProtocolAllocation[] = [
    { id: "aave", name: "Aave V3", allocation: 50, expectedAPY: "0.00", tvl: "0", color: PROTOCOL_COLORS.aave },
    { id: "compound", name: "Compound V3", allocation: 30, expectedAPY: "0.00", tvl: "0", color: PROTOCOL_COLORS.compound },
    { id: "morpho", name: "Morpho", allocation: 20, expectedAPY: "0.00", tvl: "0", color: PROTOCOL_COLORS.morpho },
]

export function MyStrategiesPage() {
    const [selectedProfile, setSelectedProfile] = useState<RiskProfile>(RISK_PROFILES[0])
    const [allocations, setAllocations] = useState<ProtocolAllocation[]>(DEFAULT_ALLOCATIONS)
    const [isOptimizing, setIsOptimizing] = useState(false)
    const [showSavedStrategies, setShowSavedStrategies] = useState(false)
    const [bestChain, setBestChain] = useState<{ chainId: number; chainName: string } | null>(null)
    const [allChainResults, setAllChainResults] = useState<any[]>([])

    const { data: balance, isLoading: balanceLoading } = useMockUSDCBalance(CUSTODIAL_WALLET_ADDRESS)
    const { openWithContext } = useFloatingConcierge()

    // Calculate blended APY
    const blendedAPY = allocations.reduce((sum, alloc) => {
        const apy = parseFloat(alloc.expectedAPY) || 0
        return sum + (apy * alloc.allocation) / 100
    }, 0).toFixed(2)

    const totalAllocation = allocations.reduce((sum, a) => sum + a.allocation, 0)
    const isValidAllocation = totalAllocation === 100

    // Auto-fetch optimization on mount for default profile
    useEffect(() => {
        handleProfileSelect(RISK_PROFILES[0])
    }, [])

    // Handle risk profile selection
    const handleProfileSelect = async (profile: RiskProfile) => {
        setSelectedProfile(profile)

        if (profile.id === "custom") {
            // Reset to equal distribution for custom
            setBestChain(null)
            setAllChainResults([])
            setAllocations([
                { ...DEFAULT_ALLOCATIONS[0], allocation: 34 },
                { ...DEFAULT_ALLOCATIONS[1], allocation: 33 },
                { ...DEFAULT_ALLOCATIONS[2], allocation: 33 },
            ])
            return
        }

        // Fetch optimized allocation from multi-chain API
        setIsOptimizing(true)
        try {
            const response = await axios.post(`${API_BASE_URL}/defi/optimize-multi`, {
                token: "USDC",
                riskLevel: profile.id,
                positionSizeUSD: 10000, // Default position size
                holdPeriodDays: 30,
            })

            const { allocation, bestChain: recommendedChain, allChainResults: chainResults } = response.data

            // Update best chain
            setBestChain(recommendedChain)
            setAllChainResults(chainResults || [])

            const newAllocations: ProtocolAllocation[] = allocation.map((alloc: any) => ({
                id: alloc.protocol,
                name: alloc.protocol === "aave" ? "Aave V3" : alloc.protocol === "compound" ? "Compound V3" : "Morpho",
                allocation: alloc.percentage,
                expectedAPY: alloc.expectedAPY,
                tvl: alloc.tvl,
                color: PROTOCOL_COLORS[alloc.protocol],
            }))

            setAllocations(newAllocations)
        } catch (error) {
            console.error("Failed to optimize allocation:", error)
        } finally {
            setIsOptimizing(false)
        }
    }

    // Handle custom allocation change
    const handleAllocationChange = (id: string, value: number) => {
        setAllocations((prev) =>
            prev.map((a) => (a.id === id ? { ...a, allocation: value } : a))
        )
    }

    // Open AI concierge with context
    const handleAskAgent = () => {
        const contextMessage = `User is creating a yield strategy:
- Selected Profile: ${selectedProfile.name} (${selectedProfile.id})
- Current Allocation:
  ${allocations.map((a) => `• ${a.name}: ${a.allocation}%`).join("\n  ")}
- Expected Blended APY: ${blendedAPY}%
- Allocation Valid: ${isValidAllocation ? "Yes" : `No (total: ${totalAllocation}%)`}

Help them understand or refine their strategy.`

        openWithContext(contextMessage)
    }

    // Confirm strategy
    const handleConfirm = () => {
        console.log("Saving strategy:", { profile: selectedProfile, allocations })
        alert(`✓ Strategy "${selectedProfile.name}" confirmed!`)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Strategy</h1>
                        <p className="text-gray-600">Choose a risk profile or build your own</p>
                    </div>
                    <div className="text-right bg-white px-5 py-3 rounded-2xl border border-gray-200 shadow-sm">
                        {balanceLoading ? (
                            <div className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                                <div className="h-6 bg-gray-200 rounded w-24"></div>
                            </div>
                        ) : balance ? (
                            <>
                                <p className="text-xs text-gray-500">Available</p>
                                <p className="text-lg font-bold text-gray-900">${balance.formatted}</p>
                            </>
                        ) : (
                            <p className="text-sm text-gray-400">Connect wallet</p>
                        )}
                    </div>
                </div>

                {/* Risk Profile Cards */}
                <div className="mb-8">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4">1. Choose Risk Profile</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {RISK_PROFILES.map((profile) => (
                            <RiskProfileCard
                                key={profile.id}
                                id={profile.id}
                                name={profile.name}
                                icon={profile.icon}
                                expectedAPY={profile.expectedAPY}
                                description={profile.description}
                                isSelected={selectedProfile.id === profile.id}
                                isLoading={isOptimizing && selectedProfile.id === profile.id}
                                onClick={() => handleProfileSelect(profile)}
                            />
                        ))}
                    </div>
                </div>

                {/* Allocation Visualization */}
                <div className="mb-8 bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-sm font-semibold text-gray-700">2. Review Allocation</h2>
                        {bestChain && selectedProfile.id !== "custom" && (
                            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full">
                                <span className="text-xs text-emerald-700 font-medium">Best Chain:</span>
                                <span className="text-sm font-bold text-emerald-800">{bestChain.chainName}</span>
                            </div>
                        )}
                    </div>

                    <div className={`flex ${selectedProfile.id === "custom" ? "flex-col md:flex-row" : "flex-col"} items-center gap-8`}>
                        {/* Donut Chart - centered when not custom */}
                        <div className={selectedProfile.id === "custom" ? "" : "w-full flex justify-center"}>
                            <AllocationDonutChart
                                allocations={allocations}
                                centerText={`${blendedAPY}%`}
                                centerSubtext="Expected APY"
                                size={180}
                            />
                        </div>

                        {/* Custom Sliders (only for custom profile) */}
                        {selectedProfile.id === "custom" && (
                            <div className="flex-1 w-full space-y-4">
                                <p className="text-sm text-gray-600 mb-4">
                                    Adjust the allocation percentages (must total 100%)
                                </p>
                                {allocations.map((alloc) => (
                                    <AllocationSlider
                                        key={alloc.id}
                                        id={alloc.id}
                                        name={alloc.name}
                                        value={alloc.allocation}
                                        color={alloc.color}
                                        onChange={handleAllocationChange}
                                    />
                                ))}

                                {/* Total indicator */}
                                <div className={`text-sm font-medium pt-2 border-t ${isValidAllocation ? "text-emerald-600" : "text-red-600"
                                    }`}>
                                    Total: {totalAllocation}%
                                    {!isValidAllocation && (
                                        <span className="text-xs ml-2">
                                            ({totalAllocation > 100 ? "over" : "under"} by {Math.abs(100 - totalAllocation)}%)
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    {/* Ask Agent Button */}
                    <button
                        onClick={handleAskAgent}
                        className="w-full py-3 px-6 rounded-2xl border-2 border-gray-200 bg-white text-gray-700 font-medium hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                    >
                        <span>🤖</span>
                        <span>Not sure? Ask our AI</span>
                    </button>

                    {/* Confirm Button */}
                    <button
                        onClick={handleConfirm}
                        disabled={!isValidAllocation}
                        className={`w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all ${isValidAllocation
                            ? "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                            : "bg-gray-300 cursor-not-allowed"
                            }`}
                    >
                        ✓ Confirm Strategy
                    </button>
                </div>

                {/* Saved Strategies Link */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => setShowSavedStrategies(!showSavedStrategies)}
                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                        {showSavedStrategies ? "Hide saved strategies" : "Load saved strategy"}
                    </button>

                    {showSavedStrategies && (
                        <div className="mt-4 p-4 bg-white rounded-2xl border border-gray-200 text-sm text-gray-500">
                            No saved strategies yet. Create and confirm a strategy to save it.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
