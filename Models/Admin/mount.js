import mongoose from "mongoose";

// Define the base schema with explicit types
const mountSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productDescription: { type: String, required: true },
  coverImage: { type: String },
  additionalImage: [{ type: String }],
  RegularPrice: { type: Number, required: true },
  ListingPrice: { type: Number, required: true },
  Stock: { type: Number },
  Brand: { type: String },
  isblocked: { type: Boolean, default: false },
  sdss: { type: String, required: false },
  sds: { type: Number, required: false },
  sds: { type: mongoose.Schema.Types.Mixed, required: false },
});

export default mountSchema;
