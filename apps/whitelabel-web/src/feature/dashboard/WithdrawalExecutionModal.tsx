/**
 * WithdrawalExecutionModal - Withdraw funds from DeFi protocols
 *
 * Uses custodial backend execution (production environment for real DeFi unstaking).
 * Flow: select percentage → confirm → processing → success/error
 */

import { useState, useMemo, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Check, ExternalLink, AlertTriangle, Loader2, Info, ArrowDownToLine } from "lucide-react"
import { usePrivy } from "@privy-io/react-auth"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { useProducts } from "@/hooks/useProducts"
import { useWithdrawalExecution } from "@/hooks/defi/useDefiExecution"
import { useCustodialBalance } from "@/hooks/useCustodialBalance"

// ============================================================================
// Types
// ============================================================================

interface WithdrawalExecutionModalProps {
    isOpen: boolean
    onClose: () => void
    onComplete?: () => void
}

type Step = "select" | "confirm" | "processing" | "success" | "error"

// ============================================================================
// Constants
// ============================================================================

const QUICK_PERCENTAGES = [25, 50, 75, 100]
const LARGE_WITHDRAWAL_THRESHOLD = 10000 // $10,000

// ============================================================================
// Component
// ============================================================================

export function WithdrawalExecutionModal({ isOpen, onClose, onComplete }: WithdrawalExecutionModalProps) {
    const queryClient = useQueryClient()
    const { authenticated } = usePrivy()
    // activeProductId is used by the execution hooks internally
    useProducts()

    // Form state
    const [step, setStep] = useState<Step>("select")
    const [percentage, setPercentage] = useState(50)
    const [errorMessage, setErrorMessage] = useState("")
    const [txHashes, setTxHashes] = useState<string[]>([])

    // API hooks
    const withdrawalMutation = useWithdrawalExecution()

    // User balance - fetch from backend API
    const { data: balanceData, isLoading: balanceLoading, error: balanceError } = useCustodialBalance()
    const currentBalance = balanceData?.balance || 0
    const currentAPY = balanceData?.apy || "0%"

    // Computed values
    const withdrawalAmount = useMemo(() => {
        return (currentBalance * percentage) / 100
    }, [currentBalance, percentage])

    const isValidWithdrawal = withdrawalAmount > 0 && withdrawalAmount <= currentBalance

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setStep("select")
            setPercentage(50)
            setErrorMessage("")
            setTxHashes([])
            withdrawalMutation.reset()
        }
    }, [isOpen])

    // Show error toast when balance fetch fails
    useEffect(() => {
        if (balanceError) {
            toast.error('Failed to load balance', {
                description: 'Please check your connection and try again',
            })
        }
    }, [balanceError])

    // Handle close
    const handleClose = () => {
        setStep("select")
        setPercentage(50)
        setErrorMessage("")
        setTxHashes([])
        withdrawalMutation.reset()
        onClose()
    }

    // Handle quick percentage selection
    const handleQuickSelect = (pct: number) => {
        setPercentage(pct)
    }

    // Handle continue to confirm
    const handleContinue = () => {
        // For large withdrawals, go to confirmation step
        if (withdrawalAmount >= LARGE_WITHDRAWAL_THRESHOLD) {
            setStep("confirm")
        } else {
            // For small withdrawals, execute immediately
            handleWithdraw()
        }
    }

    // Handle execute withdrawal
    const handleWithdraw = async () => {
        setStep("processing")

        try {
            const result = await withdrawalMutation.mutateAsync({
                amount: withdrawalAmount.toString(),
                environment: "production", // Always use production for real DeFi unstaking
            })

            if (result.success) {
                setTxHashes(result.transactionHashes)
                setStep("success")

                // Invalidate queries
                queryClient.invalidateQueries({ queryKey: ["userBalance"] })
                queryClient.invalidateQueries({ queryKey: ["vault-index"] })
                queryClient.invalidateQueries({ queryKey: ["custodialBalance"] })
            } else {
                setErrorMessage(result.error || "Transaction failed")
                setStep("error")
            }
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Failed to execute withdrawal")
            setStep("error")
        }
    }

    // Handle complete
    const handleComplete = () => {
        onComplete?.()
        handleClose()
    }

    // Handle retry
    const handleRetry = () => {
        setStep("confirm")
        setErrorMessage("")
        withdrawalMutation.reset()
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="max-w-[520px] w-full">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ArrowDownToLine className="w-6 h-6 text-blue-600" />
                        {step === "select" && "Withdraw Funds"}
                        {step === "confirm" && "Confirm Withdrawal"}
                        {step === "processing" && "Processing..."}
                        {step === "success" && "Withdrawal Successful!"}
                        {step === "error" && "Withdrawal Failed"}
                    </DialogTitle>
                </DialogHeader>

                <div className="p-4">
                    {/* Step 1: Select Percentage */}
                    {step === "select" && (
                        <div className="space-y-5">
                            {/* Current Balance Display */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5">
                                <div className="text-center">
                                    <p className="text-sm text-blue-600 mb-1">Current Balance</p>
                                    {balanceLoading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                            <span className="text-lg text-gray-600">Loading...</span>
                                        </div>
                                    ) : balanceError ? (
                                        <p className="text-red-500 text-sm">Error loading balance</p>
                                    ) : (
                                        <>
                                            <p className="text-3xl font-bold text-gray-900">${currentBalance.toLocaleString()}</p>
                                            <p className="text-sm text-blue-600 mt-1">{currentAPY} APY</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Withdrawal Amount Display */}
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                                <div className="text-center mb-4">
                                    <p className="text-sm text-gray-600 mb-1">You're withdrawing</p>
                                    <p className="text-4xl font-bold text-gray-900">${withdrawalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                    <p className="text-sm text-gray-500 mt-1">{percentage}% of ${currentBalance.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Percentage Slider */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700">Withdrawal Percentage</label>
                                <div className="px-2">
                                    <Slider
                                        value={[percentage]}
                                        onValueChange={([value]) => setPercentage(value)}
                                        min={0}
                                        max={100}
                                        step={1}
                                        className="w-full"
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 px-2">
                                    <span>0%</span>
                                    <span className="font-semibold text-gray-900">{percentage}%</span>
                                    <span>100%</span>
                                </div>
                            </div>

                            {/* Quick Select Buttons */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Quick Select</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {QUICK_PERCENTAGES.map((pct) => (
                                        <button
                                            key={pct}
                                            onClick={() => handleQuickSelect(pct)}
                                            className={`py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                                                percentage === pct
                                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                                            }`}
                                        >
                                            {pct}%
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Production Mode Notice */}
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                                <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-amber-700">
                                    Funds will be withdrawn from DeFi protocols (AAVE, Compound, Morpho) on mainnet.
                                    This process may take a few minutes.
                                </p>
                            </div>

                            {/* Withdraw Button */}
                            <Button
                                onClick={handleContinue}
                                disabled={!isValidWithdrawal || !authenticated || balanceLoading || !!balanceError}
                                className="w-full py-4 rounded-2xl font-bold text-lg bg-blue-600 hover:bg-blue-700"
                            >
                                {balanceLoading ? "Loading balance..." : balanceError ? "Cannot proceed - balance error" : "Withdraw"}
                            </Button>
                        </div>
                    )}

                    {/* Step 2: Confirmation (for large withdrawals) */}
                    {step === "confirm" && (
                        <div className="space-y-5">
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
                                <div className="text-center mb-4">
                                    <p className="text-sm text-amber-600 mb-1">You're withdrawing</p>
                                    <p className="text-4xl font-bold text-gray-900">${withdrawalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                    <p className="text-sm text-gray-600 mt-1">{percentage}% of your balance</p>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Current Balance</span>
                                        <span className="font-semibold text-gray-900">${currentBalance.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Remaining After Withdrawal</span>
                                        <span className="font-semibold text-gray-900">
                                            ${(currentBalance - withdrawalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Current APY</span>
                                        <span className="font-semibold text-blue-600">{currentAPY}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Large Withdrawal Warning */}
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-amber-700">
                                    You're withdrawing a large amount (${withdrawalAmount.toLocaleString()}).
                                    Please confirm that you want to proceed with this withdrawal.
                                </p>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setStep("select")}
                                    className="flex-1 py-4 rounded-2xl font-bold"
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={handleWithdraw}
                                    className="flex-1 py-4 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700"
                                >
                                    Confirm Withdrawal
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Processing */}
                    {step === "processing" && (
                        <div className="py-12 text-center">
                            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing withdrawal...</h3>
                            <p className="text-sm text-gray-600">
                                Unstaking ${withdrawalAmount.toLocaleString()} from DeFi protocols
                            </p>
                            <div className="mt-6">
                                <div className="flex items-center justify-center gap-2 text-sm">
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                    <span className="text-gray-600">Please wait, this may take a few minutes...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Success */}
                    {step === "success" && (
                        <div className="py-8 text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                                <Check className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Withdrawal Successful!</h3>
                            <p className="text-gray-600 mb-6">
                                ${withdrawalAmount.toLocaleString()} has been withdrawn from DeFi protocols
                            </p>

                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-left">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-green-700">Amount withdrawn</span>
                                    <span className="font-semibold text-green-900">${withdrawalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-green-700">Remaining balance</span>
                                    <span className="font-semibold text-green-900">
                                        ${(currentBalance - withdrawalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>

                                {txHashes.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-green-200">
                                        <p className="text-xs text-green-600 mb-2">Transaction Hashes:</p>
                                        {txHashes.map((hash, i) => (
                                            <a
                                                key={i}
                                                href={`https://basescan.org/tx/${hash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs font-mono text-blue-600 hover:text-blue-800 transition-colors mb-1 block"
                                            >
                                                {hash.slice(0, 10)}...{hash.slice(-8)}
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Button
                                onClick={handleComplete}
                                className="w-full py-4 rounded-2xl font-bold text-lg bg-green-600 hover:bg-green-700"
                            >
                                Done
                            </Button>
                        </div>
                    )}

                    {/* Step 5: Error */}
                    {step === "error" && (
                        <div className="py-8 text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                                <AlertTriangle className="w-10 h-10 text-red-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Withdrawal Failed</h3>
                            <p className="text-gray-600 mb-6">{errorMessage || "Something went wrong. Please try again."}</p>

                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                                <p className="text-sm text-red-700">
                                    Your funds have not been moved. Please try again or contact support if the issue persists.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={handleClose}
                                    className="flex-1 py-4 rounded-2xl font-bold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleRetry}
                                    className="flex-1 py-4 rounded-2xl font-bold"
                                >
                                    Try Again
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
