import ComponentList from "./ComponentList"
import BugCounter from './BugCounter'
import { fetchComponents } from "./service"

export default async function Page() {
	const components = await fetchComponents('Fenix')

	return (
			<>
			<BugCounter components={components} />
			<ComponentList components={components} />
			</>
	)
};
