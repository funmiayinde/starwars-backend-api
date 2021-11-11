// import config from 'config';
import { Express, Request, Response, NextFunction } from 'express';
import apiV1 from './rest/v1';
import AppError from './utils/app-error';
import { NOT_FOUND } from './utils/codes';
import Q from 'q';
import errorHandler from './rest/v1/middleware/error';

// const version: any[] = config.get('api.versions');
// const prefix: string = `${config.get('api.prefix')}/v${version.pop()}`;


/**
 * The routes will add all the application defined routes
 * @param {app} app The app is an instance of an express application
 * @return {Promise<void>}
 * */
export default async (app: Express) => {
    app.use('/api/v1', apiV1);

    app.use((req: Request, res: Response, next: NextFunction) => {
        const err: any = new AppError('Not found', NOT_FOUND);
        err.status = 404;
        next(err);
    });
    app.use('*', (req: Request, res: Response, next: NextFunction) => {
        return next(new AppError('Not found', NOT_FOUND));
    });
    app.use(errorHandler);
    return Q.resolve(app);
};