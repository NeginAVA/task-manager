import {Id, Task} from "../types.ts";
import TrashIcon from "../icons/TrashIcon.tsx";
import EditIcon from "../icons/EditIcon.tsx";
import {useState, useEffect} from "react";
import OptionsIcon from "../icons/OptionsIcon.tsx";
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";

interface Props {
    task: Task;
    deleteTask: (id: Id) => void;
    editTask: (id: Id, title: string) => void;
}

const TaskCard = ({task, deleteTask, editTask}: Props) => {
    const [isMouseOver, setIsMouseOver] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [renderTimestamp, setRenderTimestamp] = useState(new Date());

    useEffect(() => {
        setRenderTimestamp(new Date());
    }, [task]);

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: task.id,
        data: {
            type: "Task",
            task,
        },
        disabled: isEditMode,
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    }

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleDelete = () => {
        deleteTask(task.id);
        setIsMenuOpen(false);
    };

    const toggleEditMode = () => {
        setIsEditMode((prev) => !prev);
        setIsMenuOpen(false);
    };

    // Function to format the date and time
    const formatDate = (date: Date) => {
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    };

    if (isDragging) {
        return (
            <div ref={setNodeRef}
                 style={style} className="task bg-mainBackground relative cursor-grab p-2.5 h-20 min-h-20 rounded-xl items-center flex text-left border-2 border-rose-500 opacity-50">
            </div>
        )
    }

    if (isEditMode) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                className="task bg-mainBackground relative cursor-grab p-2.5 h-20 min-h-20 rounded-xl items-center flex text-left hover:ring-2 hover:ring-inset hover:ring-rose-500"
            >
                <textarea value={task.title}
                          autoFocus
                          placeholder="Enter task title"
                          onBlur={toggleEditMode}
                          onKeyDown={(e) => {
                              if (e.key === "Enter" && e.shiftKey) toggleEditMode();
                          }}
                          onChange={(e) => editTask(task.id, e.target.value)}
                          className="h-[90%] w-full resize-none bg-transparent border border-gray-900 rounded-lg text-white focus:outline-none"/>
            </div>
        )
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onMouseEnter={() => setIsMouseOver(true)}
            onMouseLeave={() => {
                setIsMouseOver(false);
                setIsMenuOpen(false);
            }}
            className="bg-mainBackground relative cursor-grab p-2.5 h-[100px] min-h-[100px] rounded-xl items-center flex flex-col text-left hover:ring-2 hover:ring-inset hover:ring-rose-500"
        >
            <p className="my-auto h-[75%] w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap">{task.title}</p>

            <div className="text-left w-full h-fit pt-6">
                <span className="text-[10px] text-gray-400 absolute bottom-2 left-2 bg-gray-800 px-2 py-1 rounded-full">
                {formatDate(renderTimestamp)}
            </span>
            </div>

            {isMouseOver && (
                <div className="absolute right-4 top-1/3 -translate-y-1/2">
                    <button
                        onClick={toggleMenu}
                        className="stroke-white bg-columnBackground p-2 rounded opacity-60 hover:opacity-100"
                    >
                        <OptionsIcon/>
                    </button>
                    {isMenuOpen && (
                        <div
                            className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-columnBackground ring-1 ring-white ring-opacity-5">
                            <div className="py-1" role="menu" aria-orientation="vertical"
                                 aria-labelledby="options-menu">
                                <button
                                    onClick={toggleEditMode}
                                    className="flex items-center px-4 py-2 text-sm text-gray-400 hover:text-gray-200 w-full text-left"
                                    role="menuitem"
                                >
                                    <EditIcon/>
                                    <span className="ml-2">Edit Task</span>
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="stroke-gray-400 hover:stroke-gray-200 flex items-center px-4 py-2 text-sm text-gray-400 hover:text-gray-200 w-full text-left"
                                    role="menuitem"
                                >
                                    <TrashIcon/>
                                    <span className="ml-2">Delete Task</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TaskCard;