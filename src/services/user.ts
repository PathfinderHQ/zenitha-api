import { Knex } from 'knex';
import { EmailService, User, UserCreate, UserFilter, UserService, UserUpdate } from '../types';
import { OTPS, USER_PUSH_TOKENS, USERS } from '../database';
import { generateId, generateOtp, hashPassword } from '../lib';
import { EmailTypes, OtpType, SignInProvider } from '../types/enums';
import { ZENITHA_NO_REPLY } from '../config';

export interface UserStore {
    DB: Knex;
    appEmailService: EmailService;
}

// Create a store that access the database to run operations peculiar to user service
export const newUserStore = (us: UserStore): UserService => {
    // create a user
    const create = async (data: UserCreate): Promise<User> => {
        // using transaction because there's going to be
        // multiple insert that are dependent on each other
        // we want atomicity, i.e. either everything is successful
        // or everything rolls back
        return us.DB.transaction(async (trx) => {
            const id = generateId();

            // hash password before saving to the database if it exists
            if (data.password) {
                data.password = hashPassword(data.password);
            }

            // create user in the users table
            await trx(USERS).insert({ id, ...data });

            // if the user registered by email and password
            // we want to verify the email
            if (data.sign_in_provider === SignInProvider.CUSTOM) {
                const otp = generateOtp();

                // create otp in the otps table
                await trx(OTPS).insert({ otp, user: id, type: OtpType.VERIFY_EMAIL });

                // send email otp, we won't await it, we'll let it run asynchronously
                // so our endpoint response is not slow.
                // also this leave our service unaffected if an error occurs during sending the email
                us.appEmailService.sendEmailTemplate({
                    to: data.email,
                    from: ZENITHA_NO_REPLY,
                    emailType: EmailTypes.VERIFY_EMAIL,
                    templateData: { otp },
                });
            }

            const [user] = await userQuery(trx, { id });

            return user;
        });
    };

    // get list of users
    const list = async (filter: UserFilter): Promise<User[]> => {
        return userQuery(us.DB, filter);
    };

    // get a user
    const get = async (filter: UserFilter): Promise<User> => {
        const [user] = await userQuery(us.DB, filter);

        return user;
    };

    // update user
    const update = async (filter: UserFilter, data: UserUpdate): Promise<User> => {
        // check to match sure the update data is not empty
        if (Object.keys(data).length > 0) {
            // hash the password if it is part of the payload
            if (data.password) {
                data.password = hashPassword(data.password);
            }

            await us.DB(USERS).where(filter).update(data);
        }

        const [user] = await userQuery(us.DB, filter);

        return user;
    };

    return { create, get, list, update };
};

// Build our user database query dynamically
const userQuery = (db: Knex | Knex.Transaction, filter: UserFilter): Knex.QueryBuilder => {
    const query = db(`${USERS} as u`)
        .leftJoin(`${USER_PUSH_TOKENS} as upt`, 'upt.user', 'u.id')
        .select(
            'u.id as id',
            'u.first_name as first_name',
            'u.last_name as last_name',
            'u.email as email',
            'u.password as password',
            'u.sign_in_provider as sign_in_provider',
            'u.google_user_id as google_user_id',
            'u.verified as verified',
            'u.created_at as created_at',
            'u.updated_at as updated_at',
            'upt.push_token'
        )
        .orderBy('created_at', 'desc');

    if (filter.id) query.where('u.id', filter.id);
    if (filter.email) query.where(db.raw('lower(u.email)'), '=', filter.email.toLowerCase());
    if (filter.sign_in_provider) query.where('u.sign_in_provider', filter.sign_in_provider);
    if (filter.verified) query.where('u.verified', filter.verified);

    return query;
};
