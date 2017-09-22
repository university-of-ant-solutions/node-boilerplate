#!/usr/bin/env ./node_modules/.bin/babel-node
import isFunction from 'lodash/isFunction';
import mongoose from 'mongoose';
import path from 'path';
import nconf from 'nconf';
import fs from 'fs';
import fixtures from './fixtures';
import logger from '../src/logger';
import {
  TodosModel
} from '../src/models';

nconf.env().argv();
const env = nconf.get('NODE_ENV') || 'development';

let instance = null;

function relativePath(...p) {
  p.unshift(__dirname);
  return path.join(...p);
}

function connect (uri, options, cb) {
  // http://mongodb.github.io/node-mongodb-native/2.0/api/Server.html#connections
  options.server = options.server ? options.server : {
    socketOptions: { keepAlive: 1 }
  };
  options.auto_reconnect = true;

  const connect = mongoose.createConnection(uri, options);

  // CONNECTION EVENTS
  // When successfully connected
  connect.on('connected', function () {
    logger.info('Mongoose default connection open to ' + uri);
    isFunction(cb) && cb();
  });

  // If the connection throws an error
  connect.on('error', function (err) {
    logger.error('Failed to connect to DB ' + uri + ' on startup ' + err.message);
  });

  // When the connection is disconnected
  connect.on('disconnected', function () {
    logger.warn('Mongoose default connection to DB :' + uri +
      ' disconnected'
    );
  });

  const gracefulExit = function () {
    connect.close(function () {
      logger.info(
        'Mongoose default connection with DB :' + uri +
        ' is disconnected through app termination'
      );
      process.exit(0);
    });
  };
  // If the Node process ends, close the Mongoose connection
  process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);

  return connect;
}

// Mongo
let primaryData = null;
function connectPrimaryData (uri, options, isFixture = false) {
  if(!primaryData) {
    const db = nconf.get('db:mongo');
    uri = db ? db.uri : uri;
    options = db ? db.options : options;
    primaryData = connect(uri, options, function () {
      fixtures(primaryData);
    });
    TodosModel(primaryData);
  }
  return primaryData;
}

(async function () {
  try {
    let f = 'development.json';
    if (env === 'production') {
      logger.warn('we dont insert dummy data on production, dude !!!');
      process.exit(0);
    }
    if (env === 'staging') {
      f = 'staging.json';
    }
    if (env === 'tests') {
      f = 'tests.json';
    }
    nconf.file({
      file: relativePath('..', 'config', `${f}`)
    }).defaults({});

    connectPrimaryData();
  }
  catch(e) {
    logger.warn(e.message);
    process.exit(1);
  }
})();
