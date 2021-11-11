import { cmToInFt, pageData, paginate } from './../../../../utils/helper';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } from './../../../../utils/codes';
import AppProcessor from '../../../../_core/app.processor';
import config from 'config';
import axios from 'axios';
import AppError from '../../../../utils/app-error';
import Pagination from '../../../../utils/pagination';
import QueryParser from '../../../../utils/query-parser';
import _ from 'lodash';
import lang from '../../lang';
import AppResponse from '../../../../utils/app.response';

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
  public customPagination(page: any, payload: any, limit: any) {
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
      page_count: Math.ceil(count / limit) || 0,
      page_size: Number(limit) || 0,
      page: Number(pageQuery) || 0,
    });
    return pageData;
  }

  public async processCharacters(queryParser: QueryParser) {
    const meta = AppResponse.getSuccessMeta();
    const { title, gender } = queryParser.query;

    const limit = queryParser.query.limit || 30;
    const offset = queryParser.query.offset || 0;
    const page = queryParser.query.page || 1;
    return this.fetchStarWarsMovies()
      .then((movies: any[]) => {
        const titleQuery = title.toLowerCase();
        const movie = movies.find((movie) => {
          const movieTitle = movie.title.toLowerCase();
          if (movieTitle.includes(titleQuery)) {
            return movie;
          }
        });
        if (_.isUndefined(movie)) {
          return new AppError(lang.get(this.model.name).not_found, NOT_FOUND);
        }
        const movieTitle = movie.title;
        const { sortByHeight, sortByAge } = queryParser.query;
        if (!_.isUndefined(sortByHeight) && !_.isUndefined(sortByAge)) {
          return new AppError('You can sort either height or age per time', BAD_REQUEST);
        }

        if (!_.isUndefined(sortByHeight)) {
          if (!['asc', 'desc'].includes(sortByHeight.toLowerCase())) {
            return new AppError(`Height can be sorted "asc" - ascending or "desc" - descending!`, BAD_REQUEST);
          }
        }

        if (!_.isUndefined(sortByAge)) {
          if (!['asc', 'desc'].includes(sortByAge.toLowerCase())) {
            return new AppError(`Age can be sorted "asc" - ascending or "desc" - descending!`, BAD_REQUEST);
          }
        }
        const charactersPromises = movie.characters.map((url: string) => axios.get(url));
        return Promise.all(charactersPromises)
          .then((responses: any[]) => responses.map((response) => response.data))
          .then((characters) => {
            const heights = characters.reduce((acc: any, c: any) => acc + c.height, 0);
            const totalHeight = cmToInFt(heights)['feet'];
            const totalHeightInches = cmToInFt(heights)['inches'];
            console.log('totalHeight', totalHeight);
            const pageDataCharacters = pageData(limit, offset, characters.length, page);
            if (parseInt(page) > pageDataCharacters.page_count) {
              return new AppError(`Page not found`, BAD_REQUEST);
            }
            if (_.isUndefined(gender)) {
              if (sortByHeight === undefined && sortByAge === undefined) {
                meta.pagination = pageDataCharacters;
                const data = paginate(parseInt(page), characters, limit);
                console.log('data:', data);
                return AppResponse.format(meta, {
                  title: movieTitle,
                  total_height: `${totalHeight}ft`,
                  total_height_inches: `${totalHeightInches}inches`,
                  characters: data,
                });
              }

              if (!_.isUndefined(sortByHeight) && !_.isUndefined(sortByAge)) {
                const charsSortHeight = characters.sort((a, b) => {
                  if (sortByHeight.toLowerCase() === 'asc') {
                    return parseInt(a.height) - parseInt(b.height);
                  } else {
                    return parseInt(b.height) - parseInt(a.height);
                  }
                });
                meta.pagination = pageDataCharacters;
                const data = paginate(parseInt(page), charsSortHeight, limit);
                return AppResponse.format(meta, { title: movieTitle, characters: data });
              }

              if (_.isUndefined(sortByHeight) && !_.isUndefined(sortByAge)) {
                const charsSortAge = characters.sort((a, b) => {
                  if (sortByAge.toLowerCase() === 'asc') {
                    return parseInt(a.birth_year) - parseInt(b.birth_year);
                  } else {
                    return parseInt(b.birth_year) - parseInt(a.birth_year);
                  }
                });
                meta.pagination = pageDataCharacters;
                const data = paginate(parseInt(page), charsSortAge, limit);
                return AppResponse.format(meta, { title: movieTitle, characters: data });
              }
            }
            if (!['male', 'female'].includes(gender.toLowerCase())) {
              return new AppError(`Gender query's value is either "male" or "female"!`, BAD_REQUEST);
            }
            const charactersByGender = characters.filter((character) => character.gender === gender.toLowerCase());

            const pageDataByGender = pageData(limit, offset, charactersByGender.length, page);
            if (parseInt(page) > pageDataByGender.page_count) {
              return new AppError(`Page not found !`, BAD_REQUEST);
            }
            if (_.isUndefined(sortByHeight) && _.isUndefined(sortByAge)) {
              meta.pagination = pageDataByGender;
              const data = paginate(parseInt(page), charactersByGender, limit);
              return AppResponse.format(meta, { title: movieTitle, characters: data });
            }

            if (!_.isUndefined(sortByHeight) && _.isUndefined(sortByAge)) {
              const charsSortHeight = charactersByGender.sort((a, b) => {
                if (sortByHeight.toLowerCase() === 'asc') {
                  return parseInt(a.height) - parseInt(b.height);
                } else {
                  return parseInt(b.height) - parseInt(a.height);
                }
              });
              meta.pagination = pageDataByGender;
              const data = paginate(parseInt(page), charsSortHeight, limit);
              return AppResponse.format(meta, { title: movieTitle, characters: data });
            }
            if (_.isUndefined(sortByHeight) && !_.isUndefined(sortByAge)) {
              const charsSortAge = charactersByGender.sort((a, b) => {
                if (sortByAge.toLowerCase() === 'asc') {
                  return parseInt(a.birth_year) - parseInt(b.birth_year);
                } else {
                  return parseInt(b.birth_year) - parseInt(a.birth_year);
                }
              });
              meta.pagination = pageDataByGender;
              const data = paginate(parseInt(page), charsSortAge, limit);
              return AppResponse.format(meta, { title: movieTitle, characters: data });
            }
          })
          .catch((err) => console.error(err));
      })
      .catch((err: any) => console.error(err));
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
