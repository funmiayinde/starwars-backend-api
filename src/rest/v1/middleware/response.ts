import { Request, Response } from 'express';
import ResponseOption from 'response-option';
import QueryParser from '../../../utils/query-parser';

export default async (req: any | Request, res: any | Response) => {
    const queryParser = new QueryParser(Object.assign({}, req.query));
    const obj: ResponseOption = req.response;
    if (obj?.cache && process.env.NODE_ENV === 'production'){
        res.set('Cache-Control', `public, max-age=${obj.cache}`);
    }
    const processor = obj.model.getProcessor();
    const response = await processor.getResponse({...obj, queryParser});
    return res.status(obj.code).json(response);
};