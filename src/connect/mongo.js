import mongoose from 'mongoose';
import nconf from 'nconf';
import isFunction from 'lodash/isFunction';
import logger from '../logger';

// http://mongoosejs.com/docs/promises.html
mongoose.Promise = global.Promise;
const reconnectTimeout = 3000; // ms.
let isConnectedBefore = false;

export function connect(uri, options, cb) {
  // http://mongodb.github.io/node-mongodb-native/2.0/api/Server.html#connections
  options.server = options.server ? options.server : {
    socketOptions: { keepAlive: 1, autoReconnect: true },
  };

  const conn = mongoose.createConnection(uri, options);

  // CONNECTION EVENTS
  // When successfully connected
  conn.on('connected', () => {
    logger.info(`Mongoose default connection open to ${uri}`);
    isConnectedBefore = true;
    isFunction(cb) && cb();
  });

  // If the connection throws an error
  conn.on('error', (err) => {
    logger.error(`Failed to connect to DB ${uri} on startup ${err.message}`);
    isFunction(cb) && cb(err);
    mongoose.disconnect();
  });

  conn.on('reconnected', () => {
    logger.info(`Mongoose reconnected to ${uri}`);
  });

  // When the connection is disconnected
  conn.on('disconnected', () => {
    logger.warn(`Mongoose default connection to DB : ${uri} disconnected`);
    if (!isConnectedBefore) {
      setTimeout(() => connect(uri, options, cb), reconnectTimeout);
    }
  });

  const gracefulExit = () => {
    conn.close(() => {
      logger.info(`Mongoose default connection with DB : ${uri} is disconnected through app termination`);
      process.exit(0);
    });
  };
  // If the Node process ends, close the Mongoose connection
  process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);

  return conn;
}

// Mongo
let primaryData = null;
const {
  TodosModel,
} = require('../models');

export function connectPrimaryData(uri, options, cb = () => {}) {
  if (!primaryData) {
    const db = nconf.get('db:mongo');
    uri = uri || db.uri;
    options = options || db.options;
    primaryData = connect(uri, options, cb);

    TodosModel(primaryData);
  }
  return primaryData;
}
