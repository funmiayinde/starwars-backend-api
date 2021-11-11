import _ from 'lodash';
import config from 'config';

const language = config.get('api.lang');

/**
 * @param {Object} prop
 * @return {Object} return property
 */
function get(prop: any): any {
    if (this.hasOwnProperty(prop))
        return this[prop];
    else
        console.log('props:', prop);
        throw new Error(`There's no property defined as ${prop} in your translations`);
};

const lang: any = { get };
const obj = require(`./${language}`).default;
_.each(Object.getOwnPropertyNames(obj), (property) => {
    const prop = property;
    lang[prop] = Object.assign({}, obj[prop], { get });
});
export default lang;