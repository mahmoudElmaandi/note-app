import { InversifyExpressServer } from 'inversify-express-utils';
import { Application } from './lib/abstract-application';
import { Container } from 'inversify';
import express, { NextFunction, Request, Response } from 'express';
import { DBContext } from '../data/db.context';
import { DBPool } from '../data/pool';
import { NoteRepository, NoteReceiverRepository, NoteMediaFileRepository, UserRepository } from '../data/repositories';
import { NoteService, UserService } from '../logic/services';
import { ValidationException } from '../logic/excpetions';
import { BaseHttpResponse } from './lib/base-http-response';
import { NotePaginationMiddleware, authSocketMiddleware } from './middlerwares';
import { createServer } from 'http';
import { Server } from 'socket.io';
import config from '../configs/config';
import path from 'path';
import cors from 'cors';

import './controllers/note-controller';
import './controllers/user.controller';

export class App extends Application {

    configureServices(container: Container): void {
        container.bind(DBPool).toSelf();
        container.bind(DBContext).toSelf();
        container.bind(NoteRepository).toSelf();
        container.bind(NoteReceiverRepository).toSelf();
        container.bind(NoteMediaFileRepository).toSelf();
        container.bind(NoteService).toSelf();
        container.bind(NotePaginationMiddleware).toSelf();

        container.bind(UserRepository).toSelf();
        container.bind(UserService).toSelf();
    };

    async setup(): Promise<void> {
        const server = new InversifyExpressServer(this.container);
        let io: Server;
        const connections: any = {};

        await this.container.get(DBPool).testConnection();


        server.setConfig((app) => {
            app.use(express.json());

            // Give all routes & middleware access to io and connections;
            app.use((req: any, res, next) => {
                res.locals.io = io;
                res.locals.connections = connections;
                console.log(" custom middleware :  res.locals.userId ", res.locals.userId)
                return next();
            });

            app.use((req, res, next) => {
                console.log(`${new Date().toLocaleString()} ${req.method}, ${req.url}`)
                console.log(req.body)
                next()
            });

            app.use(express.static(path.join(path.dirname(__dirname), 'public')));
            app.use(cors())
            app.get('/', (req, res) => {
                res.sendFile(path.dirname(__dirname) + '/public/views/index.html');
            });
        });

        server.setErrorConfig((app) => {
            app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
                if (err instanceof ValidationException) {
                    const response = BaseHttpResponse.failed(err.message, 419);
                    res.status(response.statusCode).json(response);
                } else {
                    console.log("error")
                    const response = BaseHttpResponse.failed("Internal server error", 500);
                    res.status(response.statusCode).json(response);
                }
                next();
            })
        });

        let expressApp = server.build();
        const httpServer = createServer(expressApp)
        io = new Server(httpServer);

        io.use((socket, next) => {
            authSocketMiddleware(socket, next)
        });

        io.on('connection', (socket) => {
            console.log(`auth user connected : userId : ${socket.data.userId} - socketId :${socket.id}`);
            connections[socket.data.userId] = socket;

            socket.on('note', (note) => {
                console.log(`Client: ${note}`);
                socket.emit('note', 'note from server');
            });

            socket.on('disconnect', () => {
                console.log('user disconnected');
            });
        });

        expressApp.use('*', function (req, res) {
            const response = BaseHttpResponse.failed("Not Found", 400);
            res.status(response.statusCode).json(response);
        })

        httpServer.listen(config.PORT, () => {
            console.log(`app is running on http://localhost:${config.PORT}`)
        })
    }

}