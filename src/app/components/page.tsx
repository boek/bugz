import ComponentList from "./ComponentList"
import BugCounter from './BugCounter'
import { Suspense } from "react"
import { fetchComponents } from "./service"
import { PriorityProvider } from "./PriorityContext"
import PriorityPicker from "./PriorityPicker"

export default async function Page() {
	const components = await fetchComponents('Fenix')

	return (
			<PriorityProvider>
				<PriorityPicker />
				<Suspense fallback={<span></span>}>
					<BugCounter components={components} />
				</Suspense>
				<ComponentList components={components} />
			</PriorityProvider>
	)
};
