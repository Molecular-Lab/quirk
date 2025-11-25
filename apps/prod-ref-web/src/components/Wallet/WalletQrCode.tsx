import { QRCodeSVG } from "qrcode.react"
import { Address } from "viem"

import { useMinidenticon } from "@rabbitswap/ui/components"
import { useTheme } from "@rabbitswap/ui/providers"

import { WalletAddress } from "@/components/Wallet/WalletAddress"

export const WalletQrCode: React.FC<{ address: Address | undefined }> = ({ address }) => {
	const svgUri = useMinidenticon(address ?? "")
	const { theme } = useTheme()
	return (
		<div className="flex flex-col items-center justify-center gap-4 px-6">
			<WalletAddress hideIcon address={address} />
			{address && (
				<QRCodeSVG
					value={address}
					level="H"
					imageSettings={{
						src: svgUri,
						width: 20,
						height: 20,
						excavate: true,
					}}
					fgColor="#C1E2FD"
					bgColor={theme === "dark" ? "#1F1F21" : undefined}
					className="size-60"
				/>
			)}
		</div>
	)
}
