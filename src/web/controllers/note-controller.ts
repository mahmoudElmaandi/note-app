import { NextFunction, Request, Response } from "express";
import { controller, httpDelete, httpGet, httpPost } from "inversify-express-utils";
import { NoteService } from "../../logic/services";
import { CreateNoteDto, DeleteNoteDto } from "../../logic/dtos";
import { BaseHttpResponse } from "../lib/base-http-response";
import { NotePaginationMiddleware } from "../middlerwares";
import { Socket } from "socket.io";
import { authMiddleware, multerMiddleware } from "../middlerwares";

@controller("/notes")
export class NoteController {
    constructor(
        private readonly _noteService: NoteService,
        private readonly _notePaginationMiddleware: NotePaginationMiddleware,
    ) { }

    @httpGet('/', authMiddleware)
    async index(req: Request, res: Response, next: NextFunction) {
        try {
            await this._notePaginationMiddleware.paginate(req, res, next, false)
        } catch (error) {
            const response = BaseHttpResponse.failed("failed to get note", 500);
            res.status(response.statusCode).json(response);
        }
    }

    @httpGet('/timeline', authMiddleware)
    async timeline(req: Request, res: Response, next: NextFunction) {
        try {
            await this._notePaginationMiddleware.paginate(req, res, next, true)
        } catch (error) {
            const response = BaseHttpResponse.failed("failed to get note", 500);
            res.status(response.statusCode).json(response);
        }
    }

    @httpPost('/', authMiddleware, multerMiddleware())
    async create(req: Request, res: Response) {
        try {
            console.log("req.files", req.files)
            console.log("req.body", req.body)

            const dto = CreateNoteDto.from({ ...req.body, sender_id: res.locals.userId, mediaFiles: req.files });
            const note = await this._noteService.create(dto);
            // console.log("res.locals.connections", res.locals.connections)
            let receiversSockets: Socket[] = dto.receiver_ids.map(receiverId => res.locals.connections[receiverId]);
            receiversSockets = receiversSockets.filter(socket => socket);
            receiversSockets.forEach(receiverSocket => {
                receiverSocket.emit('note', `received a note`, CreateNoteDto.toReceivedNote(note))
            });

            const response = BaseHttpResponse.success(note, 201);
            res.status(response.statusCode).json(response);
        } catch (error) {
            console.log("failed to create note", error)
            const response = BaseHttpResponse.failed("failed to create note", 500);
            res.status(response.statusCode).json(response);
        }
    }

    @httpDelete('/:id', authMiddleware)
    async softDelete(req: Request, res: Response) {
        try {
            const dto = DeleteNoteDto.from({ ...req.params, sender_id: res.locals.userId })
            const soft_deleted_flag = await this._noteService.softDelete(dto);
            const response = BaseHttpResponse.success({ soft_deleted_flag }, 200);
            res.status(response.statusCode).json(response);
        } catch (error) {
            const response = BaseHttpResponse.failed((error as Error).message, 500);
            res.status(response.statusCode).json(response);
        }
    }
}