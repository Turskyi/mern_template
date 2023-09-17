// We are not peasants, so we use typescript here.
import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import notesRoutes from './routes/notes';
import userRoutes from './routes/users';
import morgan from 'morgan';
import createHttpError, { isHttpError } from 'http-errors';
import session from 'express-session';
import env from './util/validateEnv';
import MongoStore from 'connect-mongo';
import { requiresAuth } from './middleware/auth';

// `app` is our server where we add endpoints
const app = express();

// prints request/response into console log
app.use(morgan('dev'));

app.use(express.json());

app.use(session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 1000,
    },
    rolling: true,
    store: MongoStore.create({
        mongoUrl: env.MONGO_CONNECTION_STRING,
    }),
}));

app.use('/api/users', userRoutes);
app.use('/api/notes', requiresAuth, notesRoutes);

// we get to this middleware if none of our routes up here fits, so we try to access an endpoint that we have not set up.
app.use((reqest, response, next) => {
    next(createHttpError(404, 'Endpoint not found'));
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: unknown, reqest: Request, response: Response, next: NextFunction) => {
    console.error(error);
    let errorMessage = 'An unknown error occure';
    let statusCode = 500;

    if (isHttpError(error)) {
        statusCode = error.status;
        errorMessage = error.message;
    }

    response.status(statusCode).json({ error: errorMessage });
});

export default app;