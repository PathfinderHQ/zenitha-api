import * as firebase from 'firebase-admin';
import Config, { NODE_ENV } from '../config';
import { generateJSONFromBase64 } from './custom';

const firebaseConfig = {
    type: Config.firebase.type,
    project_id: Config.firebase.project_id,
    private_key_id: Config.firebase.private_key_id,
    private_key: Config.firebase.private_key,
    client_email: Config.firebase.client_email,
    client_id: Config.firebase.client_id,
    auth_uri: Config.firebase.auth_uri,
    token_uri: Config.firebase.token_uri,
    auth_provider_x509_cert_url: Config.firebase.auth_provider_x509_cert_url,
    client_x509_cert_url: Config.firebase.client_x509_cert_url,
};

const serviceAccount =
    Config.nodeEnv === NODE_ENV.PRODUCTION
        ? JSON.parse(generateJSONFromBase64(Config.firebaseBase64))
        : JSON.parse(JSON.stringify(firebaseConfig));

// do not initialise app in test environment
if (Config.nodeEnv !== NODE_ENV.TEST) {
    firebase.initializeApp({
        credential: firebase.credential.cert(serviceAccount),
    });
}

export default firebase;
