import nconf from 'nconf';
import Redis from 'redis';
import isFunction from 'lodash/isFunction';
import logger from '../logger';

let redis = null;

export default function (cb) {
  if (!nconf.get('db:redis:start')) {
    logger.warn('the configuration system is not going to start redis server');
    return;
  }
  if (redis) { return redis; }

  redis = Redis.createClient(nconf.get('db:redis:uri'));
  redis.on('ready', () => {
    logger.info(`Redis default connection open to ${nconf.get('db:redis:uri')}`);
    isFunction(cb) && cb();
  });
  redis.on('error', (err) => {
    logger.error(err.message);
    isFunction(cb) && cb(err);
  });
  return redis;
}

process.on('exit', (code) => {
  if (redis) {
    redis.end();
  }
  redis = null;
});
