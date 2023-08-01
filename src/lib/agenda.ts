import Agenda, { Job, JobAttributesData } from 'agenda';
import Config, { SEND_NOTIFICATION } from '../config';
import { CronData } from '../types';
import { Expo } from 'expo-server-sdk';

export const agenda = new Agenda({
    db: {
        address: Config.cronUrl,
    },
});

type Notification = JobAttributesData & CronData;

const expo = new Expo();

agenda.define(SEND_NOTIFICATION, async (job: Job<Notification>) => {
    await expo.sendPushNotificationsAsync([
        {
            to: job.attrs.data.user_push_token,
            sound: 'default',
            body: job.attrs.data.summary,
        },
    ]);
});
