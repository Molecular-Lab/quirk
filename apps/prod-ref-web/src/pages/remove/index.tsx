import { useEffect } from "react"

import { useNavigate } from "@/router"

const Index: React.FC = () => {
	const navigate = useNavigate()
	useEffect(() => {
		void navigate("/pools", { replace: true })
	}, [navigate])

	return <></>
}

export default Index
