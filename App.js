import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();
import Admin_Route from "./Routes/Admin/adminRoute.js";
import User_Route from "./Routes/User/userRoute.js";
import cors from "cors";

const PORT = process.env.PORT || 5000;

import express from "express";
const app = express();

// app.use(cors());
app.use(cors({
  origin: 'http://192.168.44.223:4000', // Replace with the IP and port of your EJS server
  methods: ['GET', 'POST'], // Add other methods as needed
  credentials: true
}));



import session from "express-session";
import passport from "passport";
import googlestrategy from "passport-google-oauth20";
import user from "./Models/User/UserDetailsModel.js";
import nocache from "nocache";
import cloudinary from "cloudinary";

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
passport.use(
  new googlestrategy(
    {
      clientID: process.env.GOOGLE_CLIENTID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:4000/google/authentication",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let existingUser = await user.findOne({ googleId: profile.email });
        if (existingUser) {
          return done(null, existingUser);
        }

        // Create a new user if not found
        const newUser = new user({
          firstname: profile.name.givenName,
          lastname: profile.name.familyName,
          email: profile.emails[0].value,
          isActive: true,
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

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const foundUser = await user.findById(id);
    done(null, foundUser);
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

app.listen(PORT, "0.0.0.0", () =>
  console.log(`server is running on http://localhost:${PORT}`)
);
