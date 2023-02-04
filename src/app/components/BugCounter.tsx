import { fetchBugs } from './service'
import { Bugs, Components } from './types'

import PriorityBugCounter from './PriorityBugCounter'

type Props = {
	components: Components
}

const BugCounter = async ({ components }: Props) => {
	const bugs = (await Promise.all<Bugs>(components.map(c => fetchBugs(c.name)))).flat()
	// const total = bugs.reduce((total, bugs) => total + bugs.length, 0)
	return (
		<PriorityBugCounter bugs={bugs} />
	)
}

export default BugCounter
