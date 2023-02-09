'use client';

import { Bugs, Bug } from './types'
import { DragOverlay, DndContext, useDroppable, useDraggable, DragEndEvent, DragStartEvent, useSensors, useSensor, PointerSensor } from '@dnd-kit/core'
import { useState, useEffect } from 'react'
import JsGravatar from '@gravatar/js'
import Link from 'next/link'

type WhiteboardLabel = ''

type BoardColumnName = 'Backlog' | 'Todo' | 'In Progress' | 'In Review' | 'Done'
const columns: BoardColumnName[] = ['Backlog', 'Todo', 'In Progress', 'In Review', 'Done']
type BoardColumn = {
	name: BoardColumnName
	bugs: Bugs
}

type Board = {
	columns: BoardColumn[]
}

const boardColumnForBug = (bug: Bug): BoardColumnName => {
	for (const c of columns) {
		if (bug.whiteboard.includes(c)) {
			return c
		}
	}

	return 'Backlog'
}

const createColumn = (name: BoardColumnName): BoardColumn => ({ name: name, bugs: [] })

const addBug = (board: Board, bug: Bug, column: BoardColumnName) => {
	const newColumns = board.columns.map((c) => {
		if (c.name == column) {
			const newBugs = [bug, ...c.bugs]
			return { ...c, bugs: newBugs }
		} else {
			return c
		}
	})

	return { ...board, columns: newColumns }
}

const createBoard = (bugs: Bugs) => {
	return bugs.reduce((board, bug) => {
		return addBug(board, bug, boardColumnForBug(bug))
	}, { columns: [
		createColumn('Backlog'),
		createColumn('Todo'),
		createColumn('In Progress'),
		createColumn('In Review'),
		createColumn('Done'),
	] })
}

const updateBug = async (bug: Bug, toColumn: BoardColumnName) => {
	let whiteboard = bug.whiteboard
	columns.map((c) => `[bugz:${c}]`).forEach(c => whiteboard = whiteboard.replace(c, ''))
	whiteboard = whiteboard + `[bugz:${toColumn}]`
	await fetch("/api/bugzilla", {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ bugId: bug.id, whiteboard: whiteboard })
	})
}

const moveCard = (board: Board, id: number, fromColumn: BoardColumnName, toColumn: BoardColumnName): Board => {
	if (fromColumn == toColumn) {
		return board
	}

	const bugs = board.columns.flatMap(c => c.bugs)
	const bug = bugs.find (b => b.id == id)
	if (bug == undefined) {
		return board
	}

	return { columns: board.columns.map((c) => {
		if (c.name == fromColumn) {
			return { ...c, bugs: c.bugs.filter(b => b.id != id ) }
		}
		if (c.name == toColumn) {
			return {...c, bugs: [bug, ...c.bugs] }
		}

		return c
	}) }
}

type Props = {
	bugs: Bugs
}

type ColumnProps = {
	name: BoardColumnName
	bugs: Bugs
}

type CardProps = {
	bug: Bug,
	column: BoardColumnName
}

const Card = ({ bug, column }: CardProps) => {
	const re = /\[(.*?)\]/g
	const [matches, setMatches] = useState<string[]>([]);

	useEffect(() => {
		const matchArray = Array.from(bug.whiteboard.matchAll(re), m => m[1]!);
		setMatches(matchArray);
	}, []);
	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id: `${column}:${bug.id}`
	})

	const style = transform ? {
		opacity: 0.5,
	} : undefined

	const email = bug.assigned_to || ""
	const url = JsGravatar({ email: email, size: 150, protocol: 'https' })

	return (
		<li
			className="relative flex flex-col items-start p-4 mt-3 bg-white rounded-lg bg-opacity-90 group hover:bg-opacity-100 overflow-hidden"
			style={style}
			ref={setNodeRef}
			{...listeners}
			{...attributes}
		>
			<Link
				href={`https://bugzilla.mozilla.org/show_bug.cgi?id=${bug.id}`}
				className="text-sm font-medium break-word hover:text-blue-500"
				>{bug.summary}</Link>
			<small className="text-xs opacity-50 mt-2">#{bug.id} assigned to {bug.assigned_to}</small>
			<div className="flex flex-wrap items-center w-full mt-3 text-sm font-medium text-gray-400 pr-8">
				{matches.map((l) => <span className="items-center px-1 text-xs font-semibold text-orange-500 bg-orange-100 border border-orange-300 rounded-full m-px">[{l}]</span>)}
			</div>
			<img className="absolute bottom-4 right-4 w-6 h-6 ml-auto rounded-full" src={url} />
		</li>
	)
}

