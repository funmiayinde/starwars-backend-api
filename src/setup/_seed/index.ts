
import _ from 'lodash';
/**
 * 
 * @
 */
export default class Seed {

    /**
     * @constructor
     */
    constructor() {
        console.log('Begin setup seed');
    }

    /***
     * seed data
     */
    seed() {
        /* seed data here */
        _.extend({ hello: 'hello' }, { world: 'world' });
    }
}