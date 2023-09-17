import { RequestHandler } from "express";
import createHttpError from "http-errors";
import UserModel from '../models/user';
import bcrypt from 'bcrypt';

export const getAuthenticatedUser: RequestHandler = async (request, response, next) => {

    try {
        const user = await UserModel.findById(request.session.userId).select('+email').exec();
        response.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

interface SignUpBody {
    username?: string,
    email?: string,
    password?: string,
}

export const signUp: RequestHandler<unknown, unknown, SignUpBody, unknown> = async (request, response, next) => {
    const username = request.body.username;
    const email = request.body.email;
    const passwordRaw = request.body.password;

    try {
        if (!username || !email || !passwordRaw) {
            throw createHttpError(400, 'Parameters missing');
        }

        const existingUsername = await UserModel.findOne({ username: username }).exec();

        if (existingUsername) {
            throw createHttpError(409, 'Username already taken. Please choose a different one or log in instead.');
        }

        const existingEmail = await UserModel.findOne({ email: email }).exec();

        if (existingEmail) {
            throw createHttpError(409, 'A user with this email address already exists. Please log in instead.');
        }

        // hashing and salting of the password to make it impossible to decript.
        const passwordHashed = await bcrypt.hash(passwordRaw, 10);

        const newUser = await UserModel.create({
            username: username,
            email: email,
            password: passwordHashed,
        });

        request.session.userId = newUser._id;

        response.status(201).json(newUser);
    } catch (error) {
        next(error)
    }
};

interface LoginBody {
    username?: string,
    password?: string,
}

export const login: RequestHandler<unknown, unknown, LoginBody, unknown> = async (request, response, next) => {
    const username = request.body.username;
    const password = request.body.password;

    try {
        if (!username || !password) {
            throw createHttpError(400, 'Parameters missing');
        }

        const user = await UserModel.findOne({ username: username }).select('+password +email').exec();

        if (!user) {
            // the message is a bit enigmatic to not tell hackers explicitly that user does not exist.
            throw createHttpError(401, 'Invalid credentials');
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            throw createHttpError(401, 'Invalid credentials');
        }

        request.session.userId = user._id;
        response.status(201).json(user);
    } catch (error) {
        next(error);
    }
}

export const logout: RequestHandler = (request, response, next) => {
    request.session.destroy(error => {
        if (error) {
            next(error);
        } else {
            response.sendStatus(200)
        }
    })
};