import mongoose from "mongoose";

// Define the base schema with explicit types
const sadsSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productDescription: { type: String, required: true },
  coverImage: { type: String },
  additionalImage: [{ type: String }],
  RegularPrice: { type: Number, required: true },
  ListingPrice: { type: Number, required: true },
  Stock: { type: Number },
  Brand: { type: String },
  isblocked: { type: Boolean, default: false },
  sdsd: { type: String, required: false },
  sds: { type: String, required: false },
});

export default sadsSchema;
