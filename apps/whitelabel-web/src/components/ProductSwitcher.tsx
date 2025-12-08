import { useNavigate } from "@tanstack/react-router"
import { Check, ChevronDown, Plus } from "lucide-react"

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUserStore } from "@/store/userStore"

export function ProductSwitcher() {
	const navigate = useNavigate()
	const { organizations, activeProductId, setActiveOrganization } = useUserStore()

	const activeOrg = organizations.find((org) => org.productId === activeProductId)

	const handleProductSwitch = (productId: string) => {
		setActiveOrganization(productId)
	}

	const handleCreateNew = () => {
		void navigate({ to: "/onboarding/create-product" })
	}

	if (organizations.length === 0) {
		return null
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 bg-green-500 rounded-full" />
						<span className="text-sm font-medium text-gray-900">{activeOrg?.companyName || "Select Product"}</span>
					</div>
					<ChevronDown className="w-4 h-4 text-gray-500" />
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="w-64">
				<div className="max-h-64 overflow-y-auto">
					{organizations.map((org) => {
						const isActive = org.productId === activeProductId
						return (
							<DropdownMenuItem
								key={org.productId}
								onClick={() => {
									handleProductSwitch(org.productId)
								}}
								className="flex items-center justify-between cursor-pointer"
							>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-gray-900 truncate">{org.companyName}</p>
									<p className="text-xs text-gray-500 truncate">{org.productId}</p>
								</div>
								{isActive && <Check className="w-4 h-4 text-blue-500 flex-shrink-0 ml-2" />}
							</DropdownMenuItem>
						)
					})}
				</div>

				<DropdownMenuSeparator />

				<DropdownMenuItem onClick={handleCreateNew} className="text-blue-600 cursor-pointer">
					<Plus className="w-4 h-4 mr-2" />
					<span className="text-sm font-medium">Create New Product</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
