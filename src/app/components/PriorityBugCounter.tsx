'use client';

import { usePriority } from "./PriorityContext";
import { Bugs } from "./types";
import { useMemo } from 'react'

type Props = {
	bugs: Bugs
}

export default function PriorityBugCounter({ bugs }: Props) {
	const [priority, _] = usePriority()
	const sortedPriorities = useMemo(() => bugs.filter((b) => priority == 'All' ? true : b.priority == priority), [priority])

	return (
		<span>Total: {sortedPriorities.length}</span>
	)
}
