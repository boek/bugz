export type BugType = 'defect' | 'enhancement' | 'task'
export type Status = 'UNCONFIRMED' | 'NEW' | 'ASSIGNED' | 'RESOLVED'
export type Priority = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | '--'
export type Severity = 'S1' | 'S2' | 'S3' | 'S4'

export type Bug = {
	id: number
	status: Status
	type: BugType
	priority: Priority
	severity: Severity
}
