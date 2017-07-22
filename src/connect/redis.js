import nconf from 'nconf';
import Redis from 'redis';
import logger from '../logger';
let redis = {
  sub: null,
  pub: null,
};

export default function () {
  if (!nconf.get('db:redis:start')) {
    logger.warn('the configuration system is not going to start redis server');
    return;
  }
  if (redis.sub && redis.pub) { return redis; }

  try {
    redis.sub = Redis.createClient(nconf.get('db:redis:uri'));
    redis.pub = Redis.createClient(nconf.get('db:redis:uri'));
    logger.info(`Redis default connection open to ${nconf.get('db:redis:uri')}`);
    return redis;
  } catch (e) {
    logger.error(e.message);
  }
}

process.on('exit', (code) => {
  if (redis.sub && redis.sub.end) {
    redis.sub.end();
  }
  if (redis.pub && redis.pub.end) {
    redis.pub.end();
  }
  redis = {
    sub: null,
    pub: null,
  };
});
