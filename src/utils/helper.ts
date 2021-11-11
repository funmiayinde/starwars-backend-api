import { GET, INTERNAL_SERVER_ERROR } from './codes';
import axios from 'axios';
import _ from 'lodash';
import AppError from './app-error';
import cacheManager from 'cache-manager';
import redisStore from 'cache-manager-ioredis';
import Redis from 'ioredis';
import config from 'config';
import { Request } from 'express';

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

export const isCacheable = (req: any | Request) => {
  const currentUrlPath = req.originalUrl.split('?')[0];
  const cacheUrls = [
    { route: 'movies', method: GET },
    { route: 'movies/characters', method: GET },
  ];
  return _.filter(cacheUrls, (item) => {
    const regex = new RegExp(`^/api/v[1-9]/${item.route}`);
    return regex.test(currentUrlPath) && req.method.toLowerCase() == item.method;
  });
};

export const CacheHelper = () => {
  const redisInstance = new Redis({
    host: config.get('redis.url') as string,
    port: 15020,
    password: config.get('redis.password') as string,
    db: 0,
  });
  return cacheManager.caching({
    store: redisStore,
    redisInstance: redisInstance,
    ttl: 30,
  });
};
