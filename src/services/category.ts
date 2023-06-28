import { Knex } from 'knex';
import { Category, CategoryCreate, CategoryUpdate, CategoryFilter, CategoryService } from '../types';
import { CATEGORIES } from '../database';
import { generateId } from '../lib';

interface CategoryStore {
    DB: Knex;
}

export const newCategoryStore = (cs: CategoryStore): CategoryService => {
    const create = async (data: CategoryCreate): Promise<Category> => {
        const id = generateId();

        await cs.DB(CATEGORIES).insert({ ...data, id });

        return get({ id });
    };

    const get = async (filter: CategoryFilter): Promise<Category> => {
        const [category] = await findCategoryQuery(cs.DB, filter);

        return category;
    };

    const list = async (filter: CategoryFilter): Promise<Category[]> => {
        return findCategoryQuery(cs.DB, filter);
    };

    const update = async (filter: CategoryFilter, data: CategoryUpdate): Promise<Category> => {
        await cs.DB(CATEGORIES).where(filter).update(data);

        return get(filter);
    };

    const remove = async (filter: CategoryFilter): Promise<void> => {
        await cs.DB(CATEGORIES).where(filter).del();
    };

    return { create, list, get, update, remove };
};

const findCategoryQuery = (db: Knex, filter: CategoryFilter): Knex.QueryBuilder => {
    const query = db(CATEGORIES).select('id', 'name', 'user', 'created_at', 'updated_at');

    if (filter.id) query.where('id', filter.id);
    if (filter.user) query.where('user', filter.user).orWhereNull('user');
    if (filter.name) query.where(db.raw('lower(name)'), '=', filter.name.toLowerCase());

    return query;
};
