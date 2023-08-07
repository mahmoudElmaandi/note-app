import { Request, Response, NextFunction } from "express";
import { NoteRepository } from "../../data/repositories";
import { Cursor, DataBaseCursor, INote } from "../../../types";
import { injectable } from "inversify";
import { BaseHttpResponse } from "../lib/base-http-response";

@injectable()
export class NotePaginationMiddleware {
    constructor(private readonly _noteRepo: NoteRepository) {
        this.paginate = this.paginate.bind(this);
    };

    async paginate(req: Request, res: Response, next: NextFunction, isTimeline: boolean = false) {
        const nextDay = await this._noteRepo.getNextDayDate();
        const user_id = res.locals.userId;

        let encodedCursor: string = req.query.cursor as string;
        let limit: number = req.query.limit as string ? parseInt(req.query.limit as string) : 5;
        let filters: string[] = req.query.filters as string ? (req.query.filters as string).split(',') : [];
        if (limit > 50) limit = 50;
        if (filters.length) filters = await Promise.all(filters.map((filter) => this._noteRepo.getNoteTypeIdByName(filter, true)))
        filters = filters.filter(filter => filter);

        let cursor: Cursor = { created_at: nextDay, direction: "next" };
        let dataBaseCursor: DataBaseCursor = {
            created_at: nextDay,
            operator: "<",
            orderBy: " DESC ",
            user_id,
            limit,
            filters,
            isTimeline
        };

        if (encodedCursor) {
            cursor = this.decodeCursor(encodedCursor);
            dataBaseCursor.created_at = cursor.created_at;
            dataBaseCursor.orderBy = cursor.direction == "next" ? " DESC " : " ASC ";
            dataBaseCursor.operator = cursor.direction == "next" ? "<" : ">";
        }

        const notes = await this._noteRepo.paginate(dataBaseCursor);
        if (!notes.length) {
            const response = BaseHttpResponse.success([], 200);
            return res.status(response.statusCode).json(response);
        } else {
            const pagintionObject = await this.createPaginationResponseObject(notes, limit, user_id);
            const response = BaseHttpResponse.success({ hits: notes, pagination: pagintionObject }, 200);
            return res.status(response.statusCode).json(response);
        }
    }

    private decodeCursor(encodedCursor: string) {
        return JSON.parse(Buffer.from(encodedCursor, 'base64').toString('utf-8')) as Cursor;
    }

    private encodeCursor(cursor: Cursor) {
        return Buffer.from(JSON.stringify(cursor)).toString('base64');
    }

    private async createPaginationResponseObject(paginatedNotes: INote[], perPage: number, userId: string) {
        const latestNoteTimestamp = await this._noteRepo.getLatestNoteTimestamp(userId);
        const oldestNoteTimestamp = await this._noteRepo.getOldestNoteTimestamp(userId);
        const totalHits = await this._noteRepo.total(userId);

        // Sort DESC from latest to oldest note.
        paginatedNotes.sort((a, b) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        });

        const latestPaginatedNoteTimestamp = paginatedNotes[0].created_at;
        const oldestPaginatedNoteTimestamp = paginatedNotes[paginatedNotes.length - 1].created_at;

        let hasPreviousPage = new Date(latestPaginatedNoteTimestamp).getTime() < new Date(latestNoteTimestamp).getTime();
        let hasNextPage = new Date(oldestPaginatedNoteTimestamp).getTime() > new Date(oldestNoteTimestamp).getTime();

        return {
            perPage,
            currentHits: paginatedNotes.length,
            totalHits,
            hasPreviousPage,
            previousCursor: hasPreviousPage ? this.encodeCursor({ created_at: latestPaginatedNoteTimestamp, direction: "prev" }) : null,
            hasNextPage,
            nextCursor: hasNextPage ? this.encodeCursor({ created_at: oldestPaginatedNoteTimestamp, direction: "next" }) : null,
        }
    }
};