import { Knex } from 'knex';
import { UserPushTokenService, UserPushTokenCreate, UserPushToken, UserPushTokenFilter } from '../types';
import { USER_PUSH_TOKENS } from '../database';
import { generateId } from '../lib';

export interface UserPushTokenStore {
    DB: Knex;
}

export const newUserPushTokenStore = (us: UserPushTokenStore): UserPushTokenService => {
    const create = async (data: UserPushTokenCreate): Promise<UserPushToken> => {
        return us.DB.transaction(async (trx) => {
            const id = generateId();
            await trx(USER_PUSH_TOKENS).insert({ id, ...data });
            const [userPushToken] = await userPushTokenQuery(trx, { id });
            return userPushToken;
        });
    };

    const list = async (filter: UserPushTokenFilter): Promise<UserPushToken[]> => {
        return userPushTokenQuery(us.DB, filter);
    };

    const get = async (filter: UserPushTokenFilter): Promise<UserPushToken> => {
        const [userPushToken] = await userPushTokenQuery(us.DB, filter);
        return userPushToken;
    };

    return { create, get, list };
};

const userPushTokenQuery = (db: Knex | Knex.Transaction, filter: UserPushTokenFilter): Knex.QueryBuilder => {
    const query = db(USER_PUSH_TOKENS).select('*').orderBy('created_at', 'desc');

    if (filter.id) query.where('id', filter.id);
    if (filter.user) query.where('user', filter.user);

    return query;
};
