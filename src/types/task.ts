export interface Task {
    id: string;
    user: string;
    category: string;
    title: string;
    description?: string;
    completed: boolean;
    time: string;
    created_at: Date;
    updated_at: Date;
}

export interface TaskCreate {
    user: string;
    category?: string;
    title: string;
    description?: string;
    completed?: boolean;
    time?: string;
}

export type TaskUpdate = Partial<Omit<TaskCreate, 'user'>>;

export type TaskFilter = Partial<Omit<Task, 'created_at' | 'updated_at' | 'description'>> & {
    ids?: string[];
};

export interface TaskService {
    create(data: TaskCreate[]): Promise<Task[]>;
    list(filter: TaskFilter): Promise<Task[]>;
    get(filter: TaskFilter): Promise<Task>;
    update(filter: TaskFilter, data: TaskUpdate): Promise<Task>;
    remove(filter: TaskFilter): Promise<void>;
}

export interface GeneratedTask {
    title: string;
    description: string;
    time: string;
    summary: string;
}

export interface TaskSummary {
    summary: string;
}
