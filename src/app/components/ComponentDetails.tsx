'use client'

import useSWR from 'swr'
import { Bugs } from './Bug'

const fetchBugs = async (component: string[]) => {
	const res = await fetch(`https://bugzilla.mozilla.org/rest/bug?include_fields=id,summary,status,type,severity,priority&component=${component}&product=Fenix&resolution=---`)
	const json: Bugs = (await res.json()).bugs
	return json
}

type Props = {
	name: string
}

const ComponentDetails = ({ name }: Props) => {
	const { data } = useSWR(name, fetchBugs, { suspense: true, fallbackData: [] })

	return (
		<div className="flex items-center">
			<span className="text-xs pr-2 font-mono">{data.length}</span>
			<div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 shadow-gray-400/50 flex">

			</div>
		</div>
	)
}

export default ComponentDetails;
