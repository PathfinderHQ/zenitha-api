import { Knex } from 'knex';
import { User, UserService, UserUpdate, UserFilter, UserCreate } from '../types';
import { USERS } from '../database';
import { generateId, hashPassword } from '../lib';

export interface UserStore {
    DB: Knex;
}

// Create a store that access the database to run operations peculiar to user service
export const newUserStore = (us: UserStore): UserService => {
    // create a user
    const create = async (data: UserCreate): Promise<User> => {
        const id = generateId();

        // hash password before saving to the database if it exists
        if (data.password) {
            data.password = hashPassword(data.password);
        }

        await us.DB(USERS).insert({ id, ...data });

        const [user] = await userQuery(us.DB, { id });

        return user;
    };

    // get list of users
    const list = async (filter: UserFilter): Promise<User[]> => {
        return userQuery(us.DB, filter);
    };

    // get a user
    const get = async (filter: UserFilter): Promise<User> => {
        const [user] = await userQuery(us.DB, filter);

        return user;
    };

    // update user
    const update = async (filter: UserFilter, data: UserUpdate): Promise<User> => {
        // check to match sure the update data is not empty
        if (Object.keys(data).length > 0) {
            // hash the password if it is part of the payload
            if (data.password) {
                data.password = hashPassword(data.password);
            }

            await us.DB(USERS).where(filter).update(data);
        }

        const [user] = await userQuery(us.DB, filter);

        return user;
    };

    return { create, get, list, update };
};

// Build our user database query dynamically
const userQuery = (db: Knex, filter: UserFilter): Knex.QueryBuilder => {
    const query = db(USERS).select('*').orderBy('created_at', 'desc');

    if (filter.id) query.where('id', filter.id);
    if (filter.email) query.where(db.raw('lower(email)'), '=', filter.email.toLowerCase());
    if (filter.sign_in_provider) query.where('sign_in_provider', filter.sign_in_provider);

    return query;
};
