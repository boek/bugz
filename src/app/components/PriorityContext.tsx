'use client';

import { createContext, useContext, useState, Dispatch, SetStateAction, ReactNode } from 'react'
import { Priority } from './types'
export type PrioritySelection = 'All' | Priority

const PriorityContext = createContext<[PrioritySelection, Dispatch<SetStateAction<PrioritySelection>>]>(['All', () => {}])

export const PriorityProvider = ({ children }: { children: ReactNode }) => {
	const [priority, setPriority] = useState<PrioritySelection>('All')

	return (
		<PriorityContext.Provider value={[priority, setPriority]}>
			{children}
		</PriorityContext.Provider>
	)
}

export const usePriority = () => {
	const context = useContext(PriorityContext)
	if (context === undefined) {
		throw new Error('useCounter must be used within a CounterProvider');
	}
	return context
}
