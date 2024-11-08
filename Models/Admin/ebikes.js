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
  asfd: { type: String, required: false },
  sadada: { type: Number, required: false },
  asdada: { type: mongoose.Schema.Types.Mixed, required: false },
  sadd: { type: Number, required: false },
  asdasda: { type: String, required: false },
});

export default ebikesSchema;
