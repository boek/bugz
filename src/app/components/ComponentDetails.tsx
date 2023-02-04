import { Bugs } from './types'
import { fetchBugs } from './service'
import PriorityComponentDetail from './PriorityComponentDetail'

type Props = {
	name: string
}

export const DetailsSkeleton = () => (
	<div className="flex items-center">
		<div className="h-2 w-6 bg-gray-200 rounded-full dark:bg-gray-700"></div>
		<div className="h-2 w-40 ml-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
	</div>
)

export const ComponentDetails = async ({ name }: Props) => {
	const bugs = await fetchBugs(name)

	return (
		<PriorityComponentDetail bugs={bugs} />
	)
}

export default ComponentDetails;
