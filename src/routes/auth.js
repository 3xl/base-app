'use strict';

const Rx = require('rx');
const bcrypt = require('bcrypt');

const jwt = require('../jwt.js');

/**
 * It performs the signup process
 * 
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 */
const signup = (req, res, next) => {
  const users = req.app.get('ms').getResource('users');

  req.source = Rx.Observable.create(observer => {
    // validate inputs
    if(req.body.email && req.body.password) {
      observer.onNext({
        email: req.body.email,
        password: req.body.password,
      });

      observer.onCompleted();
    } 
    
    // abort login process
    else {
      observer.onError(new Error('Missing email or password.'));
    }
  })

  // encrypt the password
  .map(credentials => {
    return Object.assign(credentials, { 
      password: bcrypt.hashSync(credentials.password, parseInt(process.env.SALT_ROUND))
    });
  })

  // create user
  .flatMap(credentials => users.service.create(credentials));
  
  next();
};

/**
 * It performs the login process
 * 
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 */
const login = (req, res, next) => {
  const users = req.app.get('ms').getResource('users');

  const { email, password } = req.body;

  req.source = Rx.Observable.create(observer => {
    // validate inputs
    if(req.body.email && req.body.password) {
      observer.onNext({
        email: email,
        password: password,
      });

      observer.onCompleted();
    } 
    
    // abort login process
    else {
      observer.onError('Missing email or password.');
    }
  })

    // disable transformer
    .flatMap(credentials => users.setTransformable(false, credentials))

    // find an user with this credentials
    .flatMap(credentials => users.service.all({
      email: credentials.email,
    }))

    // enable transformer
    .flatMap(data => users.setTransformable(true, data))

    // all method returns a collection, for this reason I take the first element
    .flatMap(data => {
      return Rx.Observable.if(
        // check
        () => data.docs.length > 0,
        
        // get the first and only element in the array
        Rx.Observable.from(data.docs).take(1),

        // return an empty object
        Rx.Observable.throw('There is no user registered with this email address.')
      )
    })

    // check password
    .flatMap(user => {
      return Rx.Observable.if(
        // check
        () => bcrypt.compareSync(password, user.password),

        // confirm login
        Rx.Observable.of(user),

        // abort login
        Rx.Observable.throw('Invalid credentials.')
      );
    })

    // remove sensible data from user model
    .map(user => {
      delete user.password;

      return user;
    })

    // append token to the user model
    .flatMap(
      user => jwt.sign(user),
      (user, token) => {
        return Object.assign(user, token);
      }
    );

  next();
};

/**
 * It performs the logout process
 * 
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 */
const logout = (req, res, next) => {
  req.source = Rx.Observable.empty();

  next();
};

module.exports = [
  {
    path: '/login',
    handler: login,
    method: 'post',
  },
  {
    path: '/logout',
    handler: logout,
    method: 'post',
  },
  {
    path: '/signup',
    handler: signup,
    method: 'post',
  }
];
