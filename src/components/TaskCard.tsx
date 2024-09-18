import { useState, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import TrashIcon from "../icons/TrashIcon.tsx";
import EditIcon from "../icons/EditIcon.tsx";
import OptionsIcon from "../icons/OptionsIcon.tsx";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Id, Task } from "../types.ts";

interface Props {
    task: Task;
    deleteTask: (id: Id) => void;
    editTask: (id: Id, title: string, deadline: Date | null) => void;
}

const TaskCard = ({ task, deleteTask, editTask }: Props) => {
    const [isMouseOver, setIsMouseOver] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [renderTimestamp, setRenderTimestamp] = useState(new Date());
    const [editedTitle, setEditedTitle] = useState(task.title);
    const [editedDeadline, setEditedDeadline] = useState<Date | null>(task.deadline || null);
    const [isTitleValid, setIsTitleValid] = useState(true);

    useEffect(() => {
        setRenderTimestamp(new Date());
        setEditedTitle(task.title);
        setEditedDeadline(task.deadline || null);
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
    };

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

    const handleEditSave = () => {
        if (!editedTitle.trim()) {
            setIsTitleValid(false);
            return;
        }
        editTask(task.id, editedTitle, editedDeadline);
        toggleEditMode();
    };

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

    const getDeadlineStatus = () => {
        if (!task.deadline) return { style: '', text: 'No deadline' };

        const now = new Date();
        const timeDiff = task.deadline.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 3600);

        if (hoursDiff < 0) {
            return { style: 'bg-red-500 text-white', text: 'Overdue' };
        } else if (hoursDiff < 12) {
            return { style: 'bg-red-500 text-white', text: 'Less than 12 hours' };
        } else if (hoursDiff < 24) {
            return { style: 'bg-yellow-500 text-black', text: 'Less than 24 hours' };
        } else {
            return { style: 'border border-gray-500', text: formatDate(task.deadline) };
        }
    };

    const deadlineStatus = getDeadlineStatus();

    if (isDragging) {
        return (
            <div ref={setNodeRef}
                 style={style} className="task bg-mainBackground relative cursor-grab p-2.5 h-[120px] min-h-[120px] rounded-xl items-center flex text-left border-2 border-rose-500 opacity-50">
            </div>
        );
    }

    if (isEditMode) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                className="task bg-mainBackground relative cursor-grab p-2.5 h-[160px] min-h-[160px] rounded-xl flex flex-col text-left hover:ring-2 hover:ring-inset hover:ring-rose-500"
            >
                <textarea
                    value={editedTitle}
                    onChange={(e) => {
                        setEditedTitle(e.target.value);
                        setIsTitleValid(true);
                    }}
                    className={`px-2 w-full resize-none bg-transparent border ${isTitleValid ? 'border-gray-900' : 'border-red-500'} rounded-lg text-white focus:outline-none mb-2 p-1`}
                    placeholder="Enter task title"
                />
                {!isTitleValid && <p className="text-red-500 text-sm">Title is required</p>}

                <div className="flex items-center justify-between mb-2 relative w-full">
                    <input
                        type="datetime-local"
                        value={editedDeadline ? editedDeadline.toISOString().slice(0, -1) : ''}
                        onChange={(e) => {
                            setEditedDeadline(new Date(e.target.value));
                        }}
                        className="w-full p-2 border border-gray-900 bg-transparent text-white rounded-md"
                    />
                </div>
                <button
                    onClick={handleEditSave}
                    className="bg-rose-500 text-white rounded px-2 py-1 text-sm self-end mt-2"
                >
                    Save
                </button>
            </div>
        );
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
            className="bg-mainBackground relative cursor-grab p-2.5 h-[120px] min-h-[120px] rounded-xl flex flex-col text-left hover:ring-2 hover:ring-inset hover:ring-rose-500"
        >
            <p className="my-2 h-[60%] w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap">{task.title}</p>

            <div className="text-left w-full h-fit pt-2">
                <span className="text-[10px] text-gray-400 absolute bottom-2 left-2 bg-gray-800 px-2 py-1 rounded-full">
                    {formatDate(renderTimestamp)}
                </span>
                <span className={`text-[10px] absolute bottom-2 right-2 px-2 py-1 rounded-full ${deadlineStatus.style}`}>
                    {deadlineStatus.text}
                </span>
            </div>

            {isMouseOver && (
                <div className="absolute right-4 top-1/3 -translate-y-1/2 z-10">
                    <button
                        onClick={toggleMenu}
                        className="stroke-white bg-columnBackground p-2 rounded opacity-60 hover:opacity-100"
                    >
                        <OptionsIcon />
                    </button>
                    {isMenuOpen && (
                        <div
                            className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-columnBackground ring-1 ring-white ring-opacity-5 z-20"
                            style={{
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            }}
                        >
                            <div className="py-1" role="menu" aria-orientation="vertical"
                                 aria-labelledby="options-menu">
                                <button
                                    onClick={toggleEditMode}
                                    className="flex items-center px-4 py-2 text-sm text-gray-400 hover:text-gray-200 w-full text-left"
                                    role="menuitem"
                                >
                                    <EditIcon />
                                    <span className="ml-2">Edit Task</span>
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="stroke-gray-400 hover:stroke-gray-200 flex items-center px-4 py-2 text-sm text-gray-400 hover:text-gray-200 w-full text-left"
                                    role="menuitem"
                                >
                                    <TrashIcon />
                                    <span className="ml-2">Delete</span>
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
