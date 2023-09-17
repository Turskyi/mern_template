import { RequestHandler } from "express";
import NoteModel from '../models/note';
import createHttpError from "http-errors";
import mongoose from "mongoose";
import { assertIsDefined } from "../util/assertIsDefined";

export const getNotes: RequestHandler = async (request, response, next) => {
    const authenticatedUserId = request.session.userId;
    try {
        assertIsDefined(authenticatedUserId);
        const notes = await NoteModel.find({ userId: authenticatedUserId }).exec();
        response.status(200).json(notes);
    } catch (e) {
        next(e);
    }
};

export const getNote: RequestHandler = async (request, response, next) => {
    const noteId = request.params.noteId;
    const authenticatedUserId = request.session.userId;
    try {
        assertIsDefined(authenticatedUserId);
        if (!mongoose.isValidObjectId(noteId)) {
            throw createHttpError(400, 'Invalid note id');
        }
        const note = await NoteModel.findById(noteId).exec();

        if (!note) {
            throw createHttpError(404, 'Note not found');
        }

        if (!note.userId.equals(authenticatedUserId)) {
            throw createHttpError(401, 'You cannot access this note');
        }

        response.status(200).json(note);
    } catch (error) {
        next(error);
    }
};

interface CreateNoteBody {
    title?: string,
    text?: string,
}

export const createNote: RequestHandler<unknown, unknown, CreateNoteBody, unknown> = async (request, response, next) => {
    const title = request.body.title;
    const text = request.body.text;
    const authenticatedUserId = request.session.userId;
    try {
        assertIsDefined(authenticatedUserId);
        if (!title) {
            throw createHttpError(400, 'Note must have a title');
        }
        const newNote = await NoteModel.create({
            userId: authenticatedUserId,
            title: title,
            text: text,
        });
        response.status(201).json(newNote);
    } catch (e) {
        next(e);
    }
};

interface UpdateNoteParams {
    noteId: string,
}

interface UpdateNoteBody {
    title?: string,
    text?: string,
}

export const updateNote: RequestHandler<UpdateNoteParams, unknown, UpdateNoteBody, unknown> = async (request, response, next) => {
    const noteId = request.params.noteId;
    const newTitle = request.body.title;
    const newText = request.body.text;
    const authenticatedUserId = request.session.userId;
    try {
        assertIsDefined(authenticatedUserId);
        if (!mongoose.isValidObjectId(noteId)) {
            throw createHttpError(400, 'Invalid note id');
        }
        if (!newTitle) {
            throw createHttpError(400, 'Note must have a title');
        }

        const note = await NoteModel.findById(noteId).exec();
        if (!note) {
            throw createHttpError(404, 'Note not found');
        }

        if (!note.userId.equals(authenticatedUserId)) {
            throw createHttpError(401, 'You cannot access this note');
        }

        note.title = newTitle;
        note.text = newText;

        const updatedNote = await note.save();

        response.status(200).json(updatedNote);
    } catch (error) {
        next(error);
    }
};

export const deleteNote: RequestHandler = async (request, response, next) => {
    const noteId = request.params.noteId;
    const authenticatedUserId = request.session.userId;
    try {
        assertIsDefined(authenticatedUserId);
        if (!mongoose.isValidObjectId(noteId)) {
            throw createHttpError(400, 'Invalid note id');
        }

        const note = await NoteModel.findById(noteId).exec();

        if (!note) {
            throw createHttpError(404, 'Note not found');
        }

        if (!note.userId.equals(authenticatedUserId)) {
            throw createHttpError(401, 'You cannot access this note');
        }


        await note.deleteOne();
        response.sendStatus(204);
    } catch (error) {
        next(error);
    }
};