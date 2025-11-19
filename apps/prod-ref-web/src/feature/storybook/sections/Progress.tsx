import { Progress } from "@rabbitswap/ui/basic"

export const SectionProgress: React.FC = () => {
	return (
		<>
			<Progress />
			<Progress value={10} />
			<Progress value={20} />
			<Progress value={40} />
			<Progress value={80} />
			<Progress value={100} />
			<Progress animate />
			<Progress value={10} animate />
			<Progress value={20} animate />
			<Progress value={40} animate />
			<Progress value={80} animate />
			<Progress value={100} animate />
		</>
	)
}
