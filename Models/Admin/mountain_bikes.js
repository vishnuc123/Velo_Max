import mongoose from "mongoose";

// Define the base schema with explicit types
const mountain_bikesSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productDescription: { type: String, required: true },
  coverImage: { type: String },
  additionalImage: [{ type: String }],
  RegularPrice: { type: Number, required: true },
  ListingPrice: { type: Number, required: true },
  Stock: { type: Number },
  Brand: { type: String },
  isblocked: { type: Boolean, default: false },
  mudguard: { type: String, required: false },
  frame: { type: String, required: false },
});

export default mountain_bikesSchema;
