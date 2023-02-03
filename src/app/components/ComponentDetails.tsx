import { Bugs } from './Bug'
import { fetchBugs } from './service'

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
	const total = bugs.length
	const defectSegment = {
		color: 'rose',
		count: bugs.filter(b => b.type == 'defect').length
	}
	const enhancementSegment = {
		color: 'emerald',
		count: bugs.filter(b => b.type == 'enhancement').length
	}
	const taskSegment = {
		color: 'sky',
		count: bugs.filter(b => b.type == 'task').length
	}

	return (
		<div className="flex items-center">
			<span className="text-xs pr-2 font-mono">{bugs.length}</span>
			<div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 shadow-gray-400/50 flex">
				{[defectSegment, enhancementSegment, taskSegment].filter((x) => x.count > 0).map((segment) => {
					const style = { width: `${segment.count / total * 100}%` }
					const className = `bg-${segment.color}-400 h-2.5 last:rounded-r-full first:rounded-l-full shadow-sm shadow-${segment.color}-400/50`
					return (<div key={segment.color} className={className} style={style}></div>)
				})}
			</div>
		</div>
	)
}

export default ComponentDetails;
