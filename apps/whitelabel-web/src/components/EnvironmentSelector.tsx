import { Check, ChevronDown, Flame, Globe } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { ENV_CONFIG, useEnvironmentStore } from "@/store/environmentStore"

export function EnvironmentSelector() {
	const { environment, setEnvironment, isEnabled } = useEnvironmentStore()
	const currentConfig = ENV_CONFIG[environment]

	const environments: { key: "dev" | "prod"; label: string; subtitle: string; icon: typeof Globe }[] = [
		{ key: "dev", label: "Sandbox", subtitle: "Test mode with testnet", icon: Flame },
		{ key: "prod", label: "Production", subtitle: "Live mode with mainnet", icon: Globe },
	]

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className={cn(
						"flex items-center gap-2",
						environment === "dev"
							? "border-orange-500 bg-orange-50 text-orange-700"
							: "border-green-600 bg-green-50 text-green-700",
					)}
				>
					{environment === "dev" ? <Flame className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
					<span className="font-semibold">{environment === "dev" ? "Sandbox" : "Production"}</span>
					<ChevronDown className="h-4 w-4 opacity-50" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-64">
				<DropdownMenuLabel>Select Environment</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{environments.map(({ key, label, subtitle, icon: Icon }) => {
					const isCurrentEnv = environment === key
					const enabled = isEnabled(key)

					return (
						<DropdownMenuItem
							key={key}
							onClick={() => {
								if (enabled) {
									setEnvironment(key)
								}
							}}
							disabled={!enabled}
							className={cn("flex items-center justify-between", !enabled && "opacity-50 cursor-not-allowed")}
						>
							<div className="flex items-center gap-3">
								<Icon className="h-4 w-4" />
								<div className="flex flex-col">
									<span className="font-medium">{label}</span>
									<span className="text-xs text-gray-500">{subtitle}</span>
								</div>
							</div>
							<div className="flex items-center gap-2">
								{!enabled && <span className="text-xs text-gray-400">Soon</span>}
								{isCurrentEnv && enabled && <Check className="h-4 w-4 text-green-600" />}
							</div>
						</DropdownMenuItem>
					)
				})}
				<DropdownMenuSeparator />
				<div className="px-2 py-1.5 text-xs text-gray-500">
					Chain ID: {currentConfig.chainId}
					{!currentConfig.enabled && " (Disabled)"}
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
