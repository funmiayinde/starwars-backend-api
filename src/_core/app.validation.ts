/* eslint-disable @typescript-eslint/no-explicit-any */
import Validator from "validatorjs";
import {ValidationOption} from "../types/validation-option";

/**
 * The App Validation class
 */
class AppValidation {
    /**
     * @param {Object} obj The object to validate
     * @return {Object} 
     */
    create(obj: any): ValidationOption {
        const rules: Validator.Rules = {};
        const validator = new Validator(obj, rules);
        return {
            errors: validator.errors.all(),
            passed: validator.passes(),
        };
    }
    /**
     * @param {Object} obj The object to validate
     * @return {Object} 
     */
    update(obj: any): ValidationOption {
        const rules: Validator.Rules = {};
        const validator = new Validator(obj, rules);
        return {
            errors: validator.errors.all(),
            passed: validator.passes(),
        };
    }
}
export default AppValidation;