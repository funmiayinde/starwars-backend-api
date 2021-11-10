import { AppModel } from '../../../../_core/app.model';
import { AppController } from '../../../../_core/app.controller';

/**
 * @class CommentController
 */
class CommentController extends AppController {
  /**
   * @param {AppModel} model The model name
   * @constructor
   */
  constructor(model: AppModel) {
    super(model);
  }
}

export default CommentController;
