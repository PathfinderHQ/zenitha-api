
export interface CronData {
    summary: string;
    user_push_token: string;
}

export interface CronService {
    schedule(time: string, data: CronData): Promise<void>;
}
