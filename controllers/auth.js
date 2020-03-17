// Load required packages
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var User = require('../models/user');
var logger = require('../config/winston')

passport.use(new BasicStrategy(
  function(username, password, callback) {
    console.log('isAuthenticated: method called');
    logger.info('info','isAuthenticated: method called');
    User.findOne({
      where: {
        username: username
      }
    }).then((user) => {
      if (!user || !user.comparePassword(password)) {
        console.log('isAuthenticated: no user found or password mismatch');
        logger.info('error','isAuthenticated: no user found or password mismatch');
        return callback(null, false);
      }

      console.log('isAuthenticated: success');
      logger.info('info','isAuthenticated: success');
      // Success
      return callback(null, user);
    }).catch((err) => {
      if (err) {
        console.log('isAuthenticated: ', err);
        logger.info('error','isAuthenticated: ' + err);
        return callback(err);
      }
    });
  }
));

exports.isAuthenticated = passport.authenticate('basic', { session : false });