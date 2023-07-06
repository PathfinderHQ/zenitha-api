export interface Category {
    id: string;
    name: string;
    color: string;
    user?: string;
    created_at: Date;
    updated_at: Date;
}

export type CategoryCreate = Pick<Category, 'name' | 'user'>;

export type CategoryUpdate = Partial<Pick<Category, 'name' | 'color'>>;

export type CategoryFilter = Partial<Omit<Category, 'created_at' | 'updated_at'>> & {
    user_or_null?: string;
};

export interface CategoryService {
    create(data: CategoryCreate): Promise<Category>;
    list(filter: CategoryFilter): Promise<Category[]>;
    get(category: CategoryFilter): Promise<Category>;
    update(filter: CategoryFilter, data: CategoryUpdate): Promise<Category>;
    remove(filter: CategoryFilter): Promise<void>;
}
