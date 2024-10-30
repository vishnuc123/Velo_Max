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
  sad: { type: String, required: false },
  asd: { type: Number, required: false },
  asda: { type: String, required: false },
  asdad: { type: mongoose.Schema.Types.Mixed, required: false },
  sadd: { type: mongoose.Schema.Types.Mixed, required: false },
});

export default city_bikeSchema;
