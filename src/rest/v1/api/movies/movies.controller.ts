/* eslint-disable @typescript-eslint/no-unused-vars */
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
import axios from 'axios';
import { cmToInFt, pageData, paginate } from '../../../../utils/helper';
import { SimpleConsoleLogger } from 'typeorm';
import { data } from 'jquery';

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

  /**
   * @param {Any| Request} req The request object
   * @param {Any | Response} res The response object
   * @param {NextFunction} next The callback to the next program handler
   * @return {Object} res The response object
   */
  async movieCharacters(req: any | Request, res: any | Response, next: NextFunction) {
    const processor = this.model.getProcessor();
    const queryParser = new QueryParser(Object.assign({}, req.query));
    const meta = AppResponse.getSuccessMeta();
    const { title, gender } = queryParser.query;

    const limit = queryParser.query.limit || 30;
    const offset = queryParser.query.offset || 0;
    const page = queryParser.query.page || 1;

    const validate = new Validator({ ...req.query }, { title: 'required' });
    if (!validate.passes()) {
      return next(new AppError(lang.get('error').inputs, BAD_REQUEST, validate.errors.all()));
    }

    const result = processor
      .fetchStarWarsMovies()
      .then((movies: any[]) => {
        const titleQuery = title.toLowerCase();
        const movie = movies.find((movie) => {
          const movieTitle = movie.title.toLowerCase();
          if (movieTitle.includes(titleQuery)) {
            return movie;
          }
        });
        if (_.isUndefined(movie)) {
          return next(new AppError(this.lang.not_found, NOT_FOUND));
        }
        const movieTitle = movie.title;
        const { sortByHeight, sortByAge } = queryParser.query;
        if (!_.isUndefined(sortByHeight) && !_.isUndefined(sortByAge)) {
          return next(new AppError('You can sort either height or age per time', BAD_REQUEST));
        }

        if (!_.isUndefined(sortByHeight)) {
          if (!['asc', 'desc'].includes(sortByHeight.toLowerCase())) {
            return next(new AppError(`Height can be sorted "asc" - ascending or "desc" - descending!`, BAD_REQUEST));
          }
        }

        if (!_.isUndefined(sortByAge)) {
          if (!['asc', 'desc'].includes(sortByAge.toLowerCase())) {
            return next(new AppError(`Age can be sorted "asc" - ascending or "desc" - descending!`, BAD_REQUEST));
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
              return next(new AppError(`Page not found`, BAD_REQUEST));
            }
            if (_.isUndefined(gender)) {
              if (sortByHeight === undefined && sortByAge === undefined) {
                meta.pagination = pageDataCharacters;
                const data = paginate(parseInt(page), characters, limit);
                return res.status(OK).json(
                  AppResponse.format(meta, {
                    title: movieTitle,
                    total_height: `${totalHeight}ft`,
                    total_height_inches: `${totalHeightInches}inches`,
                    characters: data,
                  }),
                );
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
                return res.status(OK).json(AppResponse.format(meta, { title: movieTitle, characters: data }));
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
                return res.status(OK).json(AppResponse.format(meta, { title: movieTitle, characters: data }));
              }
            }
            if (!['male', 'female'].includes(gender.toLowerCase())) {
              return next(new AppError(`Gender query's value is either "male" or "female"!`, BAD_REQUEST));
            }
            const charactersByGender = characters.filter((character) => character.gender === gender.toLowerCase());

            const pageDataByGender = pageData(limit, offset, charactersByGender.length, page);
            if (parseInt(page) > pageDataByGender.page_count) {
              return res.status(404).send({ message: 'Invalid page!' });
            }
            if (_.isUndefined(sortByHeight) && _.isUndefined(sortByAge)) {
              meta.pagination = pageDataByGender;
              const data = paginate(parseInt(page), charactersByGender, limit);
              return res.status(OK).json(AppResponse.format(meta, { title: movieTitle, characters: data }));
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
              return res.status(OK).json(AppResponse.format(meta, { title: movieTitle, characters: data }));
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
              return res.status(OK).json(AppResponse.format(meta, { title: movieTitle, characters: data }));
            }
          })
          .catch((err) => console.error(err));
      })
      .catch((err: any) => console.error(err));

    return result;
  }
}

export default MoviesController;
