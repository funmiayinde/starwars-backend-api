/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
import _ from 'lodash';
/**
 * The QueryParser class
 */
class QueryParser {
  private _query: any;
  private _all: any;
  private _sort: any;
  private _include: any;
  private _selection: any;
  private _where: any;
  private _search: any;
  private _filters: any;
  private _group: any;

  /***
   * @constructor
   * @param {Object} query This is a query object of the request
   */
  constructor(query: any) {
    this._query = query;
    this.initialize(query);
    const excluded: string[] = [
      'per_page',
      'page',
      'limit',
      'sort',
      'where',
      'all',
      'include',
      'filters',
      'group',
      'selection',
      'search',
      'nested',
      'regex',
    ];
    // omit special query string keys from query before passing down to the model for filtering
    this._query = _.omit(this._query, ...excluded);
    _.extend(this._query, { deleted: false });
    Object.assign(this, this._query);
  }

  /***
   * Initialize all the special object required for the find query
   * @param {Object} query This is a query object of the request
   */
  private initialize(query: any) {
    this._all = query.all;
    this._sort = query.sort;
    if (query.include) {
      this._include = _.isString(query.include) ? JSON.parse(query.include) : query.include;
    }
    if (query.selection) {
      this._selection = _.isString(query.selection) ? JSON.parse(query.selection) : query.selection;
    }
    if (query.search) {
      this._search = query.search;
    }
    if (query.group) {
      this._group = query.group;
    }
    if (query.filters) {
      try {
        this._filters = JSON.stringify(query.filters);
      } catch (e) {
        console.log('filter-error:', e.getMessages());
      }
    }
    if (query.nested) {
      this._query = { ...this._query, ...this.processNestedQuery(query) };
    }
    if (query.regex) {
      this._query = { ...this._query, ...this.processRegSearch(query) };
    }
  }

  /**
   * @param {Object} query is the query object
   * @return {Object} the nested query
   */
  private processNestedQuery(query: any): any {
    let value = query.nested;
    const result: any = {};
    if (value) {
      try {
        value = JSON.parse(value.toString());
        for (const filter of value) {
          if (filter.hasOwnProperty('key') && filter.hasOwnProperty('value')) {
            filter.value = filter.value.in_array.map((v: any) => v);
          }
          result[filter.key] = filter.value;
        }
      } catch (e) {
        console.log(e);
      }
    }
    return result;
  }

  /**
   * @param {Object} query is the query object
   * @return {Object} the nested query
   */
  private processRegSearch(query: any): any {
    const value = query.regex;
    const result: any = {};
    if (!_.isObject(value)) {
      try {
        const regex = JSON.parse(value.toString());
        for (const r of regex) {
          result[r.key] = new RegExp(r.value);
        }
      } catch (e) {
        console.log(e);
      }
    }
    return result;
  }

  /**
   * @return {Object} get the parsed query
   */
  get query() {
    return this._query;
  }

  /**
   * @return {Object} get the parsed query
   */
  get search() {
    return this._search;
  }
  /**
   * @return {Object} get the parsed query
   */
  get filters() {
    return this._filters;
  }
  /**
   * @return {Boolean} get the value for all data request
   */
  get getAll() {
    return this._all;
  }
  /**
   * @return {Object} get the parsed query
   */
  get selection() {
    if (this._selection) {
      return this._selection;
    }
    return [];
  }

  /**
   * @param {Object} value is the include for object
   */
  set include(value) {
    this._include = value;
    if (!_.isObject(value)) {
      try {
        this._include = JSON.parse(value.toString());
      } catch (e) {
        console.log('re');
      }
    }
  }

  /**
   * @return {Object} get the include object for the query
   */
  get include() {
    if (this._include) {
      return this._include;
    }
    return [];
  }
  /**
   * @param {Object} value is the selection object
   */
  set selection(value) {
    this._selection = value;
  }
  /**
   * @return {Object} get the sort property
   */
  get sort() {
    if (this._sort) {
      return JSON.parse(this._sort);
    }
    return { created_at: 'DESC' };
  }
}

export default QueryParser;
