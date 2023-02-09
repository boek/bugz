export type BugType = 'defect' | 'enhancement' | 'task'
export type Priority = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | '--'

export type Bug = {
	id: number
	type: BugType
	priority: Priority
	summary: string
	whiteboard: string
	assigned_to?: string
}

export type Bugs = Bug[]
