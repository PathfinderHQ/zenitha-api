import { CronData } from '../types';
import { agenda } from '../lib';
import { SEND_NOTIFICATION } from '../config';

export const scheduleTaskCronJob = async (time: string, data: CronData): Promise<void> => {
    await agenda.schedule(time, SEND_NOTIFICATION, data);
};
