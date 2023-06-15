import { SignInProvider } from './enums';

export interface User {
    id: string;
    first_name?: string;
    last_name?: string;
    email: string;
    password?: string;
    sign_in_provider: SignInProvider;
    google_user_id?: string;
    verified?: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface UserCreate {
    email: string;
    password?: string;
    sign_in_provider: SignInProvider;
    google_user_id?: string;
    verified?: boolean;
}

export interface UserUpdate {
    first_name?: string;
    last_name?: string;
    password?: string;
    google_user_id?: string;
    verified?: boolean;
}

export interface UserFilter {
    id?: string;
    email?: string;
    sign_in_provider?: SignInProvider;
    verified?: boolean;
}

export interface UserService {
    create(data: UserCreate): Promise<User>;
    list(filter: UserFilter): Promise<User[]>;
    get(filter: UserFilter): Promise<User>;
    update(filter: UserFilter, data: UserUpdate): Promise<User>;
}
