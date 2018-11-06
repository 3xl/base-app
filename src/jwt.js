'use strict';

const Rx = require('rx');
const jwtwebtoken = require('jsonwebtoken');

/**
 * Creates a json web token
 * 
 * @param {Object} payload
 * 
 * @returns {Observable}
 */
const sign = payload => {
  return Rx.Observable.create(observer => {
    jwtwebtoken.sign(
      payload, 
      process.env.SECRET_KEY,

      // options
      { 
        expiresIn: process.env.EXPIRATION_TIME 
      }, 

      // callback
      (error, token) => {
        if(error) {
          observer.onError('Error creating token');
        } else {
          observer.onNext({ token: token });
          observer.onCompleted()
        }
      }
    );
  });
};

/**
 * Verify token
 * 
 * @param {String} token 
 */
const check = token => {
  return Rx.Observable.create(observer => {
    jwtwebtoken.verify(token, process.env.SECRET_KEY, function(error, decoded) {
      if(error) {
        observer.onError('Invalid token.');
      } else {
        observer.onNext({ user: decoded });
        observer.onCompleted()
      }
    })
  })
};

/**
 * 
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 */
const authorize = (req, res, next) => {
  let token = req.headers['x-access-token'];

  req.source = Rx.Observable.create(observer => {
    if(token != undefined) {
      observer.onNext();
      observer.onCompleted();
    } else {
      observer.onError('Missing token.')
    }
  })
  .flatMap(() => check(token));

  next();
};

module.exports = {
  sign: sign,
  authorize: authorize
};
