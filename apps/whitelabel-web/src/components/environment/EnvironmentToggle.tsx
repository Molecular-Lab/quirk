import { useState } from "react"
import { AlertTriangle, Shield } from "lucide-react"

import { useEnvironmentStore } from "@/store/environmentStore"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function EnvironmentToggle() {
	const { toggleApiEnvironment, isSandbox } = useEnvironmentStore()
	const [showConfirmDialog, setShowConfirmDialog] = useState(false)

	const handleToggle = () => {
		// If switching TO production, show confirmation dialog
		if (isSandbox()) {
			setShowConfirmDialog(true)
		} else {
			// Switching back to sandbox, no confirmation needed
			toggleApiEnvironment()
		}
	}

	const confirmProductionSwitch = () => {
		toggleApiEnvironment()
		setShowConfirmDialog(false)
	}

	return (
		<>
			<div className="flex items-center gap-3 px-4 py-2 rounded-lg border border-gray-200 bg-white">
				{/* Environment indicator badge */}
				<div
					className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium text-sm ${
						isSandbox()
							? "bg-yellow-50 text-yellow-700 border border-yellow-200"
							: "bg-red-50 text-red-700 border border-red-200"
					}`}
				>
					{isSandbox() ? (
						<>
							<Shield className="w-4 h-4" />
							<span>Sandbox Mode</span>
						</>
					) : (
						<>
							<AlertTriangle className="w-4 h-4" />
							<span>Production Mode</span>
						</>
					)}
				</div>

				{/* Toggle switch */}
				<div className="flex items-center gap-2">
					<Label htmlFor="environment-toggle" className="text-sm text-gray-600 cursor-pointer">
						Enable Production
					</Label>
					<Switch id="environment-toggle" checked={!isSandbox()} onCheckedChange={handleToggle} />
				</div>
			</div>

			{/* Production mode warning banner (shown when in production) */}
			{!isSandbox() && (
				<div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200">
					<AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
					<div className="flex-1">
						<p className="text-sm font-semibold text-red-900">Production Mode Active</p>
						<p className="text-xs text-red-700 mt-1">
							You are using LIVE API keys. All transactions will use real funds on the production network.
						</p>
					</div>
				</div>
			)}

			{/* Confirmation dialog for switching to production */}
			<AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2">
							<AlertTriangle className="w-5 h-5 text-red-600" />
							Switch to Production Mode?
						</AlertDialogTitle>
						<AlertDialogDescription className="space-y-3">
							<p>You are about to enable <strong>Production Mode</strong>. This will:</p>
							<ul className="list-disc list-inside space-y-1 text-sm">
								<li>Use <strong>live API keys</strong> (pk_live_xxx)</li>
								<li>Process transactions on the <strong>production network</strong></li>
								<li>Use <strong>real USDC</strong> and incur real gas fees</li>
								<li>Affect <strong>real user funds</strong></li>
							</ul>
							<p className="text-red-600 font-semibold">
								⚠️ Only enable production mode when you're ready to handle real money!
							</p>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmProductionSwitch}
							className="bg-red-600 hover:bg-red-700 text-white"
						>
							Enable Production Mode
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	)
}
