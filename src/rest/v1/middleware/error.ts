import { NextFunction, Request, Response } from 'express';
import AppError from '../../../utils/app-error';
import config from 'config';
import { INTERNAL_SERVER_ERROR } from '../../../utils/codes';
import log from '../../../utils/logger';
import AppResponse from '../../../utils/app.response';

export default (error: any, req: any | Request, res: Response, next: NextFunction) => {
    const meta: any = {};
    if (error instanceof AppError) {
        const err = error.format();
        const code = error.code;
        meta.status_code = err.code;
        meta.error = { code, message: err.message };
        if (err.messages) {
            meta.error.messages = err.messages;
        }
    } else if (error instanceof Error) {
        meta.status_code = 500;
        meta.error = { code: INTERNAL_SERVER_ERROR, message: error.message };
        if (`${config.util.getEnv('NODE_ENV')}` !== 'production') {
            meta.developer_message = error;
        }
    }else {
        const code = 500;
        meta.status_code = code;
        meta.error = { code: code, message: 'A problem with our server, please try again later. Thank you' };
        meta.developer_message = error;
    }
    if (`${config.util.getEnv('NODE_ENV')}` !== 'production') {
        log.error(error);
    }
    return res.status(meta.status_code).json(AppResponse.format(meta));

};