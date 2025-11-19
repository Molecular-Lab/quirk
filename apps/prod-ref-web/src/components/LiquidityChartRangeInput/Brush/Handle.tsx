export const Handle: React.FC<React.SVGAttributes<SVGPathElement> & { color?: string }> = ({ color, ...props }) => {
	return <path cursor="ew-resize" pointerEvents="none" strokeWidth={3} stroke={color} fill={color} {...props} />
}

export const HandleAccent: React.FC<React.SVGAttributes<SVGPathElement>> = ({ ...props }) => {
	return <path cursor="ew-resize" pointerEvents="none" strokeWidth={1.5} stroke="#FFFFFF" {...props} />
}