const Column = ({ name, bugs }: ColumnProps) => {
	const { isOver, setNodeRef } = useDroppable({
		id: `${name}`
	})

	return (
		<div
			className={`flex flex-col flex-none w-80 rounded bg-opacity-30 ${isOver ? 'bg-orange-100/25' : 'bg-white/25'} bg-white/25 backdrop-blur-sm border border-white/20 rounded-lg m-2 shadow-sm `}
			ref={setNodeRef}
		>
			<div className="flex items-center flex-shrink-0 h-10 px-2">
				<span className="block text-sm font-semibold">{name}</span>
				<span className="flex items-center justify-center w-5 h-5 ml-2 text-xs font-semibold text-black-500 bg-white rounded bg-opacity-30">{bugs.length}</span>
			</div>
			<ul className={`flex-grow overflow-y-scroll overflow-x-visible h-32 pr-2 pl-2`}>
				{bugs.map(b => <Card key={b.id} column={name} bug={b} />)}
			</ul>
		</div>
	)
}

export default function SprintBoard({ bugs }: Props) {
	const [sprintBoard, setSprintboard] = useState<Board>(() => {
		return createBoard(bugs)
	})

	const handleDragEnd = (event: DragEndEvent) => {
		setActiveBug(null)
		if (typeof event.over?.id == "string" && typeof event.active.id == 'string') {
			const toColumn = event.over?.id as BoardColumnName
			const [fromColumn, id] = event.active.id.split(':')

			if (fromColumn && id) {
				const foo = fromColumn as BoardColumnName
				setSprintboard(moveCard(sprintBoard, +id, foo, toColumn))
				const bugs = sprintBoard.columns.flatMap(c => c.bugs)
				const bug = bugs.find (b => b.id == +id)
				if (bug != undefined) {
					updateBug(bug, toColumn)
					.then(_ => console.log('updated'))
					.catch(e => console.log('error', e))
				}
			}
		}
	}

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		})
	)

	const [activeBug, setActiveBug] = useState<Bug | null>(null);

	const onDragStart = (event: DragStartEvent) => {
		if (typeof event.active.id == 'string') {
			const [_, id] = event.active.id.split(':')
			const bug = bugs.find (b => b.id == +id!)
			if (bug != undefined) {
				setActiveBug(bug)
			}
		}
	}

	return (
		<DndContext onDragEnd={handleDragEnd} onDragStart={onDragStart} sensors={sensors}>
			<div className='grow flex flex-1 px-10 mt-4 space-x-6 p-4'>
				{sprintBoard.columns.map(c => <Column key={c.name} name={c.name} bugs={c.bugs} />)}
				{/* <Column name='Backlog' bugs={bugs.filter(b => sprintBoard.backlog.includes(b.id))} />
				<Column name='Todo' bugs={bugs.filter(b => sprintBoard.todo.includes(b.id))} />
				<Column name='In Progress' bugs={bugs.filter(b => sprintBoard.inProgress.includes(b.id))} />
				<Column name='In Review' bugs={bugs.filter(b => sprintBoard.inReview.includes(b.id))} />
				<Column name='Done' bugs={bugs.filter(b => sprintBoard.done.includes(b.id))} /> */}
			</div>
			<DragOverlay>
				<div className="w-72">
					<Card bug={activeBug} />
				</div>
			</DragOverlay>
		</DndContext>
	)
}
