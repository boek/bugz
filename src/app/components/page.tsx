import { Suspense } from "react"
import Loading from './loading'
import ComponentList from "./ComponentList"

export default async function Page() {
	return (
		<>
		<Suspense fallback={<Loading />}>
			<ComponentList />
		</Suspense>
		</>
	)
};
