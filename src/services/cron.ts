import { CronData, CronService } from '../types';
import { agenda } from '../lib';
import { SEND_NOTIFICATION } from '../config';

export const newCronService = (): CronService => {
    const schedule = async (time: string, data: CronData): Promise<void> => {
        await agenda.schedule(time, SEND_NOTIFICATION, data);
    };

    return { schedule };
};
