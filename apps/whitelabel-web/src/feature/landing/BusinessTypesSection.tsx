import { useRef } from "react"
import { ShoppingBag, CreditCard, Briefcase, Palette, Car } from "lucide-react"

import linePayLogo from "@/assets/line-pay-seeklogo.svg"
import wiseLogo from "@/assets/wise-plc-seeklogo.svg"
import paypalLogo from "@/assets/paypal-seeklogo.svg"
import upworkLogo from "@/assets/upwork-seeklogo.svg"
import fiverrLogo from "@/assets/fiverr-seeklogo.svg"
import toptalLogo from "@/assets/toptal-seeklogo-2.svg"
import tiktokLogo from "@/assets/tiktok-app-icon-seeklogo.svg"
import instagramLogo from "@/assets/instagram-new-2022-seeklogo.svg"
import youtubeLogo from "@/assets/youtube-2017-icon-seeklogo-3.svg"
import onlyfansLogo from "@/assets/onlyfans-seeklogo.svg"
import grabLogo from "@/assets/grab-seeklogo.svg"
import uberLogo from "@/assets/uber-seeklogo.svg"
import foodpandaLogo from "@/assets/foodpanda-seeklogo.svg"
import shopifyLogo from "@/assets/shopify-seeklogo.svg"
import shopeeLogo from "@/assets/shopee-seeklogo.svg"
import lazadaLogo from "@/assets/lazada-seeklogo.svg"

export function BusinessTypesSection() {
	const businessTypes = [
		{
			title: "Fintech",
			description:
				"User wallets and payment processing funds earn yield during settlement periods. Optimize treasury management with automated yield generation.",
			icon: <CreditCard className="w-6 h-6 text-gray-900" />,
			logos: [linePayLogo, wiseLogo, paypalLogo],
		},
		{
			title: "Freelance Platforms",
			description:
				"Project escrow and milestone payments earn yield until release. Freelancer earnings accumulate returns while waiting for withdrawal, maximizing value for both clients and workers.",
			icon: <Briefcase className="w-6 h-6 text-gray-900" />,
			logos: [upworkLogo, fiverrLogo, toptalLogo],
		},
		{
			title: "Creator Platforms",
			description:
				"Creator revenue earns yield until withdrawal. Boost creator retention and satisfaction by offering competitive returns on their earnings while they focus on content.",
			icon: <Palette className="w-6 h-6 text-gray-900" />,
			logos: [tiktokLogo, instagramLogo, youtubeLogo, onlyfansLogo],
		},
		{
			title: "Gig Worker Platforms",
			description:
				"Escrow funds and driver earnings earn yield until payout. Better than 0% checking accounts, creating a competitive advantage for platform adoption and retention.",
			icon: <Car className="w-6 h-6 text-gray-900" />,
			logos: [grabLogo, uberLogo, foodpandaLogo],
		},
		{
			title: "E-commerce",
			description:
				"Enable merchants to earn yield on idle balances. Seller pending payouts and treasury funds generate returns while waiting for settlement.",
			icon: <ShoppingBag className="w-6 h-6 text-gray-900" />,
			logos: [shopifyLogo, shopeeLogo, lazadaLogo],
		},
	]

	const scrollerRef = useRef<HTMLDivElement>(null)

	const scrollByCard = (direction: "left" | "right") => {
		const scroller = scrollerRef.current
		if (!scroller) return

		// Use the width of the first card as the scroll step; fall back to 320px.
		const firstCard = scroller.querySelector<HTMLElement>("[data-business-card]")
		const step = (firstCard?.offsetWidth ?? 320) + 24 // 24px gap from gap-6

		scroller.scrollBy({
			left: direction === "left" ? -step : step,
			behavior: "smooth",
		})
	}

	return (
		<section className="py-24 bg-white">
			<div className="max-w-none w-full mx-auto px-6 sm:px-10 lg:px-16">
				{/* Section Header */}
				<div className="mb-12 text-center">
					<h2 className="text-5xl font-bold text-gray-950 mb-6">Support Any Platform</h2>
					<p className="text-xl text-gray-700 max-w-3xl mx-auto">
						From fintech to creators, scale with Quirk's infrastructure.
					</p>
				</div>

				{/* Cards Slider */}
				<div className="relative">
					<div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent pointer-events-none" />
					<div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none" />

					<div
						ref={scrollerRef}
						className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory px-2 sm:px-4"
					>
						{businessTypes.map((type, idx) => {
							// Cycle through pastel colors: Purple, Orange, Gray
							const bgColors = ["bg-purple-50", "bg-orange-50", "bg-gray-100"]
							const bgColor = bgColors[idx % bgColors.length]

							return (
								<div
									key={idx}
									data-business-card
									className={`snap-center flex-shrink-0 w-[360px] sm:w-[400px] lg:w-[460px] ${bgColor} rounded-3xl p-8 flex flex-col justify-between hover:shadow-md transition-all`}
								>
									<div>
										{/* Icon Header */}
										<div className="flex items-center gap-4 mb-8">
											<div className="w-12 h-12 rounded-full bg-white/60 flex items-center justify-center">
												{type.icon}
											</div>
											<h3 className="text-2xl font-bold text-gray-950">{type.title}</h3>
										</div>

										{/* Description/Tags */}
										<div className="mb-8">
											<p className="text-gray-700 text-lg leading-relaxed">
												{type.description}
											</p>
										</div>
									</div>

									{/* Apps Footer */}
									<div>
										<p className="text-gray-500 text-sm font-mono uppercase tracking-wider mb-4">
											APPS
										</p>
										<div className="flex items-center gap-4 flex-wrap">
											{type.logos.map((logo, logoIdx) => (
												<div
													key={logoIdx}
													className="h-14 px-5 bg-white rounded-xl flex items-center justify-center shadow border border-gray-200"
												>
													<img src={logo} alt="" className="h-8 w-auto object-contain max-w-[96px]" />
												</div>
											))}
										</div>
									</div>
								</div>
							)
						})}
					</div>

					<div className="pointer-events-none absolute inset-y-0 flex items-center justify-between w-full">
						<button
							type="button"
							onClick={() => scrollByCard("left")}
							className="pointer-events-auto hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg border border-gray-200 hover:-translate-x-0.5 transition"
							aria-label="Scroll left"
						>
							<span className="text-2xl font-semibold text-gray-700">‹</span>
						</button>
						<button
							type="button"
							onClick={() => scrollByCard("right")}
							className="pointer-events-auto hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg border border-gray-200 hover:translate-x-0.5 transition"
							aria-label="Scroll right"
						>
							<span className="text-2xl font-semibold text-gray-700">›</span>
						</button>
					</div>
				</div>
			</div>
		</section>
	)
}
