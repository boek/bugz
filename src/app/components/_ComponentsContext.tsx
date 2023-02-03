import Component from "./Component";
import { createContext, useContext } from 'react'

export type Components = { [key: string]: Component }
export type ComponentsContextType = {
	components: Components,
	updateComponents: (components: Components) => void
}

export const ComponentsContext = createContext<ComponentsContextType>({
	components: {},
	updateComponents: () => {}
});

export const ComponentsContextProvider = ComponentsContext.Provider

export const useComponents = () => {
	const { components } = useContext(ComponentsContext)
	return components
}

export const useUpdateComponent = () => {
	const { components, updateComponents } = useContext(ComponentsContext)

	return (component: Component) => {
		const updatedComponent: Components = { [component.name]: component }
		updateComponents({ ...components, ...updatedComponent })
	}
}
