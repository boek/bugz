import { fetchBugzillaBugs } from "./service";
import SprintBoard from "./SprintBoard";

export default async function BugList() {
	const bugs = await fetchBugzillaBugs()

	return (
		<SprintBoard bugs={bugs} />
	)
}
