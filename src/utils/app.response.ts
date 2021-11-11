import { OK } from '../utils/codes';


/**
 * The AppResponse class
 * This class is responsible for json responses
 * */
class AppResponse {
    /**
     * @return {Object} The success response object
     * */
    static getSuccessMeta(): any {
        return { status_code: OK, success: true };
    }

    /**
     * @param {Object} meta The meta object
     * @param {Object} data success response object
     * @return {Object} The success response object
     * */
    static format(meta: any | object, data?: any | object): any | object {
        const response: any = {};
        response._meta = meta;
        if (meta.code) {
            meta.status_code = meta.code;
            delete meta.code;
        }
        if (data) {
            response.data = data;
        }
        return response;
    }
}

export default AppResponse;
