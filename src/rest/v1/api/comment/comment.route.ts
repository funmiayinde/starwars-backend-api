import { Router } from 'express';
import response from '../../middleware/response';
import CommentController from './comment.controller';
import { Comments } from './comment.model';


const router = Router();

const ctrl = new CommentController(Comments.newInstance());

router.route('/comments')
    .post(ctrl.create, response)
    .get(ctrl.find, response);

export default router;