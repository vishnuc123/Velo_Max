import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import session from "express-session";
import nocache from "nocache";
import passport from "./Utils/User/googleAuth.js"; // Import the Google auth setup
import connectDB from "./Utils/User/connectDB.js"; // Import the MongoDB connection
import Admin_Route from "./Routes/Admin/adminRoute.js";
import User_Route from "./Routes/User/userRoute.js";
import { sseConnect } from "./Utils/Admin/sse.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

const clients = {}; // Store SSE clients

app.use(cors({
  origin: 'http://192.168.44.223:4000',
  methods: ['GET', 'POST'],
  credentials: true
}));

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("Public"));
app.use("/", Admin_Route);
app.use("/", User_Route);
app.set("view engine", "ejs");
app.set("views", "./views");


app.get('/events', sseConnect);


// Start the server
app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
