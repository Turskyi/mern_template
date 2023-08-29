// We are not peasants, so we use typescript here.
import app from './app';
import env from './util/validateEnv';
import mongoose from 'mongoose';

const port = env.PORT;

mongoose.connect(env.MONGO_CONNECTION_STRING)
    .then(() => {
        console.log('Mongoose connected');

        // To start the server type "npx tsc" in the terminal and then "node server.js".
        app.listen(port, () => {
            console.log('Server running on port: ' + port);
        });
    }).catch(console.error);