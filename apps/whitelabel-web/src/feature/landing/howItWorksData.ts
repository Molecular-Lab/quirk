export const milestones = [
	{ id: 1, label: "Idle Capital" },
	{ id: 2, label: "Earn Yield" },
	{ id: 3, label: "Your Revenue" },
	{ id: 4, label: "Revenue Share" },
]

// Data for each step - what to show in cards
export const stepData = [
	{
		quirkless: { label: "Idle Capital", value: "$50M", subtext: "sitting unused" },
		quirk: { label: "Idle Capital", value: "$50M", subtext: "ready to earn" },
	},
	{
		quirkless: { label: "Annual Yield", value: "0%", subtext: "APY" },
		quirk: { label: "Annual Yield", value: "5%", subtext: "APY" },
	},
	{
		quirkless: { label: "Lost Revenue", value: "$0", subtext: "per year" },
		quirk: { label: "Your Revenue", value: "$2.5M", subtext: "per year", highlight: true },
	},
	{
		quirkless: { label: "Distribution", value: "0%", subtext: "for everyone" },
		quirk: {
			label: "Configurable Distribution",
			value: "",
			breakdown: [
				{ label: "End-User APY", value: "70%", color: "text-white" },
				{ label: "Your Share", value: "20%", color: "text-white" },
				{ label: "Platform Fee", value: "10%", color: "text-white" },
			],
		},
	},
]
