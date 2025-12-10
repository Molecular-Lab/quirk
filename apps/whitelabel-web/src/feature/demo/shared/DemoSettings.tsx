import { useState } from "react"

import { Check, Settings, RefreshCw } from "lucide-react"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { InfoDialog } from "@/components/ui/info-dialog"
import { useClientContextStore } from "@/store/clientContextStore"
import { useDemoStore } from "@/store/demoStore"
import { useDemoProductStore } from "@/store/demoProductStore"
import { getAllPersonas, type PersonaType } from "@/feature/demo/personas"

export function DemoSettings() {
	const [isOpen, setIsOpen] = useState(false)
	const [productConfirmDialog, setProductConfirmDialog] = useState<{
		open: boolean
		productId: string
		productName: string
	}>({ open: false, productId: "", productName: "" })
	const [personaConfirmDialog, setPersonaConfirmDialog] = useState<{
		open: boolean
		persona: PersonaType | null
		personaName: string
	}>({ open: false, persona: null, personaName: "" })
	const [apiKeyErrorDialog, setApiKeyErrorDialog] = useState<{
		open: boolean
		productName: string
	}>({ open: false, productName: "" })

	const { productId: currentProductId } = useClientContextStore()
	const { selectedPersona, personaData, setPersona } = useDemoStore()
	const { selectedProduct, selectedProductId, visualizationType, availableProducts, selectProduct } = useDemoProductStore()

	const personas = getAllPersonas()

	const handleProductChange = (newProductId: string) => {
		if (newProductId === selectedProductId) return

		const product = availableProducts.find((p) => p.productId === newProductId)
		setProductConfirmDialog({
			open: true,
			productId: newProductId,
			productName: product?.companyName || newProductId,
		})
	}

	const confirmProductChange = () => {
		const { productId: newProductId } = productConfirmDialog

		// Load API key for this product from localStorage
		const allKeys = JSON.parse(localStorage.getItem("b2b:api_keys") || "{}")
		const apiKey = allKeys[newProductId]

		if (!apiKey) {
			const product = availableProducts.find((p) => p.productId === newProductId)
			setProductConfirmDialog({ open: false, productId: "", productName: "" })
			setApiKeyErrorDialog({
				open: true,
				productName: product?.companyName || newProductId,
			})
			return
		}

		// Select product with API key
		selectProduct(newProductId, apiKey)

		// Reload demo to apply changes
		window.location.reload()
	}

	const handlePersonaChange = (newPersona: PersonaType) => {
		if (newPersona === selectedPersona) return

		setPersonaConfirmDialog({
			open: true,
			persona: newPersona,
			personaName: newPersona === "bob" ? "Bob" : "Alice",
		})
	}

	const confirmPersonaChange = () => {
		const { persona: newPersona } = personaConfirmDialog
		if (!newPersona) return

		// Get product info for generating persona user ID
		const productName = selectedProduct?.companyName || "demo"
		const visualizationTypeValue = visualizationType || "ecommerce"

		// Update persona in store
		setPersona(newPersona, productName, visualizationTypeValue)

		// Reload demo to apply changes
		window.location.reload()
	}

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				<button
					className="fixed bottom-6 right-6 p-4 bg-gray-900 hover:bg-gray-800 text-white rounded-full shadow-lg transition-all z-50"
					title="Demo Settings"
				>
					<Settings className="w-6 h-6" />
				</button>
			</SheetTrigger>

			<SheetContent side="right" className="w-96">
				<SheetHeader>
					<SheetTitle className="text-lg font-bold text-gray-900">Demo Settings</SheetTitle>
				</SheetHeader>

				<div className="space-y-6 mt-6">
					{/* Product Selector */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
						<Select value={selectedProductId ?? undefined} onValueChange={handleProductChange}>
							<SelectTrigger>
								<SelectValue placeholder="Select a product..." />
							</SelectTrigger>
							<SelectContent>
								{availableProducts.map((product) => (
									<SelectItem key={product.productId} value={product.productId}>
										<div className="flex flex-col">
											<span className="font-medium">{product.companyName}</span>
											<span className="text-xs text-gray-500">{product.productId}</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
							<RefreshCw className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
							<p className="text-xs text-yellow-800">Switching product will reload the demo</p>
						</div>
					</div>

					{/* Selected Product Info */}
					{selectedProduct && (
						<div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
							<h4 className="text-sm font-semibold text-gray-950 mb-3">Current Product</h4>
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="text-gray-600">Company:</span>
									<span className="font-medium text-gray-950">{selectedProduct.companyName}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Product ID:</span>
									<span className="font-mono text-xs text-gray-700">{selectedProduct.productId}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Type:</span>
									<span className="text-gray-700">{selectedProduct.businessType}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Status:</span>
									<span className={`${selectedProduct.isActive ? "text-green-600" : "text-gray-500"} font-medium`}>
										{selectedProduct.isActive ? "Active" : "Inactive"}
									</span>
								</div>
							</div>
						</div>
					)}

					{/* Persona Selector */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Demo Persona</label>
						<div className="space-y-2">
							{personas.map((persona) => (
								<button
									key={persona.id}
									type="button"
									onClick={() => handlePersonaChange(persona.id)}
									className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
										selectedPersona === persona.id
											? "border-blue-500 bg-blue-50"
											: "border-gray-200 hover:border-gray-300 bg-white"
									}`}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<span className="text-2xl">{persona.avatar}</span>
											<div>
												<p className="font-medium text-gray-900">{persona.name}</p>
												<p className="text-xs text-gray-500">{persona.email}</p>
											</div>
										</div>
										<div className="text-right">
											<p className="text-sm font-semibold text-gray-900">
												${persona.balance.toLocaleString()}
											</p>
											<p className="text-xs text-gray-500">{persona.riskProfile}</p>
										</div>
									</div>
									{selectedPersona === persona.id && personaData && (
										<p className="text-xs text-blue-600 mt-2 font-mono">
											ID: {personaData.clientUserId}
										</p>
									)}
								</button>
							))}
						</div>
						{selectedPersona && (
							<div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
								<RefreshCw className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
								<p className="text-xs text-yellow-800">Switching persona will reload the demo</p>
							</div>
						)}
					</div>
				</div>
			</SheetContent>

			{/* Product Change Confirmation Dialog */}
			<ConfirmDialog
				open={productConfirmDialog.open}
				onOpenChange={(open) =>
					setProductConfirmDialog({ open, productId: "", productName: "" })
				}
				title={`Switch to ${productConfirmDialog.productName}?`}
				description="This will reload the demo and reset all progress."
				onConfirm={confirmProductChange}
				confirmText="Switch Product"
			/>

			{/* Persona Change Confirmation Dialog */}
			<ConfirmDialog
				open={personaConfirmDialog.open}
				onOpenChange={(open) =>
					setPersonaConfirmDialog({ open, persona: null, personaName: "" })
				}
				title={`Switch to ${personaConfirmDialog.personaName}?`}
				description="This will reload the demo and reset all progress."
				onConfirm={confirmPersonaChange}
				confirmText="Switch Persona"
			/>

			{/* API Key Error Dialog */}
			<InfoDialog
				open={apiKeyErrorDialog.open}
				onOpenChange={(open) => setApiKeyErrorDialog({ open, productName: "" })}
				title="⚠️ API Key Not Found"
				description={`API key not found for ${apiKeyErrorDialog.productName}.\n\nPlease go to Dashboard → API Testing to view or regenerate your API key first.`}
			/>
		</Sheet>
	)
}
