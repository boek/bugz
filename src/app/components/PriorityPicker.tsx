'use client';

import { PrioritySelection, usePriority } from "./PriorityContext";

export default function PriorityPicker() {
	const [priority, setPriority] = usePriority()
	const priorities: PrioritySelection[] = ['All', 'P1', 'P2', 'P3', 'P4', 'P5', '--']

	return (
		<div className="flex p-8 font-bold cursor-pointer">
			{priorities.map(p =>
				<div
					key={p}
					className={`border-indigo-800 border-y-4 first:border-l-4 first:rounded-l last:border-r-4 last:rounded-r p-2 ${ priority == p ? 'bg-indigo-800 text-white' : 'hover:bg-indigo-500 hover:text-white' }`}
					onClick={() => setPriority(p)}>
					{p}
				</div>
			)}

		</div>
	)
}
