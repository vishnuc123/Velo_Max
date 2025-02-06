import mongoose from "mongoose";

// Define the base schema with explicit types
const oldspokesSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productDescription: { type: String, required: true },
  coverImage: { type: String },
  additionalImage: [{ type: String }],
  RegularPrice: { type: Number, required: true },
  ListingPrice: { type: Number, required: true },
  Stock: { type: Number },
  Brand: { type: String },
  isblocked: { type: Boolean, default: false },
  Frame: { type: String, required: false },
  Wheels: { type: String, required: false },
  Brakes: { type: String, required: false },
  Handlebars: { type: String, required: false },
  Seat: { type: String, required: false },
  Accessories: { type: String, required: false },
  Features: { type: String, required: false },
});

export default oldspokesSchema;
