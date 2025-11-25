import { Button } from "@rabbitswap/ui/basic"

export const SectionButton: React.FC = () => {
	return (
		<div className="grid w-full grid-cols-5 gap-3">
			<div className="col-span-5">
				<Button>Default Button</Button>
			</div>
			<Button buttonColor="primary" size="default" loading>
				Button
			</Button>
			<Button buttonType="solid" buttonColor="primary" size="default">
				Button
			</Button>
			<Button buttonType="filled" buttonColor="primary" size="default">
				Button
			</Button>
			<Button buttonType="outline" buttonColor="primary" size="default">
				Button
			</Button>
			<Button buttonType="text" buttonColor="primary" size="default">
				Button
			</Button>

			<Button buttonColor="secondary" size="default" loading>
				Button
			</Button>
			<Button buttonType="solid" buttonColor="secondary" size="default">
				Button
			</Button>
			<Button buttonType="filled" buttonColor="secondary" size="default">
				Button
			</Button>
			<Button buttonType="outline" buttonColor="secondary" size="default">
				Button
			</Button>
			<Button buttonType="text" buttonColor="secondary" size="default">
				Button
			</Button>

			<Button buttonColor="danger" size="default" loading>
				Button
			</Button>
			<Button buttonType="solid" buttonColor="danger" size="default">
				Button
			</Button>
			<Button buttonType="filled" buttonColor="danger" size="default">
				Button
			</Button>
			<Button buttonType="outline" buttonColor="danger" size="default">
				Button
			</Button>
			<Button buttonType="text" buttonColor="danger" size="default">
				Button
			</Button>

			<Button buttonColor="gray" size="default" loading>
				Button
			</Button>
			<Button buttonType="solid" buttonColor="gray" size="default">
				Button
			</Button>
			<Button buttonType="filled" buttonColor="gray" size="default">
				Button
			</Button>
			<Button buttonType="outline" buttonColor="gray" size="default">
				Button
			</Button>
			<Button buttonType="text" buttonColor="gray" size="default">
				Button
			</Button>

			<Button buttonColor="primary" size="sm" loading>
				Button
			</Button>
			<Button buttonType="solid" buttonColor="primary" size="sm">
				Button
			</Button>
			<Button buttonType="filled" buttonColor="primary" size="sm">
				Button
			</Button>
			<Button buttonType="outline" buttonColor="primary" size="sm">
				Button
			</Button>
			<Button buttonType="text" buttonColor="primary" size="sm">
				Button
			</Button>

			<Button buttonColor="secondary" size="sm" loading>
				Button
			</Button>
			<Button buttonType="solid" buttonColor="secondary" size="sm">
				Button
			</Button>
			<Button buttonType="filled" buttonColor="secondary" size="sm">
				Button
			</Button>
			<Button buttonType="outline" buttonColor="secondary" size="sm">
				Button
			</Button>
			<Button buttonType="text" buttonColor="secondary" size="sm">
				Button
			</Button>

			<Button buttonColor="danger" size="sm" loading>
				Button
			</Button>
			<Button buttonType="solid" buttonColor="danger" size="sm">
				Button
			</Button>
			<Button buttonType="filled" buttonColor="danger" size="sm">
				Button
			</Button>
			<Button buttonType="outline" buttonColor="danger" size="sm">
				Button
			</Button>
			<Button buttonType="text" buttonColor="danger" size="sm">
				Button
			</Button>

			<Button buttonColor="primary" size="default" loading disabled>
				disabled
			</Button>
			<Button buttonType="solid" buttonColor="primary" size="default" disabled>
				disabled
			</Button>
			<Button buttonType="filled" buttonColor="primary" size="default" disabled>
				disabled
			</Button>
			<Button buttonType="outline" buttonColor="primary" size="default" disabled>
				disabled
			</Button>
			<Button buttonType="text" buttonColor="primary" size="default" disabled>
				disabled
			</Button>
		</div>
	)
}
