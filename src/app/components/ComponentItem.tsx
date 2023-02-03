'use client'

import Loading from "./loading"
import { Suspense } from 'react'
import useSWR from 'swr'

type Props = {
	name: string
}

type BugType = 'defect' | 'enhancement' | 'task'
type Status = 'UNCONFIRMED' | 'NEW' | 'ASSIGNED' | 'RESOLVED'
type Priority = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | '--'
type Severity = 'S1' | 'S2' | 'S3' | 'S4'

type Bug = {
	id: number
	status: Status
	type: BugType
	priority: Priority
	severity: Severity
}


type Response = {
	type: 'inert' | 'response'
	bugs: Bug[]
}
const fallbackResponse: Response = {
	type: 'inert',
	bugs: Array<Bug>()
}

const fetchComponentData = async ([_, component]: string[]): Promise<Response> => {
	const res = await fetch(`https://bugzilla.mozilla.org/rest/bug?include_fields=id,summary,status,type,severity,priority&component=${component}&product=Fenix&resolution=---`)
	const bugs: Bug[] = (await res.json()).bugs

	return {
		type: 'response',
		bugs: bugs
	}
}

const ComponentListItem = ({ name }: Props) => {
	const { data } = useSWR(['component', name], fetchComponentData, { suspense: true, fallbackData: fallbackResponse})

	switch (data.type) {
		case 'inert': return (<li key={name}>{name}: Loading</li>)
		case 'response': return (
			<a
				key={name}
				className="p-2 bg-white/25 backdrop-blur-sm border border-white/20 rounded-lg m-2 shadow-sm cursor-pointer"
			>
				<span className="font-mono text-xl">{name}</span>

				<div className="flex items-center">
					<span className="text-xs pr-2 font-mono">{data.bugs.length}</span>
					<div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 shadow-gray-400/50 flex">

					</div>
				</div>
			</a>
		)
	}
}

export default ComponentListItem
