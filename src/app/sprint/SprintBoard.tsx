'use client';

import { Bugs, Bug } from './types'
import { DndContext, useDroppable, useDraggable, DragEndEvent } from '@dnd-kit/core'
import { useState } from 'react'

type SprintBoardType = {
	backlog: number[]
	todo: number[]
}

type Props = {
	bugs: Bugs
}

type ColumnProps = {
	name: string
	bugs: Bugs
}

type CardProps = {
	bug: Bug
}

const Card = ({ bug }: CardProps) => {
	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id: `${bug.id}`
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
			className={`w-72 ${ isOver ? 'bg-indigo-400' : 'bg-indigo-300' } m-2 p-2 rounded`}
			ref={setNodeRef}
		>
			<h1 className="text-xl text-white font-bold">{name}</h1>
			<ul>
				{bugs.map(b => <Card key={b.id} bug={b} />)}
			</ul>
		</div>
	)
}


export default function SprintBoard({ bugs }: Props) {
	const [sprintBoard, setSprintboard] = useState<SprintBoardType>({
		backlog: bugs.map(b => b.id),
		todo: []
	})

	const handleDragEnd = (event: DragEndEvent) => {
		const bugId = event.active.id
		const newBacklog = sprintBoard.backlog.filter(id => id != bugId)
		const newTodo = sprintBoard.todo.filter(id => id != bugId)

		if (event.over?.id == 'Todo') {
			newTodo.unshift(+bugId)
		} else {
			newBacklog.unshift(+bugId)
		}

		setSprintboard({
			backlog: newBacklog,
			todo: newTodo
		})
	}

	return (
		<DndContext onDragEnd={handleDragEnd}>
			<div className='flex'>
				<Column name='Backlog' bugs={bugs.filter(b => sprintBoard.backlog.includes(b.id))} />
				<Column name='Todo' bugs={bugs.filter(b => sprintBoard.todo.includes(b.id))} />
			</div>
		</DndContext>
	)
}
