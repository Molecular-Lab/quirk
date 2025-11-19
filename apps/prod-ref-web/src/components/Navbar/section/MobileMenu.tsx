import { Drawer, DrawerContent, DrawerTrigger } from "@rabbitswap/ui/basic"
import { Menu } from "@rabbitswap/ui/icons"
import { PropsWithClassName, cn } from "@rabbitswap/ui/utils"

import { LinksSection } from "./Links"

interface MobileMenuProps extends PropsWithClassName {
	triggerClassName?: string
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ className, triggerClassName }) => {
	return (
		<Drawer>
			<DrawerTrigger className={cn(triggerClassName)}>
				<Menu className="text-2xl" />
			</DrawerTrigger>
			<DrawerContent className={cn(className)}>
				<LinksSection isMobile />
			</DrawerContent>
		</Drawer>
	)
}
