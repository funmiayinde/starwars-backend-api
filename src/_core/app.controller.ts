import { CONFLICT } from './../utils/codes';
import _ from 'lodash';
import lang from '../rest/v1/lang';
import { Response, NextFunction, Request } from 'express';
import QueryParser from '../utils/query-parser';
import { BAD_REQUEST, CREATED, NOT_FOUND, OK } from '../utils/codes';
import AppError from '../utils/app-error';
import Pagination from '../utils/pagination';
import { AppModel } from './app.model';

/**
 * @class AppController
 */
export abstract class AppController {
  protected model: AppModel;
  protected lang: any;

  constructor(model: AppModel) {
    if (model) {
      this.model = model;
      this.lang = lang.get(model.name.toLowerCase());
    }
    this.create = this.create.bind(this);
    this.find = this.find.bind(this);
    this.findOne = this.findOne.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  public getModel(): AppModel {
    return this.model;
  }

  /**
   * @param {Any| Request} req The request object
   * @param {Any | Response} res The response object
   * @param {NextFunction} next The callback to the next program handler
   * @return {Object} res The response object
   */
  async findOne(req: any | Request, res: any | Response, next: NextFunction) {
    if (_.isEmpty(req.object)) {
      return next(new AppError(this.lang.not_found, NOT_FOUND));
    }
    req.response = {
      model: this.model,
      code: OK,
      value: req.object,
    };
    return next();
  }

  /**
   * @param {Any| Request} req The request object
   * @param {Any | Response} res The response object
   * @param {NextFunction} next The callback to the next program handler
   * @return {Object} res The response object
   */
   async create(req: any | Request, res: any | Response, next: NextFunction) {
    const processor = this.model.getProcessor();
    const obj = await processor.prepareBodyObject(req);
    const validation = await this.model.getValidation().create(obj);
    if (!validation.passed) {
      const appError = new AppError(lang.get('error').inputs, BAD_REQUEST, validation.errors);
      return next(appError);
    }
    let value = await processor.retrieveExistingResource(obj);
    console.log('value:', value);
    if (value) {
      if (value && this.model.config().returnDuplicate) {
        req.response = {
          message: this.lang.created,
          model: this.model,
          code: CREATED,
          value,
        };
        return next();
      }
      const messageObj = this.model.config().uniques.map((m: any) => ({
        [m]: `${m.replace('_', '')} must be unique`,
      }));
      return next(new AppError(lang.get('error').resource_already_exists, CONFLICT, messageObj));
    } else {
      obj.account = req.account;
      obj.user = obj.user || req.user;
      obj.user_id = obj.user_id;
      console.log('obj:', { ...obj });
      value = await processor.createNewObject({ ...obj });
      console.log('value:', value);
      req.response = {
        model: this.model,
        code: CREATED,
        message: this.lang.created,
        value,
      };
      return next();
    }
  }

  /**
   * @param {Any| Request} req The request object
   * @param {Any | Response} res The response object
   * @param {NextFunction} next The callback to the next program handler
   * @return {Object} res The response object
   */
  async find(req: any | Request, res: any | Response, next: NextFunction) {
    const processor = this.model.getProcessor();
    const queryParser: QueryParser = new QueryParser(Object.assign({}, req.query));
    const pagination: Pagination = new Pagination(req.originalUrl);
    try {
      const { value, count } = await processor.buildModelQueryObject(pagination, queryParser);
      req.response = {
        model: this.model,
        code: OK,
        count,
        queryParser,
        pagination,
        value,
      };
      return next();
    } catch (e) {
      return next(e);
    }
  }

  /**
   * @param {Any| Request} req The request object
   * @param {Any | Response} res The response object
   * @param {NextFunction} next The callback to the next program handler
   * @return {Object} res The response object
   */
  async update(req: any | Request, res: any | Response, next: NextFunction) {
    try {
      req.response = {
        model: this.model,
        code: OK,
        message: this.lang.updated,
      };
      return next();
    } catch (e) {
      return next(e);
    }
  }
  /**
   * @param {Object} req The request object
   * @param {Object} res The response object
   * @param {Function} next The callback to the next program handler
   * @return {Object} The response object
   */
  async delete(req: any | Request, res: any | Response, next: NextFunction) {
    try {
      req.response = {
        model: this.model,
        code: OK,
        message: this.lang.deleted,
      };
      return next();
    } catch (e) {
      return next(e);
    }
  }
}
export default AppController;
