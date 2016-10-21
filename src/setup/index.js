import cluster from 'cluster';
import express from 'express';
import nconf from 'nconf';
import setupCluster from '../utils/clustering';
import setAppDefaults from './set-app-defaults';
import setAppRouter from './set-app-router';
import logger from '../logger';

export default function createServer(port) {
  if (!nconf.get('cluster')) {
    logger.warn('the configuration system is not going to start cluster server');
  }
  if (cluster.isMaster && nconf.get('cluster')) {
    // master
    setupCluster();
    return;
  }

  // worker
  const app = express();
  setAppDefaults(app);
  setAppRouter(app);

  app.set('port', port);
  const server = require('http').createServer(app);

  const httpServer = server.listen(app.get('port'), () => {
    logger.info(`Node app is running on port ${app.get('port')}`);
  });

  return httpServer;
}
