import cluster from 'cluster';
import each from 'lodash/each';
import nconf from 'nconf';
import log from '../logger';

export default function setup() {
  let numCPUs = require('os').cpus().length;
  if (numCPUs > nconf.get('maxClusters')) {
    numCPUs = nconf.get('maxClusters');
  }

  log.info(`Starting app in clustered mode numCPUs = ${numCPUs}`);

  const timeouts = [];

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('fork', (worker) => {
    log.debug(`Forking worker #${worker.id}`);
    timeouts[worker.id] = setTimeout(() => {
      log.crit(['Worker taking too long to start']);
    }, 2000);
  });

  cluster.on('listening', (worker, address) => {
    log.info(`Worker #${worker.id} listening on port: ${address.port}`);
    clearTimeout(timeouts[worker.id]);
  });

  cluster.on('online', (worker) => {
    log.debug(`Worker #${worker.id} is online`);
  });

  cluster.on('exit', (worker, code, signal) => {
    log.crit([`The worker #${worker.id} has exited with exitCode ${worker.process.exitCode}`]);
    clearTimeout(timeouts[worker.id]);
    // Don't try to restart the workers when disconnect or destroy has been called
    if (worker.suicide !== true) {
      log.warn(`Worker #${worker.id} did not commit suicide, restarting`);
      cluster.fork();
    }
  });

  cluster.on('disconnect', (worker) => {
    log.warn(`The worker #${worker.id} has disconnected`);
  });

  // Trick suggested by Ian Young (https://github.com/isaacs/node-supervisor/issues/40#issuecomment-4330946)
  // to make cluster and supervisor play nicely together:
  // if (process.env.NODE_HOT_RELOAD === 1) {
  // const signals = [ 'SIGUSR2', 'SIGINT', 'SIGTERM', 'SIGQUIT' ];
  const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
  each(signals, (signal) => {
    process.on(signal, () => {
      each(cluster.workers, (worker) => {
        worker.destroy();
      });
    });
  });
  // }
}
