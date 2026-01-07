interface ASCIIIconProps {
	icon: string
	className?: string
	size?: "sm" | "md" | "lg" | "xl"
}

export function ASCIIIcon({ icon, className = "", size = "md" }: ASCIIIconProps) {
	const sizeClasses = {
		sm: "text-base",
		md: "text-xl",
		lg: "text-2xl",
		xl: "text-3xl lg:text-4xl",
	}

	return (
		<span className={`font-mono font-bold ${sizeClasses[size]} ${className}`} aria-hidden="true">
			{icon}
		</span>
	)
}
