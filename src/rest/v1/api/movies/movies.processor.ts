import { INTERNAL_SERVER_ERROR } from './../../../../utils/codes';
import AppProcessor from '../../../../_core/app.processor';
import config from 'config';
import axios from 'axios';
import AppError from '../../../../utils/app-error';
import Pagination from '../../../../utils/pagination';
import QueryParser from '../../../../utils/query-parser';
import _ from 'lodash';

/**
 * @class {MoviesProcessor}
 */
export default class MoviesProcessor extends AppProcessor {
  /**
   * Get all movies from stars wars api
   * @returns {Object}
   */
  public async fetchStarWarsMovies(): Promise<any> {
    const baseUrl = config.get('api.star_wars.base_url');
    const response = await axios.get(`${baseUrl}`);
    if (response && response.data) {
      return response.data.results.sort((a: any, b: any) => {
        return Date.parse(a.release_date) > Date.parse(b.release_date);
      });
    }
    return new AppError('Unable to fetch movies, please try again later', INTERNAL_SERVER_ERROR);
  }

  /**
   *
   * @param page The current page
   * @param payload The current payload
   * @param limit The limited number
   * @returns
   */
  public  customPagination(page: any, payload: any, limit: any) {
    return payload.slice(limit * (page - 1), limit * page);
  }
  /**
   *
   * @param page The current page
   * @param payload The current payload
   * @param limit The limited number
   * @returns
   */
  public paginationData(limit: any, skip: any, count: any, pageQuery: any) {
    const pageData = {};
    limit = limit > count ? count : limit;
    skip = skip > count ? count : skip;
    _.extend(pageData, {
      total_count: count || 0,
      page_count: Math.ceil(count/ limit) || 0,
      page_size: Number(limit) || 0,
      page: Number(pageQuery) || 0,
    });
    return pageData;
  }

  /***
   * @param {Pagination} pagination The pagination object
   * @param {QueryParser} queryParser The query parser
   * @return {Object}
   */
  async buildModelQueryObject(pagination: Pagination, queryParser: QueryParser): Promise<any> {
    const movies: any[] = await this.fetchStarWarsMovies();
    if (movies instanceof AppError) {
      throw movies;
    }
    let obj: any = {};
    for (const m of movies) {
      const toFillable = this.model.config().fillables;
      if (toFillable && toFillable.length) {
        obj = _.pick(m, ...toFillable);
      } else {
        obj = m;
      }
      const value = await this.retrieveExistingResource(obj);
      if (!value) {
        await this.createNewObject(obj);
      }
    }
    _.assign(queryParser.sort, { release_date: 'DESC' });
    return super.buildModelQueryObject(pagination, queryParser);
  }
}
