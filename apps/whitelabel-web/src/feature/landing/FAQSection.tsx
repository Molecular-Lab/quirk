import { useRef, useState } from "react"

import { AnimatePresence, motion, useInView } from "framer-motion"
import { ChevronDown } from "lucide-react"

interface FAQItem {
	id: string
	question: string
	answer: string
}

const faqItems: FAQItem[] = [
	{
		id: "1",
		question: "What is Quirk?",
		answer:
			"Quirk is a white-label DeFi yield infrastructure that allows platforms to offer institutional-grade yield products to their users. We provide secure custody, automated yield strategies, and a fully branded dashboard for your clients.",
	},
	{
		id: "2",
		question: "How does the integration work?",
		answer:
			"Integration is simple and fast. You can embed our SDK in minutes and start offering yield to your users without complex infrastructure setup. We handle the custody, yield generation, and compliance while you focus on your core product.",
	},
	{
		id: "3",
		question: "What kind of yields can users expect?",
		answer:
			"Our institutional-grade strategies offer competitive stablecoin yields of up to 5% APY. Yields are generated through diversified DeFi strategies including lending, staking, and liquidity provision, all optimized by our AI-powered agent.",
	},
	{
		id: "4",
		question: "How is custody handled?",
		answer:
			"We use institutional-grade custody solutions. User authentication is powered by Privy. This ensures that user funds are always protected with the highest security standards, while maintaining the flexibility for quick withdrawals.",
	},
	{
		id: "5",
		question: "What platforms can use Quirk?",
		answer:
			"Quirk is designed for any platform handling user funds - fintech apps, freelance platforms, creator platforms, gig worker platforms, and e-commerce marketplaces. Any business with idle balances can turn them into revenue streams.",
	},
	{
		id: "6",
		question: "How does revenue sharing work?",
		answer:
			"Platforms keep 90% of the yield generated while Quirk takes only 10%. This means if your users generate $2.5M in yield, your platform keeps $2.25M and Quirk takes $250k.",
	},
]

function AccordionItem({
	item,
	isOpen,
	onToggle,
	index,
}: {
	item: FAQItem
	isOpen: boolean
	onToggle: () => void
	index: number
}) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.1, duration: 0.4 }}
			className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:border-gray-300 transition-colors"
		>
			<motion.button
				onClick={onToggle}
				className="w-full px-6 py-5 flex items-center justify-between text-left group"
				whileHover={{ backgroundColor: "rgba(249, 250, 251, 0.5)" }}
				transition={{ duration: 0.2 }}
			>
				<span className="text-lg font-medium text-claude-gray-900 pr-4">{item.question}</span>
				<motion.div
					animate={{ rotate: isOpen ? 180 : 0 }}
					transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
					className="flex-shrink-0"
				>
					<ChevronDown className="w-5 h-5 text-gray-500" />
				</motion.div>
			</motion.button>

			<AnimatePresence initial={false}>
				{isOpen && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{
							height: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
							opacity: { duration: 0.2, delay: 0.1 },
						}}
					>
						<div className="px-6 pb-5">
							<motion.p
								initial={{ y: -10 }}
								animate={{ y: 0 }}
								transition={{ duration: 0.2, delay: 0.1 }}
								className="text-claude-gray-800 leading-relaxed"
							>
								{item.answer}
							</motion.p>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	)
}

export function FAQSection() {
	const ref = useRef(null)
	const isInView = useInView(ref, { once: true, amount: 0.2 })
	const [openId, setOpenId] = useState<string | null>(null)

	const toggleItem = (id: string) => {
		setOpenId(openId === id ? null : id)
	}

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.2,
			},
		},
	}

	const titleVariants = {
		hidden: { opacity: 0, y: 30 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				ease: [0.22, 1, 0.36, 1] as const,
			},
		},
	}

	return (
		<section className="py-24 lg:py-32 bg-claude-bg-50 overflow-hidden">
			<motion.div
				ref={ref}
				variants={containerVariants}
				initial="hidden"
				animate={isInView ? "visible" : "hidden"}
				className="max-w-4xl mx-auto px-6"
			>
				{/* Section Header */}
				<motion.div className="text-center mb-16" variants={titleVariants}>
					<motion.h2 className="text-2xl lg:text-4xl font-normal text-claude-gray-900 mb-4" variants={titleVariants}>
						Frequently Asked Questions
					</motion.h2>
					<motion.p className="text-base text-claude-gray-800 max-w-2xl mx-auto" variants={titleVariants}>
						Everything you need to know about Quirk
					</motion.p>
				</motion.div>

				{/* FAQ Accordion */}
				<motion.div className="space-y-4" variants={containerVariants}>
					{faqItems.map((item, index) => (
						<AccordionItem
							key={item.id}
							item={item}
							isOpen={openId === item.id}
							onToggle={() => {
								toggleItem(item.id)
							}}
							index={index}
						/>
					))}
				</motion.div>

				{/* CTA after FAQ */}
				<motion.div
					className="mt-12 text-center"
					initial={{ opacity: 0, y: 20 }}
					animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
					transition={{ delay: 0.8, duration: 0.5 }}
				>
					<p className="text-claude-gray-800 mb-4">Still have questions?</p>
					<motion.a
						href="/contact"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-block bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
						whileHover={{
							scale: 1.02,
							boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
						}}
						whileTap={{ scale: 0.98 }}
					>
						Let's Talk
					</motion.a>
				</motion.div>
			</motion.div>
		</section>
	)
}
