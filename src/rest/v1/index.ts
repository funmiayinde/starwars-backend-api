import { Router } from 'express';

import todo from './api/todo/todo.route';
import comment from './api/comment/comment.route';
import movies from './api/movies/movies.route';

const router = Router();

router.use(todo);
router.use(comment);
router.use(movies);

export default router;