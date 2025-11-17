import { usePrivy } from '@privy-io/react-auth'
import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { LogIn, Wallet, Mail } from 'lucide-react'

export function LoginPage() {
	const { login, authenticated, ready } = usePrivy()
	const navigate = useNavigate()

	useEffect(() => {
		if (ready && authenticated) {
			navigate({ to: '/dashboard' })
		}
	}, [ready, authenticated, navigate])

	const handleLogin = () => {
		login()
	}

	return (
		<div className="min-h-screen bg-white flex items-center justify-center p-6">
			<div className="w-full max-w-md">
				{/* Logo */}
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-gray-900 mb-2">PROXIFY</h1>
					<p className="text-gray-600">Access your embedded wallet dashboard</p>
				</div>

				{/* Login Card */}
				<div className="bg-white border-2 border-gray-100 rounded-3xl p-8 shadow-sm">
					<h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
					<p className="text-gray-600 mb-8">Sign in to continue to your dashboard</p>

					{/* Privy Login Button */}
					<button
						onClick={handleLogin}
						disabled={!ready}
						className="w-full bg-primary-500 text-white py-4 rounded-xl hover:bg-primary-600 transition-all font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
					>
						<LogIn className="w-5 h-5" />
						{ready ? 'Sign In' : 'Loading...'}
					</button>

					{/* Divider */}
					<div className="relative my-8">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-200"></div>
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="px-4 bg-white text-gray-500">Login methods available</span>
						</div>
					</div>

					{/* Features */}
					<div className="space-y-4">
						<div className="flex items-start gap-3">
							<div className="bg-primary-100 p-2 rounded-lg">
								<Mail className="w-5 h-5 text-primary-600" />
							</div>
							<div className="flex-1">
								<h3 className="font-semibold text-gray-900">Email & Social</h3>
								<p className="text-sm text-gray-600">Login with email or Google</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<div className="bg-blue-100 p-2 rounded-lg">
								<Wallet className="w-5 h-5 text-blue-600" />
							</div>
							<div className="flex-1">
								<h3 className="font-semibold text-gray-900">Web3 Wallet</h3>
								<p className="text-sm text-gray-600">Connect with MetaMask, WalletConnect</p>
							</div>
						</div>
					</div>
				</div>

				{/* Back to Home */}
				<div className="text-center mt-6">
					<button
						onClick={() => navigate({ to: '/' })}
						className="text-gray-600 hover:text-gray-900 transition-colors"
					>
						← Back to home
					</button>
				</div>
			</div>
		</div>
	)
}
