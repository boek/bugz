import { Suspense } from "react"
import Loading from './loading'
import ComponentList from "./ComponentList"
import Component from './Component'

const fetchComponents = async () => {
	const res = await (await fetch(`https://bugzilla.mozilla.org/rest/product?names=Fenix`)).json()
	const components: Component[] = res.products[0].components
	return components
}

export default async function Page() {
	const components = await fetchComponents()

	return (
			<ComponentList components={components} />
	)
};
