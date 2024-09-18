import PlusIcon from "../icons/PlusIcon.tsx";
import {useMemo, useState} from "react";
import {Column, Id, Task} from "../types.ts";
import ColumnContainer from "./ColumnContainer.tsx";
import {
    DndContext,
    DragEndEvent, DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import {arrayMove, SortableContext} from "@dnd-kit/sortable";
import {createPortal} from "react-dom";
import TaskCard from "./TaskCard.tsx";

const Board = () => {
    const [columns, setColumns] = useState<Column[]>([]);
    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const columnsId = useMemo(() => columns.map(col => col.id), [columns]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            }
        })
    )

    function createNewColumn() {
        const columnToAdd: Column = {
            id: generateId(),
            title: `Column ${columns.length + 1}`,
        }

        setColumns([...columns, columnToAdd]);
    }

    function generateId() {
        //     Generate a random number between 0 and 10000
        return Math.floor(Math.random() * 1000);
    }

    function deleteColumn(id: Id) {
        const filteredColumns = columns.filter((column) => column.id !== id);
        setColumns(filteredColumns);
    }

    function updateColumn(id: Id, title: string) {
        const newColumns = columns.map(col => {
            if (col.id !== id) return col;
            return {...col, title};
        })
        setColumns(newColumns);

        const newTasks =tasks.filter((task) => task.columnId !== id);
        setTasks(newTasks);
    }

    function createTask(columnId: Id) {
        const newTask: Task = {
            id: generateId(),
            columnId,
            title: `Task ${tasks.length + 1}`,
        }

        setTasks([...tasks, newTask]);
    }

    function deleteTask(id: Id) {
        const newTasks = tasks.filter(task => task.id !== id);
        setTasks(newTasks);
    }

    function editTask(id: Id, title: string) {
        const newTasks = tasks.map(task => {
            if (task.id !== id) return task;
            return {...task, title};
        });
        setTasks(newTasks)
    }

    function onDragStart(event: DragStartEvent) {
        if (event.active.data.current?.type === "Column") {
            setActiveColumn(event?.active.data.current.column);
            return;
        }
        if (event.active.data.current?.type === "Task") {
            setActiveTask(event?.active.data.current.task);
            return;
        }
    }

    function onDragEnd(event: DragEndEvent) {
        setActiveColumn(null);
        setActiveTask(null);

        const {active, over} = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        setColumns(columns => {
            const activeColumnIndex = columns.findIndex(
                col => col.id === activeId
            );

            const overColumnIndex = columns.findIndex(
                col => col.id === overId
            );

            return arrayMove(columns, activeColumnIndex, overColumnIndex);
        })
    }

    function onDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveATask = active.data.current?.type === "Task";
        const isOverATask = over.data.current?.type === "Task";
        const isOverAColumn = over.data.current?.type === "Column";

        if (!isActiveATask) return;

        // Dropping a Task over another Task
        if (isActiveATask && isOverATask) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                const overIndex = tasks.findIndex((t) => t.id === overId);

                if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
                    // Task is moved to a new column
                    tasks[activeIndex].columnId = tasks[overIndex].columnId;
                    return arrayMove(tasks, activeIndex, overIndex - 1);
                }

                // Task is moved within the same column
                return arrayMove(tasks, activeIndex, overIndex);
            });
        }

        // Dropping a Task over a Column
        if (isActiveATask && isOverAColumn) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                tasks[activeIndex].columnId = overId;
                return arrayMove(tasks, activeIndex, activeIndex);
            });
        }
    }

    return (
        <div className="m-auto flex min-h-screen w-full items-center overflow-x-auto px-10">
            <DndContext
                sensors={sensors}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
            >
                <div className="mx-auto flex gap-4">
                    <div className="flex gap-4">
                        <SortableContext items={columnsId}>
                            {columns.map((col) => (
                                <ColumnContainer
                                    key={col.id}
                                    column={col}
                                    deleteColumn={deleteColumn}
                                    updateColumn={updateColumn}
                                    createTask={createTask}
                                    deleteTask={deleteTask}
                                    tasks={tasks.filter(task => task.columnId === col.id)}
                                    editTask={editTask}
                                />
                            ))}
                        </SortableContext>
                    </div>
                    <button
                        onClick={() => createNewColumn()}
                        className="flex gap-2 h-[60px] w-[350px] min-w-[350px] rounded-lg bg-mainBackground border-2 border-columnBackground p-4 ring-rose-500 hover:ring-2">
                        <PlusIcon/>
                        Add Column
                    </button>
                </div>
                {createPortal(
                    <DragOverlay>
                        {activeColumn && (
                            <ColumnContainer
                                column={activeColumn}
                                deleteColumn={deleteColumn}
                                updateColumn={updateColumn}
                                createTask={createTask}
                                deleteTask={deleteTask}
                                tasks={tasks.filter(task => task.columnId === activeColumn.id)}
                                editTask={editTask}
                            />
                        )}
                        {activeTask && <TaskCard task={activeTask} deleteTask={deleteTask} editTask={editTask}/>}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>
        </div>
    );
};

export default Board;