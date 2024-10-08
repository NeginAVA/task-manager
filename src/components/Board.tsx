import PlusIcon from "../icons/PlusIcon.tsx";
import { useMemo, useState } from "react";
import { Column, Id, Task } from "../types.ts";
import ColumnContainer from "./ColumnContainer.tsx";
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard.tsx";

const Board = () => {
    const [columns, setColumns] = useState<Column[]>([
        { id: 1, title: "Todo" },
        { id: 2, title: "Doing" },
        { id: 3, title: "Done" },
    ]);
    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDeadline, setNewTaskDeadline] = useState<string>("");
    const [newTaskColumnId, setNewTaskColumnId] = useState<Id | null>(null);
    const [newTaskTitleValid, setNewTaskTitleValid] = useState(true); // Validation state

    const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    function generateId() {
        return Math.floor(Math.random() * 9000) + 1000;
    }

    function createNewColumn() {
        const columnToAdd: Column = {
            id: generateId(),
            title: `Column ${columns.length + 1}`,
        };

        setColumns([...columns, columnToAdd]);
    }

    function deleteColumn(id: Id) {
        const filteredColumns = columns.filter((column) => column.id !== id);
        setColumns(filteredColumns);
    }

    function updateColumn(id: Id, title: string) {
        const newColumns = columns.map((col) => {
            if (col.id !== id) return col;
            return { ...col, title };
        });
        setColumns(newColumns);

        const newTasks = tasks.filter((task) => task.columnId !== id);
        setTasks(newTasks);
    }

    function openCreateTaskModal(columnId: Id) {
        setNewTaskColumnId(columnId);
        setIsModalOpen(true);
    }

    function closeCreateTaskModal() {
        setIsModalOpen(false);
        setNewTaskTitle("");
        setNewTaskDeadline("");
        setNewTaskColumnId(null);
        setNewTaskTitleValid(true); // Reset validation
    }

    function createTask() {
        // Validate task title
        if (!newTaskTitle.trim()) {
            setNewTaskTitleValid(false); // Trigger validation error
            return;
        }

        if (!newTaskColumnId) return;

        const currentTime = new Date();
        const newTask: Task = {
            id: generateId(),
            columnId: newTaskColumnId,
            title: newTaskTitle,
            createdAt: currentTime,
            modifiedAt: currentTime,
            deadline: newTaskDeadline ? new Date(newTaskDeadline) : null,
        };

        setTasks([...tasks, newTask]);
        closeCreateTaskModal(); // Close the modal after creating the task
    }

    function deleteTask(id: Id) {
        const newTasks = tasks.filter((task) => task.id !== id);
        setTasks(newTasks);
    }

    function editTask(id: Id, title: string, deadline: Date | null) {
        setTasks((tasks) => {
            return tasks.map((task) => {
                if (task.id !== id) return task;
                const updatedDeadline = deadline !== null && deadline !== task.deadline ? deadline : task.deadline;

                return {
                    ...task,
                    title,
                    deadline: updatedDeadline,
                    modifiedAt: new Date(),
                };
            });
        });
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

        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        setColumns((columns) => {
            const activeColumnIndex = columns.findIndex((col) => col.id === activeId);
            const overColumnIndex = columns.findIndex((col) => col.id === overId);

            return arrayMove(columns, activeColumnIndex, overColumnIndex);
        });
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

        if (isActiveATask && isOverATask) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                const overIndex = tasks.findIndex((t) => t.id === overId);

                if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
                    tasks[activeIndex].columnId = tasks[overIndex].columnId;
                    return arrayMove(tasks, activeIndex, overIndex - 1);
                }

                return arrayMove(tasks, activeIndex, overIndex);
            });
        }

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
                                    createTask={() => openCreateTaskModal(col.id)}
                                    deleteTask={deleteTask}
                                    tasks={tasks.filter((task) => task.columnId === col.id)}
                                    editTask={editTask}
                                />
                            ))}
                        </SortableContext>
                    </div>
                    <button
                        onClick={() => createNewColumn()}
                        className="flex gap-2 h-[60px] w-[350px] min-w-[350px] rounded-lg bg-mainBackground border-2 border-columnBackground p-4 ring-rose-500 hover:ring-2"
                    >
                        <PlusIcon />
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
                                createTask={() => {}}
                                deleteTask={deleteTask}
                                tasks={tasks.filter(
                                    (task) => task.columnId === activeColumn.id
                                )}
                                editTask={editTask}
                            />
                        )}
                        {activeTask && (
                            <TaskCard
                                task={activeTask}
                                deleteTask={deleteTask}
                                editTask={editTask}
                            />
                        )}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>

            {/* Create Task Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-mainBackground p-6 rounded-lg w-96">
                        <h2 className="text-2xl mb-4 text-white">Create New Task</h2>
                        <textarea
                            value={newTaskTitle}
                            onChange={(e) => {
                                setNewTaskTitle(e.target.value);
                                setNewTaskTitleValid(true); // Reset validation on input
                            }}
                            placeholder="Enter task title"
                            className={`w-full p-2 mb-4 bg-columnBackground text-white rounded-md ${!newTaskTitleValid ? 'border border-red-500' : ''}`} // Apply red border if invalid
                        />
                        {!newTaskTitleValid && <p className="text-red-500 mb-4">Task title is required</p>} {/* Error message */}
                        <input
                            type="datetime-local"
                            value={newTaskDeadline}
                            onChange={(e) => setNewTaskDeadline(e.target.value)}
                            className="w-full p-2 mb-4 bg-columnBackground text-white rounded-md"
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={closeCreateTaskModal}
                                className="text-white py-1.5 px-4 mr-2 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createTask}
                                className="bg-rose-500 text-sm text-white py-1.5 px-4 rounded-lg"
                            >
                                Create Task
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Board;
