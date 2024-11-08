import mongoose from "mongoose";

// Define the base schema with explicit types
const bmxSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productDescription: { type: String, required: true },
  coverImage: { type: String },
  additionalImage: [{ type: String }],
  RegularPrice: { type: Number, required: true },
  ListingPrice: { type: Number, required: true },
  Stock: { type: Number },
  Brand: { type: String },
  dsf: { type: String, required: false },
  fgfrg: { type: Number, required: false },
  fgf: { type: mongoose.Schema.Types.Mixed, required: false },
  fgffd: { type: String, required: false },
});

export default bmxSchema;
