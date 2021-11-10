import * as queryString from 'query-string';
import url, { URL } from 'url';
import config from 'config';

/**
 * The Pagination class
 * */
class Pagination {
    private pagination: any;
    private urlObj: URL;
    private _perPage: any;
    private query: any;
    private _current: number;
    private _skip: number;

    /**
     * @constructor
     * @param {String} requestUrl This is a query object
     * */
    constructor(requestUrl: string) {
        // Default pagination object
        this.pagination = { total_count: 0 };
        // Get the full request url
        const resolvedUrl = url.resolve(config.get('app.base_url'), requestUrl);
        this.urlObj = new URL(resolvedUrl);
        const urlObj = this.urlObj;
        const search = urlObj.search;
        // Parse the query string into object
        this.query = queryString.parse(search);
        // GRAB the pagination object from the query object
        // The limit(count to be be returned)
        this._perPage = this.query && this.query.per_page ? parseInt(this.query.per_page, 10) : config.get('api.pagination.itemsPerPage');
        this.pagination.per_page = this._perPage;

        // The amount to be skipped
        this._skip = 0;

        const perPage = this.perPage;
        urlObj.searchParams.set('per_page', perPage.toString());

        // Current page number
        this._current = this.query && this.query.page
            ? parseInt(this.query.page, 10)
            : 1;

        const page = this._current;
        if (page && page > 1) {
            const urlObj = this.urlObj;
            const prev = page - 1;
            this._skip = prev * perPage;
            this.pagination.previous = prev;
            urlObj.searchParams.set('page', prev.toString());
            this.pagination.previous_page = urlObj.href;
        }
        this.pagination.current = page;
        urlObj.searchParams.set('page', page.toString());
        this.pagination.current_page = urlObj.href;
    }

    /**
     * @param {Number} page The page number
     * */
    set next(page: number) {
        const urlObj = this.urlObj;
        this.pagination.next = page;
        urlObj.searchParams.set('page', page.toString());
        this.pagination.next_page = urlObj.href;
    }

    /**
     * @return {Number}
     * */
    get skip(): number {
        return this._skip;
    }

    /**
     * @param {Number} count The amount of item to skip
     * */
    set skip(count: number) {
        this._skip = count;
    }

    /**
     * @return {Any}
     * */
    get perPage(): any {
        return this._perPage;
    }

    /**
     * @return {Number}
     * */
    get current(): number {
        return this._current;
    }

    /**
     * @return  {Number} total count
     * */
    get totalCount(): number {
        return this.pagination.total_count;
    }

    /**
     * @param {Number} count The total count of items
     * @return {void}
     * */
    set totalCount(count) {
        this.pagination.total_count = count;
    }

    /**
     * @param {Number} count The total count of items
     * @return {Boolean}
     * */
    morePages(count: number): boolean {
        return count > this._perPage * this._current;
    }

    /**
     * @return  {Object}
     * */
    done(): Pagination {
        return this.pagination;
    }
}

/**
 * @typedef Pagination
 * */
export default Pagination;
