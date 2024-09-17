import {Id, Task} from "../types.ts";
import TrashIcon from "../icons/TrashIcon.tsx";
import {useState} from "react";

interface Props {
    task: Task;
    deleteTask: (id: Id) => void;
}

const TaskCard = ({task,deleteTask}:Props) => {
   const [isMouseOver, setIsMouseOver] = useState(false);

   return (
        <div
            onMouseEnter={() => setIsMouseOver(true)}
            onMouseLeave={() => setIsMouseOver(false)}
            className="bg-mainBackground relative cursor-grab p-2.5 h-20 min-h-20 rounded-xl items-center flex text-left hover:ring-2 hover:ring-inset hover:ring-rose-500">
            {task.title}
            {isMouseOver && (
                <button
                    onClick={()=> deleteTask(task.id)}
                    className="stroke-white absolute right-4 top-1/2 -translate-y-1/2 bg-columnBackground p-2 rounded opacity-60 hover:opacity-100">
                    <TrashIcon/>
                </button>
            )
            }

        </div>
   );
};

export default TaskCard;