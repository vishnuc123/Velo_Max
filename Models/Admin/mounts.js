import mongoose from "mongoose";

// Define the base schema with explicit types
const mountsSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productDescription: { type: String, required: true },
  coverImage: { type: String },
  additionalImage: [{ type: String }],
  RegularPrice: { type: Number, required: true },
  ListingPrice: { type: Number, required: true },
  Stock: { type: Number },
  Brand: { type: String },
  isblocked: { type: Boolean, default: false },
  dsf: { type: String, required: false },
  df: { type: Number, required: false },
  sdf: { type: mongoose.Schema.Types.Mixed, required: false },
});

export default mountsSchema;
