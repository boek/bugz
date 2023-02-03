import { Components } from './Component'
import ComponentListItem from './ComponentItem'

type Props = {
	components: Components
}

const ComponentList = ({ components }: Props) => {
	return (
		<ul className="grid grid-cols-2">
			{components.map((c) => <ComponentListItem key={c.name} name={c.name} />)}
		</ul>
	)
}

export default ComponentList
