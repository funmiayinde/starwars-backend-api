/* eslint-disable @typescript-eslint/no-unused-vars */
import _ from 'lodash';
import ResponseOption from 'response-option';
import AppResponse from '../utils/app.response';
import Pagination from '../utils/pagination';
import QueryParser from '../utils/query-parser';
import { AppModel } from './app.model';

/***
 * The app processor class
 */
export default abstract class AppProcessor {
  protected model: AppModel;

  constructor(model: AppModel) {
    this.model = model;
  }

  /**
   * @return {AppModel}
   */
  public getModel(): AppModel {
    return this.model;
  }

  /**
   * @param {Object} obj required for response
   * @param {Object} payload required for response
   * @return {Object}
   **/
  async postUpdateResponse(obj: any, payload?: any): Promise<boolean> {
    return false;
  }

  /**
   * @param {Object} req The request object
   * @return {Promise<Object| Any>}
   **/
  async prepareBodyObject(req: any | Request) {
    let obj: any = Object.assign({}, req.params, req.query, req.body);
    if (req.authId) {
      const user = req.authId;
      obj = Object.assign(obj, {
        created_by: user,
        user_id: req.user.id,
        account_id: req.account_id,
      });
    }
    return obj;
  }

  /**
   *
   * @param {Object} obj The payload object
   * @returns
   */
  public async createNewObject(obj: undefined): Promise<any> {
    const toFill: string[] = this.model.config().fillables;
    try {
      if (toFill && toFill.length > 0) {
        const excludeFields: string[] = this.model.config().excludeFields;
        _.omit(obj, excludeFields && excludeFields.length > 0 ? excludeFields : null);
        obj = _.pick(obj, ...toFill);
      }
      return await this.model.repository().save(obj);
    } catch (e) {
      throw e;
    }
  }



  /**
     /**
     * @param {Object} obj required for response
     * @param {Object} model
     * @param {Object} value
     * @param {Object} code
     * @param {Object} message
     * @param {QueryParser} queryParser
     * @param {Pagination} pagination
     * @param {Number} count
     * @param {Object} token
     * @param {Object} email
     * @return {Promise<Object>}
     **/
  async getResponse({
    model,
    value,
    code,
    message,
    queryParser,
    pagination,
    count,
    token,
  }: ResponseOption): Promise<any> {
    const meta = AppResponse.getSuccessMeta();
    if (token) {
      meta.token = token;
    }
    _.extend(meta, { status_code: code });
    if (message) {
      meta.message = message;
    }
    if (pagination && !queryParser.getAll) {
      pagination.totalCount = count;
      if (pagination.morePages(count)) {
        pagination.next = pagination.current + 1;
      }
      meta.pagination = pagination.done();
    }
    if (this.model.config().hiddenFields && this.model.config().hiddenFields.length > 0) {
      const isFunction = typeof value.toJSON === 'function';
      if (_.isArray(value)) {
        value = value.map((v) =>
          typeof v === 'string'
            ? v
            : _.omit(isFunction ? v.toJSON() : v, [ ...this.model.config().hiddenFields]),
        );
      } else {
        value = _.omit(isFunction ? value.toJSON() : value, [
          ...this.model.config().hiddenFields,
        ]);
      }
    }
    return AppResponse.format(meta, value);
  }

  /***
   * @param {Pagination} pagination The pagination object
   * @param {QueryParser} queryParser The query parser
   * @return {Object}
   */
  async buildModelQueryObject(pagination: Pagination, queryParser: QueryParser): Promise<any> {
    console.log('queryParser:', queryParser);
    const query = this.prepareQuery(queryParser, pagination);
    console.log('custom-query:', query);
    return {
      value: await this.model.repository().find({ ...query }),
      count: await this.model.repository().count({ ...query }),
    };
  }

   /**
   * @param {Object} obj The payload object
   * @return {Object}
   */
    public async retrieveExistingResource(obj: any): Promise<any> {
      if (this.model.config().uniques) {
        const uniquesKeys = this.model.config().uniques;
        const query: any = {};
        for (const key of uniquesKeys) {
          query[key] = obj[key];
        }
        console.log('query', query);
        let found = null;
        if (!_.isEmpty(query)) {
          found = await this.model.repository().findOne({
            where: {
              ...query,
              deleted: false,
            },
          });
        }
        return found;
      }
    }
  

  private prepareQuery(queryParser: QueryParser, pagination?: Pagination) {
    const query: any = { where: { ...queryParser.query } };
    if (!_.isEmpty(queryParser.selection) && queryParser.selection.length > 0) {
      _.extend(query, { select: queryParser.selection });
    }
    if (queryParser.include && queryParser.include.length > 0) {
      _.extend(query, { relations: queryParser.include });
    }
    if (!_.isEmpty(queryParser.sort)) {
      _.extend(query, {
        order: queryParser && queryParser.sort ? _.assign(queryParser.sort, { created_at: 'DESC' }) : queryParser.sort,
      });
    }
    if (!queryParser.getAll && pagination) {
      _.extend(query, { skip: pagination.skip, take: pagination.perPage });
    }
    console.log('custom-query:', query);
    return query;
  }
}
