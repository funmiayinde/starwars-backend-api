import { getPublicIP } from './../../../../utils/helper';
import { NOT_FOUND } from '../../../../utils/codes';
import AppError from '../../../../utils/app-error';
import AppProcessor from '../../../../_core/app.processor';
import { Movies } from '../movies/movies.model';
import _ from 'lodash';

/**
 * @class {CommentProcessor}
 */
export default class CommentProcessor extends AppProcessor {
  /**
   *
   * @param {Object} obj The payload object
   * @returns
   */
  public async createNewObject(obj: any): Promise<any> {
    const movie: any = await Movies.getRepo(Movies.newInstance().name).findOne({ id: obj.movie_id });
    console.log('movie', movie);
    if (!movie) {
      return new AppError('Movie not found', NOT_FOUND);
    }
    const ipAddress = await getPublicIP();
    _.extend(obj, { movie_id: movie.id, ip_address: ipAddress['ipAddress']});
    const comment = await super.createNewObject(obj);
    _.extend(movie, { comment: [comment.id], comment_id: comment.id, comment_count: movie.comment_count + 1});
    await Movies.getRepo(Movies.newInstance().name).save(movie);
    return comment;
  }
}
