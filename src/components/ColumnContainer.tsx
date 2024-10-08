import {Column, Id, Task} from "../types.ts";
import TrashIcon from "../icons/TrashIcon.tsx";
import {SortableContext, useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {useMemo, useState} from "react";
import PlusCircleIcon from "../icons/PlusCircleIcon.tsx";
import TaskCard from "./TaskCard.tsx";

interface Props {
    column: Column;
    deleteColumn: (id: Id) => void;
    updateColumn: (id: Id, title: string) => void;
    createTask: (columnId: Id) => void;
    deleteTask: (id: Id) => void;
    tasks: Task[];
    editTask: (id: Id, title: string, deadline: Date | null) => void;
}

const ColumnContainer = (props: Props) => {
    const {column, deleteColumn, updateColumn, createTask, tasks, deleteTask, editTask} = props;

    const [isEditing, setEditing] = useState(false);

    const tasksIds = useMemo(() => {
        return tasks.map(task => task.id);
    }, [tasks]);

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column,
        },
        disabled: isEditing,
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    }

    if (isDragging) {
        return (
            <div ref={setNodeRef} style={style}
                 className="bg-columnBackground w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col border-2 border-rose-500 opacity-30">
            </div>
        )
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-columnBackground w-[350px] h-[500px] max-h-[500px] rounded-md flex flex-col">
            <div
                {...attributes}
                {...listeners}
                onClick={() => setEditing(true)}
                className="flex bg-mainBackground text-md h-[60px] cursor-grab rounded-md rounded-b-none p-3 font-bold border-4 border-columnBackground items-center justify-between">
                <div className="flex gap-2 items-center">
                    {/*You can edit the column title by simply clicking on it*/}
                    {!isEditing ? column.title : (
                        <input
                            className="bg-black focus:border-rose-500 border rounded outline-none px-2"
                            value={column.title}
                            onChange={e => updateColumn(column.id, e.target.value)}
                            autoFocus
                            onBlur={() => {
                                setEditing(false)
                            }}
                            onKeyDown={(e) => {
                                if (e.key !== "Enter") return;
                                setEditing(false)
                            }}
                        />)}
                </div>
                <button onClick={() => {
                    deleteColumn(column.id)
                }} className="stroke-gray-500 hover:stroke-white hover:bg-columnBackground rounded px-1 py-2">
                    <TrashIcon/>
                </button>
            </div>
            {/*Tasks List*/}
            <div className="flex flex-grow flex-col gap-4 p-2 over-x-hidden overflow-y-auto">
                <SortableContext items={tasksIds}>
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} deleteTask={deleteTask} editTask={editTask}/>
                    ))}
                </SortableContext>
            </div>

            <button
                onClick={() => createTask(column.id)}
                className="flex gap-2 items-center border-columnBackground border-2 rounded-md p-3 border-x-columnBackground hover:bg-mainBackground hover:text-rose-500 active:bg-black">
                <PlusCircleIcon/>
                Add Task
            </button>
        </div>
    );
};

export default ColumnContainer;