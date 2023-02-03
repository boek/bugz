import ComponentListItem from "./ComponentItem"
import { Suspense, use } from 'react'

type Component = {
	name: string
}

const fetchComponents = async () => {
	const res = await (await fetch(`https://bugzilla.mozilla.org/rest/product?names=Fenix`)).json()
	const components: Component[] = res.products[0].components
	return components
}

const ComponentList = () => {
	const components = use(fetchComponents())

	return (
		<>
		<h1>Total 400</h1>
		<ul className="grid grid-cols-2">
			{components.map(c => {
				return (
					<Suspense fallback={<li>{c.name}: </li>}>
						<ComponentListItem key={c.name} name={c.name} />
					</Suspense>
				)
			})}
		</ul>
		</>
	)
}

export default ComponentList
