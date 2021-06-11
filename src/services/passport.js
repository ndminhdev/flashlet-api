import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/user.model';

import { JWT_SECRET } from '../utils/secrets';

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET
};

const configurePassportAuth = (passport) => {
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  passport.use(
    new JwtStrategy(options, (payload, done) => {
      User.findById(payload.id)
        .then((user) => {
          if (user) {
            done(null, user);
          } else {
            done(null, false);
          }
        })
        .catch((err) => done(err, false));
    })
  );
};

export default configurePassportAuth;
