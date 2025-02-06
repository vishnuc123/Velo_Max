import mongoose from "mongoose";

// Define the base schema with explicit types
const kidsSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productDescription: { type: String, required: true },
  coverImage: { type: String },
  additionalImage: [{ type: String }],
  RegularPrice: { type: Number, required: true },
  ListingPrice: { type: Number, required: true },
  Stock: { type: Number },
  Brand: { type: String },
  isblocked: { type: Boolean, default: false },
  Size: { type: String, required: false },
  Weight: { type: String, required: false },
  Motor: { type: String, required: false },
  Battery: { type: String, required: false },
  Range: { type: String, required: false },
  Gearing: { type: String, required: false },
  Crankset: { type: String, required: false },
  Safety: { type: String, required: false },
  Tires: { type: String, required: false },
  Suspension: { type: String, required: false },
  Display: { type: String, required: false },
  Features: { type: String, required: false },
});

export default kidsSchema;
