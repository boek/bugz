import { Suspense } from 'react'
import ComponentDetails from './ComponentDetails'

type Props = {
	name: string
}

const ComponentListItem = ({ name }: Props) => {
	return (
		<a
			className="p-2 bg-white/25 backdrop-blur-sm border border-white/20 rounded-lg m-2 shadow-sm cursor-pointer">
			<span className="font-mono text-xl">{name}</span>

			<Suspense fallback={<span>Loading component...</span>}>
				<ComponentDetails name={name} />
			</Suspense>
		</a>
	)
}

export default ComponentListItem
