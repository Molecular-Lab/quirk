import { useState } from "react"

import { Link } from "@tanstack/react-router"
import { Menu, X } from "lucide-react"

import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTrigger } from "@/components/ui/drawer"

interface MobileMenuProps {
	onSignIn: () => Promise<void>
}

export function MobileMenu({ onSignIn }: MobileMenuProps) {
	const [open, setOpen] = useState(false)

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger asChild>
				<button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Open menu">
					<Menu className="w-6 h-6 text-gray-900" />
				</button>
			</DrawerTrigger>

			<DrawerContent>
				<DrawerHeader className="text-left">
					<DrawerClose asChild>
						<button className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100">
							<X className="h-4 w-4" />
							<span className="sr-only">Close</span>
						</button>
					</DrawerClose>
				</DrawerHeader>

				<nav className="flex flex-col gap-4 p-6">
					{/* Home Link */}
					<Link
						to="/"
						onClick={() => {
							setOpen(false)
						}}
						className="text-lg font-medium text-gray-900 hover:text-gray-600 transition-colors py-2"
					>
						Home
					</Link>

					{/* Demo Link */}
					<Link
						to="/demo"
						onClick={() => {
							setOpen(false)
						}}
						className="text-lg font-medium text-gray-900 hover:text-gray-600 transition-colors py-2"
					>
						Demo
					</Link>

					{/* Log In */}
					<button
						onClick={async () => {
							setOpen(false)
							await onSignIn()
						}}
						className="text-lg font-medium text-gray-900 hover:text-gray-600 transition-colors py-2 text-left"
					>
						Log In
					</button>

					{/* Get in Touch */}
					<Link
						to="/contact"
						onClick={() => {
							setOpen(false)
						}}
					>
						<button className="w-full bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-all font-medium shadow-sm text-lg">
							Get in Touch
						</button>
					</Link>
				</nav>
			</DrawerContent>
		</Drawer>
	)
}
