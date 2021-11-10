import Validator from "validatorjs";
import AppValidation from "../../../../_core/app.validation";


/**
 * @class {TodoValidation}
 */
export default class TodoValidation extends AppValidation {

    /**
    * @param {Object} obj The object to validate
    * @return {Object} 
    */
    create(obj: any) {
        const rules: Validator.Rules = {
            title: 'required|string',
            description: 'required|string'
        };
        const validator = new Validator(obj, rules);
        return {
            errors: validator.errors.all(),
            passed: validator.passes(),
        };
    }

}