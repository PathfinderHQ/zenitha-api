import Agenda, { Job, JobAttributesData } from 'agenda';
import Config, { SEND_NOTIFICATION } from '../config';
import { CronData } from '../types';

export const agenda = new Agenda({
    db: { address: Config.cronUrl },
    processEvery: '30 seconds',
});

type Notification = JobAttributesData & CronData;

agenda.define(SEND_NOTIFICATION, async (job: Job<Notification>) => {
    const messages = [];
    messages.push({
        to: job.attrs.data.user_push_token,
        sound: 'default',
        body: job.attrs.data.summary,
    });
});
