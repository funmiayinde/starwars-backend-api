/* eslint-disable @typescript-eslint/no-unused-vars */
import { CacheHelper } from './../../../../utils/helper';
import { BAD_REQUEST, NOT_FOUND } from './../../../../utils/codes';
import { Request, Response, NextFunction } from 'express';
import { AppModel } from '../../../../_core/app.model';
import { AppController } from '../../../../_core/app.controller';
import { OK } from '../../../../utils/codes';
import AppResponse from '../../../../utils/app.response';
import AppError from '../../../../utils/app-error';
import QueryParser from '../../../../utils/query-parser';
import Pagination from '../../../../utils/pagination';
import Validator from 'validatorjs';
import lang from '../../lang';
import _ from 'lodash';

class MoviesController extends AppController {
  /**
   * @param {AppModel} model The model name
   * @constructor
   */
  constructor(model: AppModel) {
    super(model);
    this.movieCharacters = this.movieCharacters.bind(this);
    this.fetchMovies = this.fetchMovies.bind(this);
  }
  /**
   * @param {Any| Request} req The request object
   * @param {Any | Response} res The response object
   * @param {NextFunction} next The callback to the next program handler
   * @return {Object} res The response object
   */
  async fetchMovies(req: any | Request, res: any | Response, next: NextFunction) {
    try {
      const movies = await this.model.getProcessor().fetchStarWarsMovies();
      if (movies instanceof AppError) {
        return next(movies);
      }
      const meta = AppResponse.getSuccessMeta();
      return res.status(OK).json(AppResponse.format(meta, movies));
    } catch (e) {
      return next(e);
    }
  }

  async find(req: any | Request, res: any | Response, next: NextFunction) {
    req.query.include = ['comments'];
    const queryParser: QueryParser = new QueryParser(Object.assign({}, req.query));
    const pagination: Pagination = new Pagination(req.originalUrl);
    const cacheKey = req.originalUrl;
    const cache = await CacheHelper().get(cacheKey);
    if (cache) {
      req.response = {
        code: OK,
        model: this.model,
        value: cache,
        queryParser,
        pagination,
      };
      return next();
    } else {
      super.find(req, res, next);
    }
  }

  /**
   * @param {Any| Request} req The request object
   * @param {Any | Response} res The response object
   * @param {NextFunction} next The callback to the next program handler
   * @return {Object} res The response object
   */
  async movieCharacters(req: any | Request, res: any | Response, next: NextFunction) {
    try {
      const processor = this.model.getProcessor();
      const queryParser = new QueryParser(Object.assign({}, req.query));
      const meta = AppResponse.getSuccessMeta();
      const validate = new Validator({ ...req.query }, { title: 'required' });
      if (!validate.passes()) {
        return next(new AppError(lang.get('error').inputs, BAD_REQUEST, validate.errors.all()));
      }
      let result = null;
      const cacheKey = req.originalUrl;
      const cache = await CacheHelper().get(cacheKey);
      if (!cache) {
        result = await processor.processCharacters(queryParser);
        await CacheHelper().set(cacheKey, result);
      } else {
        result = cache;
      }
      if (result instanceof AppError) {
        return next(result);
      }
      return res.status(OK).json(result);
    } catch (e) {
      return next(e);
    }
  }
}

export default MoviesController;
