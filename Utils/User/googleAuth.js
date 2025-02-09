import passport from "passport";
import passportGoogle from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../../Models/User/UserDetailsModel.js";

dotenv.config();

const GoogleStrategy = passportGoogle.Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENTID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://velomax.vishnuc.site/google/authentication", 
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let existingUser = await User.findOne({ email: profile.emails[0].value });

        if (existingUser) {
          if (!existingUser.googleId) {
            existingUser.googleId = profile.id;
            await existingUser.save();
          }
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
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const foundUser = await User.findById(id);
    if (foundUser && !foundUser.isBlock) {
      done(null, foundUser);
    } else {
      done(new Error("User is blocked"), null);
    }
  } catch (error) {
    done(error, null);
  }
});

export default passport;
