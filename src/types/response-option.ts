import { AppModel } from '../_core/app.model';
import Pagination from '../utils/pagination';
import QueryParser from '../utils/query-parser';

type ResponseOption = {
    token?: any;

    /** this is the model */
    model: AppModel;
    
    /** value data to be returned to the client */
    value?: any;

    /** the status code */
    code: number,
    
    /** the response message  */
    message?: string,

    /*** the queryparser util for the query */
    queryParser?: QueryParser;
    
    /** the pagination used   */
    pagination?: Pagination;
    
    count?: number;
    
    email?: any;
    
    mobile?: any;

    cache?: any;
};
export default ResponseOption;