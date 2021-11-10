import { INTERNAL_SERVER_ERROR } from './codes';
import axios from 'axios';
import _ from 'lodash';
import AppError from './app-error';

/**
 * @param {Number} size code length
 * @param {Boolean} alpha Check if it's alpha numeral
 * @return {String} The code
 **/
export const generateCode = (size = 4, alpha = false) => {
  const result: any = [];
  const characters: string | string[] = alpha
    ? '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    : '0123456789';

  for (let i = 0; i < size; i++) {
    result.push(characters.charAt(Math.floor(Math.random() * characters.length)));
  }
  return result.join('');
};

/**
 * @param {Number} size Hour count
 * @return {Date} The date
 */
export const addHourToDate = (size: number) => {
  const date = new Date();
  const hours = date.getHours() + size || 1;
  date.setHours(hours);
  return date;
};

export const cmToInFt = (cm: any) => {
  const inches = Math.round(cm / 2.54);
  return {
    feet: Math.round(Math.floor(inches / 12)).toFixed(2),
    inches: inches % 12,
  };
};
export const getPublicIP = async () => {
  const response = await axios.get(`https://api.db-ip.com/v2/free/self`);
  if (response.data && response.status === 200) {
    return response.data;
  }
  return new AppError('Unable to get IP address', INTERNAL_SERVER_ERROR);
};

export const pageData = (limit: any, offset: any, count: any, pageQuery: any) => {
  const pageData: any = {};
  limit = limit > count ? count : limit;
  offset = offset > count ? count : offset;

  pageData['total_count'] = count;
  pageData['page_count'] = Math.ceil(count / limit);
  pageData['page_size'] = Number(limit);
  pageData['page'] = Number(pageQuery);

  return pageData;
};

export const paginate = (page: any, records: any | any[], limit: any) => {
  return records.slice(limit * (page - 1), limit * page);
};
