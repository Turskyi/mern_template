import { cleanEnv } from 'envalid';
import {port, str} from 'envalid/dist/validators';

export default cleanEnv(process.env, {
    // "str()" means "String"
    MONGO_CONNECTION_STRING: str(),
    PORT: port(),
    SESSION_SECRET: str(),
});