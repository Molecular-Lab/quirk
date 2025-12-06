import { useState } from "react"

import { useNavigate } from "@tanstack/react-router"
import { Check, ChevronDown, Plus } from "lucide-react"

import { useUserStore } from "@/store/userStore"

export function ProductSwitcher() {
	const navigate = useNavigate()
	const [isOpen, setIsOpen] = useState(false)
	const { organizations, activeProductId, setActiveOrganization } = useUserStore()

	const activeOrg = organizations.find((org) => org.productId === activeProductId)

	const handleProductSwitch = (productId: string) => {
		setActiveOrganization(productId)
		setIsOpen(false)
	}

	const handleCreateNew = () => {
		setIsOpen(false)
		void navigate({ to: "/onboarding/create-product" })
	}

	if (organizations.length === 0) {
		return null
	}

	return (
		<div className="relative">
			{/* Trigger Button */}
			<button
				onClick={() => {
					setIsOpen(!isOpen)
				}}
				className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
			>
				<div className="flex items-center gap-2">
					<div className="w-2 h-2 bg-green-500 rounded-full" />
					<span className="text-sm font-medium text-gray-900">{activeOrg?.companyName || "Select Product"}</span>
				</div>
				<ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
			</button>

			{/* Dropdown Menu */}
			{isOpen && (
				<>
					{/* Backdrop */}
					<div
						className="fixed inset-0 z-40"
						onClick={() => {
							setIsOpen(false)
						}}
					/>

					{/* Menu */}
					<div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
						{/* Product List */}
						<div className="p-2 max-h-64 overflow-y-auto">
							{organizations.map((org) => {
								const isActive = org.productId === activeProductId
								return (
									<button
										key={org.productId}
										onClick={() => {
											handleProductSwitch(org.productId)
										}}
										className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
									>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-gray-900 truncate">{org.companyName}</p>
											<p className="text-xs text-gray-500 truncate">{org.productId}</p>
										</div>
										{isActive && <Check className="w-4 h-4 text-blue-500 flex-shrink-0 ml-2" />}
									</button>
								)
							})}
						</div>

						{/* Divider */}
						<div className="border-t border-gray-200" />

						{/* Create New Product */}
						<div className="p-2">
							<button
								onClick={handleCreateNew}
								className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
							>
								<Plus className="w-4 h-4" />
								<span className="text-sm font-medium">Create New Product</span>
							</button>
						</div>
					</div>
				</>
			)}
		</div>
	)
}
