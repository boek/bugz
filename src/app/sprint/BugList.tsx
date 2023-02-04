import { fetchBugzillaBugs } from "./service";

export default async function BugList() {
	const bugs = await fetchBugzillaBugs()

	return (
		<ul>
			{bugs.map(b => <li key={b.id}>{b.summary}</li>)}
		</ul>
	)
}
