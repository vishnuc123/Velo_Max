import mongoose from "mongoose";

// Define the base schema with explicit types
const ebikeSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productDescription: { type: String, required: true },
  coverImage: { type: String },
  additionalImage: [{ type: String }],
  RegularPrice: { type: Number, },
  ListingPrice: { type: Number, },
  Stock: { type: Number },
  Brand: { type: String },
  mudguard: { type: String, required: false },
  brake: { type: Number, required: false },
  lights: { type: mongoose.Schema.Types.Mixed, required: false },
});

export default ebikeSchema;
