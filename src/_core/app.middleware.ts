/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';

/**
 * The AppMiddleware  class
 * */
export class AppMiddleware {

    /**
     * @param {Any| Request} req The request object
     * @param {Any | Response} res The response object
     * @param {NextFunction} next The callback to the next program handler
     * @return {Object} res The response object
     */
    async canPost(req: any | object | Request, res: any | object | Response, next: NextFunction) {
        console.log('sure me i can post');
        return next();
    }

    /**
     * @param {Any| Request} req The request object
     * @param {Any | Response} res The response object
     * @param {NextFunction} next The callback to the next program handler
     * @return {Object} res The response object
     */
    async canRead(req: any | object | Request, res: any | object | Response, next: NextFunction) {
        return next();
    }

    /**
     * @param {Any| Request} req The request object
     * @param {Any | Response} res The response object
     * @param {NextFunction} next The callback to the next program handler
     * @return {Object} res The response object
     */
    async canUpdate(req: any | object | Request, res: any | object | Response, next: NextFunction) {
        return next();
    }

    /**
     * @param {Any| Request} req The request object
     * @param {Any | Response} res The response object
     * @param {NextFunction} next The callback to the next program handler
     * @return {Object} res The response object
     */
    async canDelete(req: any | object | Request, res: any | object | Response, next: NextFunction) {
        return next();
    }
}
