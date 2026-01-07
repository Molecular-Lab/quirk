import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface AccordionItem {
	id: string
	question: string
	answer: string
}

interface AccordionProps {
	items: AccordionItem[]
	className?: string
}

/**
 * Animated FAQ Accordion with smooth expand/collapse
 */
export function Accordion({ items, className = "" }: AccordionProps) {
	const [openId, setOpenId] = useState<string | null>(null)

	const toggleItem = (id: string) => {
		setOpenId(openId === id ? null : id)
	}

	return (
		<div className={`space-y-4 ${className}`}>
			{items.map((item, index) => (
				<AccordionItemComponent
					key={item.id}
					item={item}
					isOpen={openId === item.id}
					onToggle={() => toggleItem(item.id)}
					index={index}
				/>
			))}
		</div>
	)
}

interface AccordionItemComponentProps {
	item: AccordionItem
	isOpen: boolean
	onToggle: () => void
	index: number
}

function AccordionItemComponent({ item, isOpen, onToggle, index }: AccordionItemComponentProps) {
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
				<span className="text-lg font-medium text-gray-900 pr-4">{item.question}</span>
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
								className="text-gray-600 leading-relaxed"
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

interface MultiAccordionProps {
	items: AccordionItem[]
	className?: string
}

/**
 * Multi-select Accordion - Multiple items can be open at once
 */
export function MultiAccordion({ items, className = "" }: MultiAccordionProps) {
	const [openIds, setOpenIds] = useState<Set<string>>(new Set())

	const toggleItem = (id: string) => {
		setOpenIds((prev) => {
			const next = new Set(prev)
			if (next.has(id)) {
				next.delete(id)
			} else {
				next.add(id)
			}
			return next
		})
	}

	return (
		<div className={`space-y-4 ${className}`}>
			{items.map((item, index) => (
				<AccordionItemComponent
					key={item.id}
					item={item}
					isOpen={openIds.has(item.id)}
					onToggle={() => toggleItem(item.id)}
					index={index}
				/>
			))}
		</div>
	)
}
