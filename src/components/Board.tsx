import PlusIcon from "../icons/PlusIcon.tsx";
import {useMemo, useState} from "react";
import {Column, Id} from "../types.ts";
import ColumnContainer from "./ColumnContainer.tsx";
import {DndContext, DragStartEvent} from "@dnd-kit/core";
import {SortableContext} from "@dnd-kit/sortable";

const Board = () => {
    const [columns, setColumns] = useState<Column[]>([]);
    const columnsId = useMemo(() => columns.map(col => col.id),[columns]);

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

    function onDragStart(event:DragStartEvent){
        console.log("onDragStart", event);
    }

    return (
        <div className="mx-auto flex min-h-screen w-full items-center overflow-x-auto">
            <DndContext onDragStart={onDragStart}>
                <div className="mx-auto flex gap-4">
                    <div className="flex gap-4">
                        <SortableContext items={columnsId}>
                            {columns.map((col) => (
                                <ColumnContainer key={col.id} column={col} deleteColumn={deleteColumn}/>
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
            </DndContext>
        </div>
    );
};

export default Board;