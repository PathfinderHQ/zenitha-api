import mongoose, { Schema } from 'mongoose';
import { LogLevels, ILog, LogTypes } from '../types';

const logSchema = new Schema(
    {
        level: {
            type: String,
            enum: LogLevels,
        },
        time: Number,
        app_name: String,
        message: String,
        code: Schema.Types.Mixed,
        log_id: String,
        type: {
            type: String,
            enum: LogTypes,
        },
        data: Schema.Types.Mixed,
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    }
);

export const LogModel = mongoose.model<ILog>('Log', logSchema);

export const createMongoDBAdapter = async (url: string) => {
    mongoose
        .connect(url)
        .then(() => console.log('Logs database connected...'))
        .catch((err) => console.log('[createMongoDBAdapter] error connecting to MongoDB\n', err));
};
