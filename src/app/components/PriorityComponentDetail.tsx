'use client';

import { Bugs } from './types'
import { usePriority } from './PriorityContext';
import { useMemo } from 'react'

type Props = {
	bugs: Bugs
}

export default function PriorityComponentDetail({ bugs }: Props) {
	const [priority, _] = usePriority()
	const filteredBugs = useMemo(() => bugs.filter((b) => priority == 'All' ? true : b.priority == priority), [priority])

	const total = filteredBugs.length

	const defectSegment = {
		color: 'rose',
		count: filteredBugs.filter(b => b.type == 'defect').length
	}
	const enhancementSegment = {
		color: 'emerald',
		count: filteredBugs.filter(b => b.type == 'enhancement').length
	}
	const taskSegment = {
		color: 'sky',
		count: filteredBugs.filter(b => b.type == 'task').length
	}

	return (
		<div className="flex items-center">
			<span className="text-xs pr-2 font-mono">{filteredBugs.length}</span>
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
