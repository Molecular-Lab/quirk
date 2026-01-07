/**
 * ProtocolCard - Toggleable card showing protocol metrics
 * Can switch between Overview (APY, TVL) and Raw Data (all metrics)
 */

import { useState } from "react"

import type { ProtocolData } from "../../hooks/useDeFiProtocols"

// Protocol logos
import aaveLogo from "../../assets/aave-aave-logo.svg"
import compoundLogo from "../../assets/compound-comp-logo.svg"
import morphoLogo from "../../assets/Morpho-token-icon.svg"

const PROTOCOL_LOGOS: Record<string, string> = {
	aave: aaveLogo,
	compound: compoundLogo,
	morpho: morphoLogo,
}

interface ProtocolCardProps {
	data: ProtocolData
	onSelect?: () => void
}

export function ProtocolCard({ data }: ProtocolCardProps) {
	const [viewMode, setViewMode] = useState<"overview" | "raw">("overview")

	// Format protocol name
	const protocolName = data.protocol === "aave" ? "Aave V3" : data.protocol === "compound" ? "Compound V3" : "Morpho"

	// Format TVL
	const tvlFormatted = `$${(parseFloat(data.tvl) / 1_000_000).toFixed(1)}M`

	return (
		<div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-all group">
			{/* Header */}
			<div className="p-4 border-b border-gray-200">
				<div className="flex justify-between items-start mb-2">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden group-hover:bg-gray-200 transition-colors">
							{PROTOCOL_LOGOS[data.protocol] ? (
								<img
									src={PROTOCOL_LOGOS[data.protocol]}
									alt={`${protocolName} logo`}
									className="w-full h-full object-cover"
								/>
							) : (
								<span className="text-lg font-bold text-gray-700">{protocolName[0]}</span>
							)}
						</div>
						<div>
							<h3 className="font-bold text-gray-900">{protocolName}</h3>
							<span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">Lending</span>
						</div>
					</div>
					<div
						className={`text-xs font-medium px-2 py-1 rounded-full ${
							data.risk === "Low"
								? "bg-emerald-50 text-emerald-700 border border-emerald-200"
								: data.risk === "Medium"
									? "bg-amber-50 text-amber-700 border border-amber-200"
									: "bg-rose-50 text-rose-700 border border-rose-200"
						}`}
					>
						{data.risk} Risk
					</div>
				</div>

				{/* Toggle Button */}
				<button
					onClick={() => {
						setViewMode(viewMode === "overview" ? "raw" : "overview")
					}}
					className="text-xs text-blue-500 hover:text-blue-600 transition-colors"
				>
					{viewMode === "overview" ? "→ Show Raw Data" : "← Show Overview"}
				</button>
			</div>

			{/* Content */}
			<div className="p-4">{viewMode === "overview" ? <OverviewView data={data} /> : <RawDataView data={data} />}</div>

			{/* Footer */}
			<div className="px-4 pb-4 pt-2 border-t border-gray-100 flex justify-between items-center">
				<span className="text-xs text-gray-500">TVL: {tvlFormatted}</span>
				<div className="flex items-center gap-2">
					<span
						className={`text-xs font-medium ${
							data.status === "healthy"
								? "text-emerald-600"
								: data.status === "warning"
									? "text-amber-600"
									: "text-rose-600"
						}`}
					>
						{data.status === "healthy" ? "✓" : data.status === "warning" ? "⚠" : "✗"} {data.status}
					</span>
				</div>
			</div>
		</div>
	)
}

