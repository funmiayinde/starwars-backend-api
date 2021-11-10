import { Router } from 'express';
import response from '../../middleware/response';
import TodoController from './todo.controller';
import { Todo } from './todo.model';


const router = Router();

const ctrl = new TodoController(Todo.newInstance());

router.route('/todos')
    .post(ctrl.create, response)
    .get(ctrl.find, response);

// router.param('id', ctrl.id);
router.route('/todos/:id')
    .get(ctrl.findOne, response)
    .put(ctrl.update,response)
    .delete(ctrl.delete, response);



export default router;