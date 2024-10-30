import mongoose from "mongoose";

// Define the base schema with explicit types
const ebikeSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productDescription: { type: String, required: true },
  coverImage: { type: String },
  additionalImage: [{ type: String }],
  RegularPrice: { type: Number, required: true },
  ListingPrice: { type: Number, required: true },
  Stock: { type: Number },
  Brand: { type: String },
  sdf: { type: String, required: false },
  dsf: { type: Number, required: false },
  sdf: { type: mongoose.Schema.Types.Mixed, required: false },
});

export default ebikeSchema;
