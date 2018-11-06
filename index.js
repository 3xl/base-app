'use strict';

// load environment variables
require('dotenv').config();

// modules import
const { Ms } = require('ms-crud');

const resources = require('./src/resources');
const routes = require('./src/routes');

// init application
const ms = new Ms({
  mongo: {
    connection: process.env.MONGO_CONNECTION
  },
  resources: resources,
  routes: routes
});

ms.start(process.env.PORT);
