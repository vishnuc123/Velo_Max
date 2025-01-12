import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();
import Admin_Route from "./Routes/Admin/adminRoute.js";
import User_Route from "./Routes/User/userRoute.js";
import User from "./Models/User/UserDetailsModel.js";
import cors from "cors";

const PORT = process.env.PORT || 5000;

import express from "express";
const app = express();

// app.use(cors());
app.use(cors({
  origin: 'http://192.168.44.223:4000', 
  methods: ['GET', 'POST'], 
  credentials: true
}));



import session from "express-session";
import passport from "passport";
import passportGoogle from "passport-google-oauth20";
import nocache from "nocache";
// import cloudinary from "cloudinary";

app.use(nocache());
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());



passport.use(new passportGoogle.Strategy(
  {
    clientID: process.env.GOOGLE_CLIENTID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:4000/google/authentication",
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let existingUser = await User.findOne({ googleId: profile.id }); // Use profile.id for googleId
      if (existingUser) {
        return done(null, existingUser);
      }

      // Create a new user if not found
      const newUser = new User({
        firstname: profile.name.givenName,
        lastname: profile.name.familyName,
        email: profile.emails[0].value, // Store email
        googleId: profile.id, // Store Google ID
        isActive: true, // Default to active
        isBlock: false, // Default to not blocked
        isVerified: true, // Default to verified
      });

      await newUser.save(); // Save the new user to the database
      return done(null, newUser); // Return the new user
    } catch (error) {
      return done(error, null); // Return any error that occurs
    }
  }
));


passport.serializeUser((user, done) => {
  done(null, { id: user.id, email: user.email, isBlock: user.isBlock }); // Serialize necessary data
});

passport.deserializeUser(async (data, done) => {
  try {
    const foundUser = await User.findById(data.id); // Find user by ID
    if (foundUser && foundUser.isBlock === false) { // Ensure user is not blocked
      done(null, foundUser);
    } else {
      done(new Error("User is blocked"), null);
    }
  } catch (error) {
    done(error, null);
  }
});





mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("connected to mongodb"))
  .catch((err) => console.error("failet to connect", err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("Public"));
app.use("/", Admin_Route);
app.use("/", User_Route);
app.set("view engine", "ejs");
app.set("views", "./views");

app.listen(PORT, "127.0.0.1", () =>
  console.log(`server is running on http://localhost:${PORT}`)
);
