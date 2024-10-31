import mongoose from "mongoose";

// Define the base schema with explicit types
const city_bikeSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productDescription: { type: String, required: true },
  coverImage: { type: String },
  additionalImage: [{ type: String }],
  RegularPrice: { type: Number, required: true },
  ListingPrice: { type: Number, required: true },
  Stock: { type: Number },
  Brand: { type: String },
  dsf: { type: String, required: false },
  sdf: { type: Number, required: false },
  sdfdfsd: { type: mongoose.Schema.Types.Mixed, required: false },
});

export default city_bikeSchema;
