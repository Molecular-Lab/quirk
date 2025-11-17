import { useState } from 'react'
import { Building2, Mail, Globe, Phone, Bell, Shield, Palette, Save } from 'lucide-react'

export function SettingsPage() {
	const [settings, setSettings] = useState({
		companyName: 'Demo Company',
		email: 'demo@company.com',
		website: 'https://democompany.com',
		phone: '+1 (555) 123-4567',
		emailNotifications: true,
		securityAlerts: true,
		weeklyReports: false,
		twoFactorAuth: false,
		primaryColor: '#3b82f6',
		webhookUrl: '',
	})

	const [saved, setSaved] = useState(false)

	const updateSetting = (key: keyof typeof settings, value: any) => {
		setSettings((prev) => ({ ...prev, [key]: value }))
	}

	const handleSave = () => {
		// TODO: Save settings to API
		console.log('Saving settings:', settings)
		setSaved(true)
		setTimeout(() => setSaved(false), 3000)
	}

	return (
		<div className="p-6 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Settings</h1>
					<p className="text-gray-600 mt-1">
						Manage your account and preferences
					</p>
				</div>
				<button
					onClick={handleSave}
					className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
				>
					<Save className="w-4 h-4" />
					{saved ? 'Saved!' : 'Save Changes'}
				</button>
			</div>

			{/* Company Information */}
			<div className="bg-white rounded-xl p-6 border border-gray-200">
				<div className="flex items-center gap-2 mb-4">
					<Building2 className="w-5 h-5 text-gray-600" />
					<h3 className="text-lg font-semibold text-gray-900">
						Company Information
					</h3>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Company Name
						</label>
						<input
							type="text"
							value={settings.companyName}
							onChange={(e) => updateSetting('companyName', e.target.value)}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Email Address
						</label>
						<div className="relative">
							<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
							<input
								type="email"
								value={settings.email}
								onChange={(e) => updateSetting('email', e.target.value)}
								className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
							/>
						</div>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Website
						</label>
						<div className="relative">
							<Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
							<input
								type="url"
								value={settings.website}
								onChange={(e) => updateSetting('website', e.target.value)}
								className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
							/>
						</div>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Phone Number
						</label>
						<div className="relative">
							<Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
							<input
								type="tel"
								value={settings.phone}
								onChange={(e) => updateSetting('phone', e.target.value)}
								className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Notifications */}
			<div className="bg-white rounded-xl p-6 border border-gray-200">
				<div className="flex items-center gap-2 mb-4">
					<Bell className="w-5 h-5 text-gray-600" />
					<h3 className="text-lg font-semibold text-gray-900">
						Notification Preferences
					</h3>
				</div>
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium text-gray-900">Email Notifications</p>
							<p className="text-sm text-gray-600">
								Receive email updates about your account
							</p>
						</div>
						<label className="relative inline-flex items-center cursor-pointer">
							<input
								type="checkbox"
								checked={settings.emailNotifications}
								onChange={(e) =>
									updateSetting('emailNotifications', e.target.checked)
								}
								className="sr-only peer"
							/>
							<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
						</label>
					</div>
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium text-gray-900">Security Alerts</p>
							<p className="text-sm text-gray-600">
								Get notified about security-related events
							</p>
						</div>
						<label className="relative inline-flex items-center cursor-pointer">
							<input
								type="checkbox"
								checked={settings.securityAlerts}
								onChange={(e) =>
									updateSetting('securityAlerts', e.target.checked)
								}
								className="sr-only peer"
							/>
							<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
						</label>
					</div>
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium text-gray-900">Weekly Reports</p>
							<p className="text-sm text-gray-600">
								Receive weekly analytics and usage reports
							</p>
						</div>
						<label className="relative inline-flex items-center cursor-pointer">
							<input
								type="checkbox"
								checked={settings.weeklyReports}
								onChange={(e) => updateSetting('weeklyReports', e.target.checked)}
								className="sr-only peer"
							/>
							<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
						</label>
					</div>
				</div>
			</div>

			{/* Security */}
			<div className="bg-white rounded-xl p-6 border border-gray-200">
				<div className="flex items-center gap-2 mb-4">
					<Shield className="w-5 h-5 text-gray-600" />
					<h3 className="text-lg font-semibold text-gray-900">Security</h3>
				</div>
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium text-gray-900">Two-Factor Authentication</p>
							<p className="text-sm text-gray-600">
								Add an extra layer of security to your account
							</p>
						</div>
						<button
							onClick={() => updateSetting('twoFactorAuth', !settings.twoFactorAuth)}
							className={`px-4 py-2 rounded-lg font-medium transition-colors ${
								settings.twoFactorAuth
									? 'bg-green-100 text-green-700 hover:bg-green-200'
									: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
							}`}
						>
							{settings.twoFactorAuth ? 'Enabled' : 'Enable'}
						</button>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Change Password
						</label>
						<div className="flex gap-3">
							<input
								type="password"
								placeholder="Current password"
								className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
							/>
							<input
								type="password"
								placeholder="New password"
								className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
							/>
							<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
								Update
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Customization */}
			<div className="bg-white rounded-xl p-6 border border-gray-200">
				<div className="flex items-center gap-2 mb-4">
					<Palette className="w-5 h-5 text-gray-600" />
					<h3 className="text-lg font-semibold text-gray-900">
						White-Label Customization
					</h3>
				</div>
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Primary Brand Color
						</label>
						<div className="flex items-center gap-3">
							<input
								type="color"
								value={settings.primaryColor}
								onChange={(e) => updateSetting('primaryColor', e.target.value)}
								className="h-10 w-20 rounded-lg border border-gray-300 cursor-pointer"
							/>
							<input
								type="text"
								value={settings.primaryColor}
								onChange={(e) => updateSetting('primaryColor', e.target.value)}
								className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
							/>
						</div>
						<p className="text-sm text-gray-600 mt-1">
							This color will be used throughout the embedded wallet UI
						</p>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Webhook URL
						</label>
						<input
							type="url"
							value={settings.webhookUrl}
							onChange={(e) => updateSetting('webhookUrl', e.target.value)}
							placeholder="https://your-app.com/webhooks/proxify"
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
						/>
						<p className="text-sm text-gray-600 mt-1">
							Receive real-time notifications about wallet events
						</p>
					</div>
				</div>
			</div>

			{/* Danger Zone */}
			<div className="bg-white rounded-xl p-6 border-2 border-red-200">
				<h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<p className="font-medium text-gray-900">Delete Account</p>
							<p className="text-sm text-gray-600">
								Permanently delete your account and all associated data
							</p>
						</div>
						<button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
							Delete Account
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
