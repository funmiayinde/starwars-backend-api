import { Movies } from './../rest/v1/api/movies/movies.model';
import { Comments } from './../rest/v1/api/comment/comment.model';
import config from 'config';
import { createConnection } from 'typeorm';
import logger from '../utils/logger';
import { Todo } from '../rest/v1/api/todo/todo.model';

export default () => {
  const host: string = config.get('databases.typeorm.host');
  const dbName: string = config.get('databases.typeorm.dbName');
  const password: string = config.get('databases.typeorm.password');
  const user: string = config.get('databases.typeorm.user');
  const isNotProduction: boolean = `${config.util.getEnv('NODE_ENV')}` !== 'production';
  return createConnection({
    type: 'postgres',
    host,
    // url: host,
    port: 5432,
    password,
    database: dbName,
    entities: [
      Todo,
      Comments,
      Movies,
    ],
    synchronize: isNotProduction ? true : false,
    logging: isNotProduction ? true : false,
  })
    .then(() => logger.debug(`Database loaded - url- ${host}:${dbName}:${user}`))
    .catch((err) => {
      logger.error(err);
      throw err;
    });
};
