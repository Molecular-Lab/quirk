interface AsciiArtProps {
	art: string
	className?: string
}

export function AsciiArt({ art, className = "" }: AsciiArtProps) {
	return (
		<pre
			className={`font-mono leading-none ${className}`}
			style={{
				fontSize: "0.7rem",
				lineHeight: "0.7rem",
				textAlign: "center",
				whiteSpace: "pre",
				letterSpacing: "0em",
			}}
		>
			{art}
		</pre>
	)
}
