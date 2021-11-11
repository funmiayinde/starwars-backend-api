import { OK } from './../../../utils/codes';
import { isCacheable, CacheHelper } from './../../../utils/helper';
import { Request, Response, NextFunction } from 'express';
import _ from 'lodash';
import AppResponse from './../../../utils/app.response';

export default async (req: Request, res: Response, next: NextFunction) => {
  if (_.isEmpty(isCacheable(req))) return next();
  let cacheKey = req.headers['if-none-match'];
  let cache = null;
  if (cacheKey) {
    cache = await CacheHelper().get(cacheKey);
    console.log('cache hit user ->>>', cacheKey);
    return next();
  } else {
    cacheKey = req.originalUrl;
    cache = await CacheHelper().get(cacheKey);
    console.log('cache hit server ->>>', cacheKey);
  }
  if (cache) {
    return res.status(OK).json(AppResponse.format(AppResponse.getSuccessMeta(), cache));
  }
  return next();
};
