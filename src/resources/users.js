'use strict';

const jwt = require('../jwt.js');

/**
 * Remove sensible data from user model
 * 
 * @param {Object} user 
 */
const transforUser = user => {
  delete user.password;

  return user;
}

module.exports = {
  properties: {
    email: { type: String, unique: true },
    password: { type: String },
    activatedAt: { type: Date }
  },
  transformer: transforUser,
  middlewares: [
    jwt.authorize
  ]
};
