import { Bugs } from './types'

export const fetchBugzillaBugs = async () => {
	const res = await fetch("https://bugzilla.mozilla.org/rest/bug?include_fields=id,summary,status&f1=status_whiteboard&include_fields=assigned_to&include_fields=priority&include_fields=product&include_fields=component&include_fields=id&include_fields=summary&include_fields=whiteboard&o1=anywordssubstr&priority=P1&resolution=---&v1=%5Bgeckoview%3Am111")
	const bugs: Bugs = (await res.json()).bugs

	return bugs
}
