import nconf from 'nconf';
import todos from '../private/todos';
import logger from '../src/logger';
import {
  TodosModel,
} from '../src/models';

const env = nconf.get('NODE_ENV') || 'development';

export default async function fixtures(connection) {
  logger.info('Running fixture data');

  try {
    if (env === 'development') {}
    await (async function() {
      for (let todo of todos.data) {
        if(! await TodosModel(connection).findOne({_id: todo._id})) {
          await TodosModel(connection).create(todo);
        }
      }
      logger.info('fixture - todo : done');

      process.exit(0);
    })();
  } catch (e) {
    logger.error(e.message);
    process.exit(1);
  }
}
