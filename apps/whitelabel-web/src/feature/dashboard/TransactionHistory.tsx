/**
 * TransactionHistory Component
 *
 * Displays DeFi transaction history with filtering, sorting, and pagination.
 * Auto-refreshes pending transactions every 10 seconds.
 */

import { useState, useMemo, useEffect } from "react"
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    CheckCircle2,
    Clock,
    XCircle,
    ExternalLink,
    Copy,
    ChevronLeft,
    ChevronRight,
    History
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useTransactionHistory, type DefiTransaction } from "@/hooks/defi/useDefiExecution"

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format date as relative time (e.g., "2 hours ago")
 */
function formatRelativeTime(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`
    return date.toLocaleDateString()
}

// ============================================================================
// Types
// ============================================================================

type OperationType = "all" | "deposit" | "withdrawal" | "approval"
type Protocol = "all" | "aave" | "compound" | "morpho"
type Status = "all" | "pending" | "confirmed" | "failed"
type SortField = "date" | "amount" | "gas"
type SortDirection = "asc" | "desc"

// ============================================================================
// Constants
// ============================================================================

const ITEMS_PER_PAGE = 20
const AUTO_REFRESH_INTERVAL = 10000 // 10 seconds

const PROTOCOL_INFO = {
    aave: { name: "AAVE", color: "#B6509E" },
    compound: { name: "Compound", color: "#00D395" },
    morpho: { name: "Morpho", color: "#4B5563" },
}

// ============================================================================
// Component
// ============================================================================

export function TransactionHistory() {
    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const offset = (currentPage - 1) * ITEMS_PER_PAGE

    // Filtering
    const [filterType, setFilterType] = useState<OperationType>("all")
    const [filterProtocol, setFilterProtocol] = useState<Protocol>("all")
    const [filterStatus, setFilterStatus] = useState<Status>("all")

    // Sorting
    const [sortField, setSortField] = useState<SortField>("date")
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

    // Fetch transactions with auto-refresh for pending
    const { data: transactions = [], isLoading, refetch } = useTransactionHistory(
        ITEMS_PER_PAGE * 5, // Fetch more to allow client-side filtering
        0
    )

    // Auto-refresh for pending transactions
    useEffect(() => {
        const hasPending = transactions.some(tx => tx.status === "pending")
        if (!hasPending) return

        const interval = setInterval(() => {
            refetch()
        }, AUTO_REFRESH_INTERVAL)

        return () => clearInterval(interval)
    }, [transactions, refetch])

    // Filter transactions
    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            if (filterType !== "all" && tx.operationType !== filterType) return false
            if (filterProtocol !== "all" && tx.protocol !== filterProtocol) return false
            if (filterStatus !== "all" && tx.status !== filterStatus) return false
            return true
        })
    }, [transactions, filterType, filterProtocol, filterStatus])

    // Sort transactions
    const sortedTransactions = useMemo(() => {
        const sorted = [...filteredTransactions]

        sorted.sort((a, b) => {
            let comparison = 0

            switch (sortField) {
                case "date":
                    comparison = new Date(a.executedAt).getTime() - new Date(b.executedAt).getTime()
                    break
                case "amount":
                    comparison = parseFloat(a.amount) - parseFloat(b.amount)
                    break
                case "gas":
                    comparison = parseFloat(a.gasCostUsd || "0") - parseFloat(b.gasCostUsd || "0")
                    break
            }

            return sortDirection === "asc" ? comparison : -comparison
        })

        return sorted
    }, [filteredTransactions, sortField, sortDirection])

    // Paginate
    const paginatedTransactions = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        const end = start + ITEMS_PER_PAGE
        return sortedTransactions.slice(start, end)
    }, [sortedTransactions, currentPage])

    const totalPages = Math.ceil(sortedTransactions.length / ITEMS_PER_PAGE)

    // Handle sort
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("desc")
        }
    }

    // Handle copy hash
    const handleCopyHash = (hash: string) => {
        navigator.clipboard.writeText(hash)
        toast.success("Transaction hash copied!", { duration: 2000 })
    }

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [filterType, filterProtocol, filterStatus])

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-gray-600" />
                    <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
                    <span className="text-sm text-gray-500">({sortedTransactions.length} total)</span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                {/* Operation Type Filter */}
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as OperationType)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">All Types</option>
                    <option value="deposit">Deposits</option>
                    <option value="withdrawal">Withdrawals</option>
                    <option value="approval">Approvals</option>
                </select>

                {/* Protocol Filter */}
                <select
                    value={filterProtocol}
                    onChange={(e) => setFilterProtocol(e.target.value as Protocol)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">All Protocols</option>
                    <option value="aave">AAVE</option>
                    <option value="compound">Compound</option>
                    <option value="morpho">Morpho</option>
                </select>

                {/* Status Filter */}
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as Status)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="failed">Failed</option>
                </select>
            </div>

            {/* Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Transaction
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Protocol
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900"
                                    onClick={() => handleSort("amount")}
                                >
                                    Amount {sortField === "amount" && (sortDirection === "asc" ? "↑" : "↓")}
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900"
                                    onClick={() => handleSort("gas")}
                                >
                                    Gas {sortField === "gas" && (sortDirection === "asc" ? "↑" : "↓")}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th
                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-gray-900"
                                    onClick={() => handleSort("date")}
                                >
                                    Date {sortField === "date" && (sortDirection === "asc" ? "↑" : "↓")}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                // Loading skeleton
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-4 py-4">
                                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : paginatedTransactions.length === 0 ? (
                                // Empty state
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <History className="w-12 h-12 text-gray-300" />
                                            <p className="text-gray-500 font-medium">No transactions found</p>
                                            <p className="text-sm text-gray-400">
                                                {filterType !== "all" || filterProtocol !== "all" || filterStatus !== "all"
                                                    ? "Try adjusting your filters"
                                                    : "Your transactions will appear here"}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                // Transaction rows
                                paginatedTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                        {/* Transaction Hash */}
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <code className="text-xs font-mono text-gray-900">
                                                    {tx.txHash.slice(0, 6)}...{tx.txHash.slice(-4)}
                                                </code>
                                                <button
                                                    onClick={() => handleCopyHash(tx.txHash)}
                                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                                    title="Copy full hash"
                                                >
                                                    <Copy className="w-3.5 h-3.5" />
                                                </button>
                                                <a
                                                    href={`https://basescan.org/tx/${tx.txHash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                                    title="View on BaseScan"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                        </td>

                                        {/* Type */}
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                {tx.operationType === "deposit" ? (
                                                    <>
                                                        <ArrowUpFromLine className="w-4 h-4 text-green-600" />
                                                        <span className="text-sm text-gray-900">Deposit</span>
                                                    </>
                                                ) : tx.operationType === "withdrawal" ? (
                                                    <>
                                                        <ArrowDownToLine className="w-4 h-4 text-blue-600" />
                                                        <span className="text-sm text-gray-900">Withdrawal</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 className="w-4 h-4 text-gray-600" />
                                                        <span className="text-sm text-gray-900">Approval</span>
                                                    </>
                                                )}
                                            </div>
                                        </td>

                                        {/* Protocol */}
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: PROTOCOL_INFO[tx.protocol].color }}
                                                />
                                                <span className="text-sm text-gray-900">
                                                    {PROTOCOL_INFO[tx.protocol].name}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Amount */}
                                        <td className="px-4 py-4">
                                            <span className="text-sm font-medium text-gray-900">
                                                ${parseFloat(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                            <span className="text-xs text-gray-500 ml-1">{tx.tokenSymbol}</span>
                                        </td>

                                        {/* Gas Cost */}
                                        <td className="px-4 py-4">
                                            <span className="text-sm text-gray-600">
                                                {tx.gasCostUsd ? `$${parseFloat(tx.gasCostUsd).toFixed(2)}` : "-"}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-4">
                                            {tx.status === "pending" ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    <Clock className="w-3 h-3 animate-pulse" />
                                                    Pending
                                                </span>
                                            ) : tx.status === "confirmed" ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Confirmed
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    <XCircle className="w-3 h-3" />
                                                    Failed
                                                </span>
                                            )}
                                        </td>

                                        {/* Date */}
                                        <td className="px-4 py-4">
                                            <div className="text-sm text-gray-900">
                                                {formatRelativeTime(new Date(tx.executedAt))}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(tx.executedAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {!isLoading && paginatedTransactions.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                        {Math.min(currentPage * ITEMS_PER_PAGE, sortedTransactions.length)} of{" "}
                        {sortedTransactions.length} transactions
                    </p>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </Button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                // Show first page, last page, current page, and neighbors
                                let pageNum: number
                                if (totalPages <= 5) {
                                    pageNum = i + 1
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i
                                } else {
                                    pageNum = currentPage - 2 + i
                                }

                                return (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                            currentPage === pageNum
                                                ? "bg-blue-600 text-white"
                                                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                )
                            })}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
