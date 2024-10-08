export type Id = string | number;

export type Column = {
    id: Id,
    title: string,
}

export type Task = {
    id: Id,
    columnId: Id,
    title: string,
    createdAt: Date,
    modifiedAt: Date,
    deadline: Date | null,
}
