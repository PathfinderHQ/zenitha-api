import { Knex } from 'knex';
import { User, UserService, UserUpdate, UserFilter, UserCreate } from '../types';
import { USERS } from '../database';
import { generateId } from '../lib';

export interface UserStore {
    DB: Knex;
}

export const newUserStore = (us: UserStore): UserService => {
    const create = async (data: UserCreate): Promise<User> => {
        const id = generateId();
        await us.DB(USERS).insert({ id, ...data });

        const [user] = await userQuery(us.DB, { id });

        return user;
    };

    const list = async (filter: UserFilter): Promise<User[]> => {
        return userQuery(us.DB, filter);
    };

    const get = async (filter: UserFilter): Promise<User> => {
        const [user] = await userQuery(us.DB, filter);

        return user;
    };

    const update = async (filter: UserFilter, data: UserUpdate): Promise<User> => {
        if (Object.keys(data).length === 0) {
            await us.DB(USERS).where(filter).update(data);
        }

        const [user] = await userQuery(us.DB, filter);

        return user;
    };

    const remove = async (filter: UserFilter): Promise<void> => {
        await us.DB(USERS).where(filter).del();
    };



    return  { create, get, list, update, remove }
}

const userQuery = (db: Knex, filter: UserFilter): Knex.QueryBuilder => {
    const query = db(USERS)
        .select('*')
        .orderBy('created_at', 'desc');

    if (filter.id) query.where('id', filter.id);
    if (filter.email) query.where(db.raw('lower(u.email)'), '=', filter.email.toLowerCase);
    if (filter.sign_in_provider) query.where('sign_in_provider', filter.sign_in_provider);

    return query;
}
