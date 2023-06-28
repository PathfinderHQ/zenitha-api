import { Knex } from 'knex';
import * as dateFns from 'date-fns';
import { Task, TaskCreate, TaskUpdate, TaskFilter, TaskService } from '../types';
import { TASKS } from '../database';
import { generateId } from '../lib';

interface TaskStore {
    DB: Knex;
}

export const newTaskStore = (ts: TaskStore): TaskService => {
    const create = async (data: TaskCreate): Promise<Task> => {
        const id = generateId();

        await ts.DB(TASKS).insert({ ...data, id });

        return get({ id });
    };

    const get = async (filter: TaskFilter): Promise<Task> => {
        const [task] = await findTaskQuery(ts.DB, filter);

        return task;
    };

    const list = async (filter: TaskFilter): Promise<Task[]> => {
        return findTaskQuery(ts.DB, filter);
    };

    const update = async (filter: TaskFilter, data: TaskUpdate): Promise<Task> => {
        if (Object.values(data).length > 0) {
            await ts.DB(TASKS).where(filter).update(data);
        }

        return get(filter);
    };

    const remove = async (filter: TaskFilter): Promise<void> => {
        await ts.DB(TASKS).where(filter).del();
    };

    return { create, list, get, update, remove };
};

const findTaskQuery = (db: Knex, filter: TaskFilter): Knex.QueryBuilder => {
    const query = db(TASKS).select(
        'id',
        'user',
        'category',
        'title',
        'description',
        'completed',
        'time',
        'created_at',
        'updated_at'
    );

    if (filter.id) query.where('id', filter.id);
    if (filter.user) query.where('user', filter.user);
    if (filter.category) query.where('category', filter.category);
    if (filter.completed) query.where('completed', filter.completed);
    if (filter.title) query.where(db.raw('lower(title)'), '=', filter.title.toLowerCase());
    if (filter.time) query.where('time', '>=', dateFns.format(new Date(filter.time), 'yyyy-MM-dd HH:mm:ss'));

    return query;
};
