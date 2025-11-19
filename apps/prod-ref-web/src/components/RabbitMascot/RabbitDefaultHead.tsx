import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

interface RabbitDefaultHeadProps extends PropsWithClassName {}

export const RabbitDefaultHead: React.FC<RabbitDefaultHeadProps> = ({ className }) => {
	return (
		<svg
			width="87"
			height="87"
			viewBox="0 0 87 87"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={cn("text-primary", className)}
		>
			<g clipPath="url(#clip0_507_75)">
				{/* head */}
				<path
					d="M15.7117 66.8316C14.7078 74.8733 11.806 78.9589 10.1667 84.0488C20.5362 99.0075 50.1851 99.3614 64.7689 98.714C66.8815 92.1547 68.8216 83.9959 69.7188 74.48C71.3438 57.2453 56.2112 48.8835 42.6727 47.3526C29.1342 45.8216 17.2297 54.6719 15.7117 66.8316Z"
					fill="currentColor"
				/>
				{/* right eye */}
				<ellipse
					cx="51.0487"
					cy="70.6118"
					rx="1.98204"
					ry="2.64272"
					transform="rotate(3.89519 51.0487 70.6118)"
					fill="white"
				/>
				{/* left eye */}
				<ellipse
					cx="31.9339"
					cy="69.9395"
					rx="1.98204"
					ry="2.64272"
					transform="rotate(-1.84291 31.9339 69.9395)"
					fill="white"
				/>
				{/* nose */}
				<path
					d="M41.5466 77.5437C40.4464 77.542 39.4108 77.221 38.6516 76.738C37.8906 76.2537 37.4167 75.6133 37.4177 74.976C37.4187 74.3382 37.854 73.7536 38.5739 73.3265C39.2929 72.8999 40.2886 72.6355 41.3903 72.6372C42.4921 72.6389 43.4869 72.9064 44.2046 73.3352C44.9232 73.7646 45.3567 74.3505 45.3557 74.9883C45.3547 75.6291 44.9568 76.2679 44.2782 76.748C43.6003 77.2277 42.6466 77.5454 41.5466 77.5437Z"
					fill="white"
					stroke="white"
					strokeWidth="0.090278"
				/>
				{/* right ear - bottom */}
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M57.2523 25.7706C57.7625 28.5217 57.8771 32.4106 56.9244 38.1056C56.1246 42.886 58.7909 45.5875 62.5069 46.5223C56.0816 49.6914 49.6906 53.3435 49.5572 59.6429C49.3841 67.819 45.4078 61.7742 43.5002 54.933C45.2107 45.2026 49.7914 30.454 57.2523 25.7706Z"
					fill="currentColor"
				/>
				{/* right ear - top */}
				<path
					d="M59.9505 37.1371C61.4971 29.6843 60.4752 26.2399 59.5969 24.2882C70.4836 22.1226 78.3389 31.9066 76.2082 38.5217C73.8127 45.9588 58.0173 46.4532 59.9505 37.1371Z"
					fill="currentColor"
				/>
				{/* left ear */}
				<path
					d="M22.7378 11.9756C44.2765 6.12571 42.4493 35.2161 38.06 50.7721C32.9255 56.6151 22.5275 65.7079 28.278 53.0988C35.4663 37.3374 -4.18558 19.2879 22.7378 11.9756Z"
					fill="currentColor"
				/>
				{/* left ear - inner */}
				<path
					d="M26.4348 19.6807C37.9247 15.9947 37.8942 37.1589 36.782 47.3327L33.7509 47.959C33.6734 28.9283 12.0433 24.2976 26.4348 19.6807Z"
					fill="white"
				/>
			</g>
			<defs>
				<clipPath id="clip0_507_75">
					<rect x="0.133545" width="86" height="86" rx="43" transform="rotate(0.0890038 0.133545 0)" fill="white" />
				</clipPath>
			</defs>
		</svg>
	)
}
