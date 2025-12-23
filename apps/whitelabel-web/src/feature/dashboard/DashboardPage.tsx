/**
 * Dashboard Page - Tab-based layout
 * Refactored to show Client Overview, End-Users, and Portfolio tabs
 */

import { useState } from "react"

import { EnvironmentSelector } from "@/components/EnvironmentSelector"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUserStore } from "@/store/userStore"

import ClientOverviewTab from "./tabs/ClientOverviewTab"
import EndUsersTab from "./tabs/EndUsersTab"

export default function DashboardPage() {
	const [activeTab, setActiveTab] = useState("overview")
	const { organizations, activeProductId, isOrganizationsLoaded } = useUserStore()

	// Use first product as default for end-users tab if no active product
	const selectedProductId = activeProductId || organizations[0]?.productId

	// Loading state: Show while organizations are being fetched
	if (!isOrganizationsLoaded) {
		return (
			<div className="min-h-full bg-white flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
					<h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard...</h2>
					<p className="text-gray-500">Fetching your organizations</p>
				</div>
			</div>
		)
	}

	// Empty state: Show only after loading is complete and no organizations exist
	if (organizations.length === 0) {
		return (
			<div className="min-h-full bg-white flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-xl font-semibold text-gray-900 mb-2">No Organizations Found</h2>
					<p className="text-gray-500">Please create a product to view dashboard</p>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-full bg-white">
			<div className="max-w-[1400px] mx-auto px-6 py-8">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-[32px] font-bold text-gray-950">Dashboard</h1>
						<p className="text-sm text-gray-500 mt-1">
							All Products • {organizations.length} {organizations.length === 1 ? "Product" : "Products"}
						</p>
					</div>
					{/* ✅ Environment Selector - switch between sandbox/production */}
					<EnvironmentSelector />
				</div>

				{/* Tabs */}
				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="mb-6">
						<TabsTrigger value="overview">Client Overview</TabsTrigger>
						<TabsTrigger value="end-users">End-Users Activity</TabsTrigger>
					</TabsList>

					<TabsContent value="overview" className="mt-0">
						<ClientOverviewTab mode="aggregate" />
					</TabsContent>

					<TabsContent value="end-users" className="mt-0">
						<EndUsersTab mode="single" productId={selectedProductId} />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	)
}
