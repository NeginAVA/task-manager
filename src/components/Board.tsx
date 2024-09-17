import PlusIcon from "../icons/PlusIcon.tsx";
import {useMemo, useState} from "react";
import {Column, Id} from "../types.ts";
import ColumnContainer from "./ColumnContainer.tsx";
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import {arrayMove, SortableContext} from "@dnd-kit/sortable";
import {createPortal} from "react-dom";

const Board = () => {
    const [columns, setColumns] = useState<Column[]>([]);
    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const columnsId = useMemo(() => columns.map(col => col.id), [columns]);

    const sensors=useSensors(
        useSensor(PointerSensor,{
            activationConstraint:{
                distance:5,
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
        const newColumns=columns.map(col=>{
            if(col.id !== id) return col;
            return {...col, title};
        })
        setColumns(newColumns);
    }

    function onDragStart(event: DragStartEvent) {
        console.log("onDragStart", event);
        if (event.active.data.current.type === "Column") {
            setActiveColumn(event.active.data.current.column);
            return;
        }
    }

    function onDragEnd(event: DragEndEvent) {
        const {active, over} = event;
        if (!over) return;

        const activeColumnId = active.id;
        const overColumnId = over.id;
        if (activeColumnId === overColumnId) return;
        setColumns(columns => {
            const activeColumnIndex = columns.findIndex(
                col => col.id === activeColumnId
            );

            const overColumnIndex = columns.findIndex(
                col => col.id === overColumnId
            );

            return arrayMove(columns,activeColumnIndex, overColumnIndex);
        })

    }

    return (
        <div className="mx-auto flex min-h-screen w-full items-center overflow-x-auto">
            <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
                <div className="mx-auto flex gap-4">
                    <div className="flex gap-4">
                        <SortableContext items={columnsId}>
                            {columns.map((col) => (
                                <ColumnContainer
                                    key={col.id}
                                    column={col}
                                    deleteColumn={deleteColumn}
                                    updateColumn={updateColumn}
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
                            />
                        )}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>
        </div>
    );
};

export default Board;