const LocalStrategy = require('passport-local').Strategy;

// Load User model
const User = require('../models/user');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user
      User.findUser({
        email: email,
        password:   password
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'Invalid Credentials' });
        } else {
          return done(null, user);
        }
      });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });
};
