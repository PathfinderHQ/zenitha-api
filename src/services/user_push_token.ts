import { Knex } from 'knex';
import { UserPushTokenService, UserPushTokenCreate, UserPushToken, UserPushTokenFilter } from '../types';
import { USER_PUSH_TOKENS } from '../database';

export interface UserPushTokenStore {
    DB: Knex;
}

export const newUserPushTokenStore = (upts: UserPushTokenStore): UserPushTokenService => {
    const create = async (data: UserPushTokenCreate): Promise<void> => {
        await upts.DB(USER_PUSH_TOKENS).insert(data);
    };

    const list = async (filter: UserPushTokenFilter): Promise<UserPushToken[]> => {
        return userPushTokenQuery(upts.DB, filter);
    };

    const get = async (filter: UserPushTokenFilter): Promise<UserPushToken> => {
        const [userPushToken] = await userPushTokenQuery(upts.DB, filter);
        return userPushToken;
    };

    return { create, get, list };
};

const userPushTokenQuery = (db: Knex | Knex.Transaction, filter: UserPushTokenFilter): Knex.QueryBuilder => {
    const query = db(USER_PUSH_TOKENS).select('*').orderBy('created_at', 'desc');

    if (filter.id) query.where('id', filter.id);
    if (filter.user) query.where('user', filter.user);
    if (filter.push_token) query.where('push_token', filter.push_token);

    return query;
};
