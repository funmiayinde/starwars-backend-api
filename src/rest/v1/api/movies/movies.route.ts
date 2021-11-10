import { Router } from 'express';
import response from '../../middleware/response';
import MoviesController from './movies.controller';
import { Movies } from './movies.model';


const router = Router();

const ctrl = new MoviesController(Movies.newInstance());

router.route('/movies/characters').get(ctrl.movieCharacters);
router.route('/movies').get(ctrl.find, response);
// router.route('/movies').get(ctrl.fetchMovies);

export default router;