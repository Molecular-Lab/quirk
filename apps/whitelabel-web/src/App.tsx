import { RouterProvider, createRouter } from "@tanstack/react-router"

import { routeTree } from "./routeTree.gen"

import "./index.css"
import { Toaster } from "sonner"

// Create a new router instance
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router
	}
}

function App() {
	return (
		<>
			<RouterProvider router={router} />
			<Toaster
				position="top-right"
				toastOptions={{
					duration: 4000,
					style: {
						background: "white",
						color: "#1f2937",
						borderRadius: "16px",
						border: "1px solid #e5e7eb",
						boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
					},
				}}
			/>
		</>
	)
}

export default App
