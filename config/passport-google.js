const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  // User.findbyId(id, function (err, user) {
  done(null, user);
  // });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: `${process.env.GOOGLE_CLIENT_ID}`,
      clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
      callbackURL: `${process.env.GOOGLE_CALLBACK_URL}`,
    },
    function (accessToken, refreshToken, profile, done) {
      // use the profle info (mainly profile id) to check if user is registered in the database
      // User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return done(null, profile);
      // });
    }
  )
);
