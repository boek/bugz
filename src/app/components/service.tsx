import { Bugs, Components } from './types'

export const fetchComponents = async (product: string) => {
	const res = await (await fetch(`https://bugzilla.mozilla.org/rest/product?names=${product}`)).json()
	const components: Components = res.products[0].components

	return components
}

export const fetchBugs = async (component: string) => {
	const res = await fetch(`https://bugzilla.mozilla.org/rest/bug?include_fields=id,summary,status,type,severity,priority&component=${component}&product=Fenix&resolution=---`)
	const json: Bugs = (await res.json()).bugs
	return json
}
