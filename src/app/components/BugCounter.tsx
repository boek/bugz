import { fetchBugs } from './service'
import { Components } from './Component'

type Props = {
	components: Components
}

const BugCounter = async ({ components }: Props) => {
	const bugs = await Promise.all(components.map(c => fetchBugs(c.name)))
	const total = bugs.reduce((total, bugs) => total + bugs.length, 0)
	return (
		<span>Total: {total}</span>
	)
}

export default BugCounter
