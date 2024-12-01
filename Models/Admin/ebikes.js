import mongoose from "mongoose";

// Define the base schema with explicit types
const ebikesSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productDescription: { type: String, required: true },
  coverImage: { type: String },
  additionalImage: [{ type: String }],
  RegularPrice: { type: Number, required: true },
  ListingPrice: { type: Number, required: true },
  Stock: { type: Number },
  Brand: { type: String },
  isblocked: { type: Boolean, default: false },
  Motor: { type: String, required: false },
  Battery: { type: String, required: false },
  Range: { type: String, required: false },
  Frame: { type: String, required: false },
  Brakes: { type: String, required: false },
  Gears: { type: String, required: false },
  Suspension: { type: String, required: false },
  Tires: { type: String, required: false },
  Speed: { type: String, required: false },
  Display: { type: String, required: false },
  Weight: { type: String, required: false },
  Throttle: { type: String, required: false },
  Lights: { type: String, required: false },
  Connectivity: { type: String, required: false },
});

export default ebikesSchema;
