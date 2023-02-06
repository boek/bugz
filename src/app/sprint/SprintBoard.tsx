'use client';

import { Bugs, Bug } from './types'
import { DndContext, useDroppable, useDraggable, DragEndEvent } from '@dnd-kit/core'
import { useState } from 'react'

type WhiteboardLabel = ''

type BoardColumnName = 'Backlog' | 'Todo' | 'In Progress' | 'In Review' | 'Done'
type BoardColumn = {
	name: BoardColumnName
	bugs: Bugs
}

type Board = {
	columns: BoardColumn[]
}

const boardColumnForBug = (bug: Bug): BoardColumnName => {
	console.log(bug.id, bug.whiteboard);
	const columns: BoardColumnName[] = ['Backlog', 'Todo', 'In Progress', 'In Review', 'Done']
	for (const c of columns) {
		if (bug.whiteboard.includes(c)) {
			return c
		}
	}

	return 'Backlog'
}

const createColumn = (name: BoardColumnName): BoardColumn => ({ name: name, bugs: [] })

const addBug = (board: Board, bug: Bug, column: BoardColumnName) => {
	console.log(bug.id, column);
	const newColumns = board.columns.map((c) => {
		console.log(c.name, column, c.name == column)
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
	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id: `${column}:${bug.id}`
	})

	const style = transform ? {
		transform: `scale(1.1) translate3d(${transform.x}px, ${transform.y}px, 0)`,
	} : undefined

	return (
		<li
			className={`p-2 bg-white m-1 rounded text-xs truncate ${transform ? 'shadow scale-150' : ''}`}
			style={style}
			ref={setNodeRef}
			{...listeners}
			{...attributes}
		>
			{bug.summary}
		</li>
	)
}

const Column = ({ name, bugs }: ColumnProps) => {
	const { isOver, setNodeRef } = useDroppable({
		id: `${name}`
	})

	return (
		<div
			className={`w-72 ${ isOver ? 'bg-indigo-400' : 'bg-indigo-300' } m-2 p-2 rounded flex-none`}
			ref={setNodeRef}
		>
			<h1 className="text-xl text-white font-bold">{name}</h1>
			<ul>
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
		if (typeof event.over?.id == "string" && typeof event.active.id == 'string') {
			const toColumn = event.over?.id as BoardColumnName
			const [fromColumn, id] = event.active.id.split(':')

			if (fromColumn && id) {
				const foo = fromColumn as BoardColumnName
				console.log(id, foo, toColumn)
				setSprintboard(moveCard(sprintBoard, +id, foo, toColumn))
			}
		}
	}
  console.log("b", sprintBoard)
	return (
		<DndContext onDragEnd={handleDragEnd}>
			<div className='flex w-full overflow-x-auto pb-2'>
				{sprintBoard.columns.map(c => <Column key={c.name} name={c.name} bugs={c.bugs} />)}
				{/* <Column name='Backlog' bugs={bugs.filter(b => sprintBoard.backlog.includes(b.id))} />
				<Column name='Todo' bugs={bugs.filter(b => sprintBoard.todo.includes(b.id))} />
				<Column name='In Progress' bugs={bugs.filter(b => sprintBoard.inProgress.includes(b.id))} />
				<Column name='In Review' bugs={bugs.filter(b => sprintBoard.inReview.includes(b.id))} />
				<Column name='Done' bugs={bugs.filter(b => sprintBoard.done.includes(b.id))} /> */}
			</div>
		</DndContext>
	)
}
