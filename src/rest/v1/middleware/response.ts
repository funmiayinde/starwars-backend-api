import { CacheHelper } from './../../../utils/helper';
import { Request, Response } from 'express';
import ResponseOption from 'response-option';
import QueryParser from '../../../utils/query-parser';

export default async (req: any | Request, res: any | Response) => {
  const queryParser = new QueryParser(Object.assign({}, req.query));
  const obj: ResponseOption = req.response;
  const cacheKey = req.originalUrl;
  const cache = await CacheHelper().get(cacheKey);
  if (!cache) {
    await CacheHelper().set(cacheKey, req.response.value);
  }
  const processor = obj.model.getProcessor();
  const response = await processor.getResponse({ ...obj, queryParser });
  return res.status(obj.code).json(response);
};
