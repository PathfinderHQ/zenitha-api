import { SignInProvider } from './enum';

export interface User {
    id: string;
    first_name?: string;
    last_name?: string;
    email: string;
    password?: string;
    sign_in_provider: SignInProvider;
    google_access_token?: string;
    google_user_id?: string;
    microsoft_access_token?: string;
    microsoft_user_id?: string;
    created_at: Date;
    updated_at: Date;
}

export interface UserCreate {
    email: string;
    password?: string;
    sign_in_provider: SignInProvider;
    google_access_token?: string;
    google_user_id?: string;
    microsoft_access_token?: string;
    microsoft_user_id?: string;
}

export interface UserUpdate {
    first_name?: string;
    last_name?: string;
    password?: string;
    google_access_token?: string;
    google_user_id?: string;
    microsoft_access_token?: string;
    microsoft_user_id?: string;
}

export interface UserFilter {
    id?: string;
    email?: string;
    sign_in_provider?: SignInProvider;
}

export interface UserService {
    create(data: UserCreate): Promise<User>;
    list(filter: UserFilter): Promise<User[]>;
    get(filter: UserFilter): Promise<User>;
    update(filter: UserFilter, data: UserUpdate): Promise<User>;
    remove(filter: UserFilter): Promise<void>;
}
