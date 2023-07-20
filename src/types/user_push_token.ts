export interface UserPushToken {
    id: number;
    user: string;
    push_token: string;
    created_at: Date;
}

export interface UserPushTokenCreate {
    user: string;
    push_token: string;
}

export interface UserPushTokenFilter {
    id?: number;
    user?: string;
    push_token?: string;
}

export interface UserPushTokenService {
    create(data: UserPushTokenCreate): Promise<void>;
    list(filter: UserPushTokenFilter): Promise<UserPushToken[]>;
    get(filter: UserPushTokenFilter): Promise<UserPushToken>;
}
