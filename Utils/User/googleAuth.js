import passport from "passport";
import passportGoogle from "passport-google-oauth20";
import User from "../../Models/User/UserDetailsModel.js";
import dotenv from "dotenv";
dotenv.config(); 


passport.use(new passportGoogle.Strategy(
  {
    clientID: process.env.GOOGLE_CLIENTID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://velomax.vishnuc.site/google/authentication",
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let existingUser = await User.findOne({ googleId: profile.id });
      if (existingUser) {
        return done(null, existingUser);
      }

      const newUser = new User({
        firstname: profile.name.givenName,
        lastname: profile.name.familyName,
        email: profile.emails[0].value,
        googleId: profile.id,
        isActive: true,
        isBlock: false,
        isVerified: true,
      });

      await newUser.save();
      return done(null, newUser);
    } catch (error) {
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, { id: user.id, email: user.email, isBlock: user.isBlock });
});

passport.deserializeUser(async (data, done) => {
  try {
    const foundUser = await User.findById(data.id);
    if (foundUser && foundUser.isBlock === false) {
      done(null, foundUser);
    } else {
      done(new Error("User is blocked"), null);
    }
  } catch (error) {
    done(error, null);
  }
});

export default passport;