function OverviewView({ data }: { data: ProtocolData }) {
	return (
		<div className="space-y-3">
			{/* APY - Large and prominent */}
			<div>
				<p className="text-xs text-gray-500 mb-0.5">Supply APY</p>
				<p className="text-3xl font-bold text-emerald-600">{parseFloat(data.supplyAPY).toFixed(2)}%</p>
			</div>

			{/* Other metrics */}
			<div className="grid grid-cols-2 gap-3">
				<div>
					<p className="text-xs text-gray-500 mb-0.5">Liquidity</p>
					<p className="text-sm font-bold text-gray-800">${(parseFloat(data.liquidity) / 1_000_000).toFixed(1)}M</p>
				</div>
				<div>
					<p className="text-xs text-gray-500 mb-0.5">Utilization</p>
					<p className="text-sm font-bold text-gray-800">{parseFloat(data.utilization).toFixed(1)}%</p>
				</div>
			</div>

			{/* Protocol Health */}
			<div>
				<div className="flex justify-between items-center mb-1">
					<p className="text-xs text-gray-500">Protocol Health</p>
					<p className="text-xs font-bold text-gray-800">{data.protocolHealth}/100</p>
				</div>
				<div className="w-full bg-gray-200 rounded-full h-2">
					<div
						className={`h-2 rounded-full transition-all ${
							data.protocolHealth >= 80 ? "bg-emerald-400" : data.protocolHealth >= 60 ? "bg-amber-400" : "bg-rose-400"
						}`}
						style={{ width: `${data.protocolHealth}%` }}
					></div>
				</div>
			</div>
		</div>
	)
}

function RawDataView({ data }: { data: ProtocolData }) {
	return (
		<div className="space-y-2 max-h-[300px] overflow-y-auto text-xs">
			<div className="grid grid-cols-2 gap-2">
				<div>
					<p className="text-gray-500">Protocol</p>
					<p className="text-gray-800 font-mono">{data.protocol}</p>
				</div>
				<div>
					<p className="text-gray-500">Token</p>
					<p className="text-gray-800 font-mono">{data.token}</p>
				</div>
				<div>
					<p className="text-gray-500">Chain ID</p>
					<p className="text-gray-800 font-mono">{data.chainId}</p>
				</div>
				<div>
					<p className="text-gray-500">Supply APY</p>
					<p className="text-emerald-600 font-mono">{data.supplyAPY}%</p>
				</div>
				{data.borrowAPY && (
					<div>
						<p className="text-gray-500">Borrow APY</p>
						<p className="text-rose-500 font-mono">{data.borrowAPY}%</p>
					</div>
				)}
				<div>
					<p className="text-gray-500">TVL</p>
					<p className="text-gray-800 font-mono">{parseFloat(data.tvl).toFixed(2)}</p>
				</div>
				<div>
					<p className="text-gray-500">Liquidity</p>
					<p className="text-gray-800 font-mono">{parseFloat(data.liquidity).toFixed(2)}</p>
				</div>
				<div>
					<p className="text-gray-500">Total Supplied</p>
					<p className="text-gray-800 font-mono">{parseFloat(data.totalSupplied).toFixed(2)}</p>
				</div>
				{data.totalBorrowed && (
					<div>
						<p className="text-gray-500">Total Borrowed</p>
						<p className="text-gray-800 font-mono">{parseFloat(data.totalBorrowed).toFixed(2)}</p>
					</div>
				)}
				<div>
					<p className="text-gray-500">Utilization</p>
					<p className="text-gray-800 font-mono">{data.utilization}%</p>
				</div>
				<div>
					<p className="text-gray-500">Risk</p>
					<p
						className={`font-mono ${
							data.risk === "Low" ? "text-emerald-600" : data.risk === "Medium" ? "text-amber-600" : "text-rose-600"
						}`}
					>
						{data.risk}
					</p>
				</div>
				<div>
					<p className="text-gray-500">Status</p>
					<p
						className={`font-mono ${
							data.status === "healthy"
								? "text-emerald-600"
								: data.status === "warning"
									? "text-amber-600"
									: "text-rose-600"
						}`}
					>
						{data.status}
					</p>
				</div>
				<div>
					<p className="text-gray-500">Health Score</p>
					<p className="text-gray-800 font-mono">{data.protocolHealth}/100</p>
				</div>
				<div className="col-span-2">
					<p className="text-gray-500">Last Update</p>
					<p className="text-gray-800 font-mono">{new Date(data.lastUpdate).toLocaleString()}</p>
				</div>
			</div>

			{/* Raw Metrics JSON (if available) */}
			{data.rawMetrics && (
				<details className="mt-4">
					<summary className="text-blue-500 cursor-pointer hover:text-blue-600">View Full Raw Metrics (JSON)</summary>
					<pre className="mt-2 p-2 bg-gray-100 rounded text-[10px] overflow-x-auto text-gray-700">
						{JSON.stringify(data.rawMetrics, null, 2)}
					</pre>
				</details>
			)}
		</div>
	)
}
