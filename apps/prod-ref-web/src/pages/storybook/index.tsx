import { Button, Container } from "@rabbitswap/ui/basic"
import { useTheme } from "@rabbitswap/ui/providers"

import { Layout } from "@/components/layout"
import { DevModeAuthGuard } from "@/feature/dev/DevModeAuthGuard"
import {
	SectionAccordion,
	SectionBadge,
	SectionButton,
	SectionCheckbox,
	SectionCustomComponents,
	SectionDropdown,
	SectionError,
	SectionInput,
	SectionProgress,
	SectionRadioGroup,
	SectionSlider,
	SectionToast,
	SectionTooltip,
	StorybookSection,
} from "@/feature/storybook/sections"

/**
 * This page is intended to show the whole system UI, and example usage for development.
 *
 * Please ensure that every time it build, this page is not added to router.ts (by adding `_` in front of the folder name)
 */
const Index: React.FC = () => {
	const { toggleTheme } = useTheme()
	return (
		<Layout>
			<DevModeAuthGuard>
				<Container className="lg:max-w-[1000px]">
					<Button onClick={toggleTheme}>Theme Toggle</Button>
					<StorybookSection title="Buttons">
						<SectionButton />
					</StorybookSection>
					<StorybookSection title="Accordion">
						<SectionAccordion />
					</StorybookSection>
					<StorybookSection title="Pills">
						<SectionBadge />
					</StorybookSection>
					<StorybookSection title="Progress">
						<SectionProgress />
					</StorybookSection>
					<StorybookSection title="Tooltip">
						<SectionTooltip />
					</StorybookSection>

					<StorybookSection title="Input">
						<SectionInput />
					</StorybookSection>
					<StorybookSection title="Dropdown">
						<SectionDropdown />
					</StorybookSection>
					<StorybookSection title="Checkbox">
						<SectionCheckbox />
					</StorybookSection>
					<StorybookSection title="Radio Group">
						<SectionRadioGroup />
					</StorybookSection>
					<StorybookSection title="Slider">
						<SectionSlider />
					</StorybookSection>
					<StorybookSection title="Toast">
						<SectionToast />
					</StorybookSection>
					<StorybookSection title="Error">
						<SectionError />
					</StorybookSection>
					<StorybookSection title="Custom components">
						<SectionCustomComponents />
					</StorybookSection>
				</Container>
			</DevModeAuthGuard>
		</Layout>
	)
}

export default Index
