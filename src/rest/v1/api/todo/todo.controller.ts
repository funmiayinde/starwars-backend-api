import { AppModel } from "../../../../_core/app.model";
import { AppController } from "../../../../_core/app.controller";

class TodoController extends AppController {

    constructor(model: AppModel) {
        super(model);
    }
}

export default TodoController;