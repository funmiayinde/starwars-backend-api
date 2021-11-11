import Validator from "validatorjs";
import AppValidation from "../../../../_core/app.validation";


/**
 * @class {CommentValidation}
 */
export default class CommentValidation extends AppValidation {

    /**
    * @param {Object} obj The object to validate
    * @return {Object} 
    */
    create(obj: any) {
        const rules: Validator.Rules = {
            movie_id: 'required|string',
            text: 'required|string',
            // ip_address: 'required|string',
        };
        const validator = new Validator(obj, rules);
        return {
            errors: validator.errors.all(),
            passed: validator.passes(),
        };
    }

}