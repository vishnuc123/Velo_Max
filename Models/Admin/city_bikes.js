import mongoose from "mongoose";

// Define the base schema with explicit types
const city_bikesSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  productDescription: { type: String, required: true },
  coverImage: { type: String },
  additionalImage: [{ type: String }],
  RegularPrice: { type: Number, required: true },
  ListingPrice: { type: Number, required: true },
  Stock: { type: Number },
  Brand: { type: String },
  sd: { type: String, required: false },
  sdewre: { type: Number, required: false },
  sewr: { type: mongoose.Schema.Types.Mixed, required: false },
  wer: { type: String, required: false },
  sdaa: { type: String, required: false },
});

export default city_bikesSchema;
